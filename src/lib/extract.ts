// Llama 3.3 70B via Groq for structured extraction. Migrated from Gemini due to
// free tier rate limits and reliability issues. Groq's JSON mode guarantees
// valid JSON syntax but not schema adherence, so we validate with Zod and
// retry once on schema-validation failure with a stricter instruction.

import Groq from "groq-sdk";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import type { ExtractionResult } from "./types";

const MODEL = "llama-3.3-70b-versatile";

const ActionItemSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  assignee_hint: z.string().nullable(),
  priority: z.enum(["urgent", "high", "medium", "low"]),
  due_date_hint: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  source_quote: z.string().min(1),
});

const ExtractionSchema = z.object({
  meeting_summary: z.string(),
  decisions: z.array(z.string()),
  action_items: z.array(ActionItemSchema),
  manual_time_estimate_minutes: z.number().min(0).max(240),
  manual_time_reasoning: z.string(),
});

const SCHEMA_TS = `interface ActionItem {
  title: string;                                          // imperative, < 80 chars
  description: string;                                    // 1-2 sentences of context
  assignee_hint: string | null;                           // first name from transcript, or null
  priority: "urgent" | "high" | "medium" | "low";
  due_date_hint: string | null;                           // ISO date "YYYY-MM-DD" or relative phrase ("by Friday"), or null
  confidence: number;                                     // 0.0 to 1.0 inclusive
  source_quote: string;                                   // verbatim sentence(s) from the transcript
}

interface ExtractionResult {
  meeting_summary: string;                                // 2-3 sentence overview
  decisions: string[];                                    // non-actionable conclusions
  action_items: ActionItem[];
  manual_time_estimate_minutes: number;                   // honest estimate of how long a human would spend doing this manually
  manual_time_reasoning: string;                          // 1 sentence justifying the estimate
}`;

function buildSystemPrompt(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `You are an expert meeting analyst. You convert meeting transcripts into structured JSON describing the action items and decisions.

You return ONLY valid JSON. No markdown code fences. No prose before or after the JSON. No commentary. No explanation. The first character of your response must be \`{\` and the last character must be \`}\`.

The JSON must match this TypeScript schema EXACTLY — same field names, same types, no extra fields, no missing fields:

${SCHEMA_TS}

CONFIDENCE RUBRIC (be calibrated, not optimistic):
- 0.90–1.00: explicit commitment with a named owner. Example: "Sarah, can you have X by Friday?" → Sarah agrees.
- 0.70–0.89: clear commitment but some ambiguity (owner implied but not named, or deadline fuzzy, or scope slightly unclear).
- 0.50–0.69: weak signal. "We should look into X", "someone needs to do Y", no explicit owner.
- Below 0.50: skip entirely. Do not include speculative, hypothetical, or aspirational statements.

PRIORITY RUBRIC:
- "urgent": blocker language, "ASAP", "before [imminent date]", launch dependencies, on-call/outage.
- "high": "this week", "next sprint", "important", "high priority".
- "medium": "soon", "next month", "next quarter", standard planned work.
- "low": "at some point", "eventually", "on the radar", "when we get a chance".

ACTION ITEMS vs DECISIONS:
- An action_item has a doer and a thing-to-do. It produces work.
- A decision is a conclusion reached without an action owner (e.g., "we decided to deprecate v1 by Q3"). It is captured for the record.
- Do not duplicate the same statement across both arrays. If a decision implies follow-up work, capture the work as the action_item and the conclusion as the decision — but pick the framing that fits best and use it once.

MANUAL TIME ESTIMATE (be honest, not promotional):
Estimate how long a human PM would realistically spend converting this transcript into properly-formatted tickets BY HAND. This includes: re-reading the transcript, identifying action items, switching to Linear, creating each ticket, writing a title and description, finding the right assignee, setting priority, parsing the due date, and pasting source context. Calibrate against:
- 0 items: ~1 min (still had to read the transcript to confirm there's nothing).
- Per item with a clear owner and deadline: 2–3 min each.
- Per item with ambiguous owner / fuzzy deadline / requires re-reading transcript: 4–6 min each.
- Plus a 1–2 min overhead for opening Linear, finding the right team/project, and context-switching.
- A trivial one-line transcript with one obvious action ≈ 2–3 minutes total. Do NOT inflate this.
- A 30-line meeting with 5 mixed-clarity items ≈ 20–30 minutes total.
manual_time_reasoning must be a single sentence explaining the math (e.g. "5 items × ~3 min each + 2 min overhead").

OTHER RULES:
- title: imperative voice, under 80 characters, starts with a verb. "Investigate Stripe payment timeout" not "Stripe issue".
- description: 1–2 sentences of context drawn from the transcript. Include the WHY when stated. No filler.
- assignee_hint: first name (or full name) of the person who took the action, exactly as it appears in the transcript. null if not stated.
- due_date_hint: ISO date "YYYY-MM-DD" if a specific date was given (today is ${today}; resolve "May 15" to "${today.slice(0, 4)}-05-15"), or a verbatim relative phrase if that's all that was said ("by Friday", "next sprint", "end of Q3"). null if no deadline was mentioned.
- source_quote: verbatim sentence(s) from the input transcript that justify this extraction. Do not paraphrase, do not edit, do not summarize. Copy the exact text.
- confidence: must be a number between 0 and 1 inclusive.
- priority: must be exactly one of "urgent", "high", "medium", "low" — lowercase, no other values.

Output the JSON object now. Nothing else.`;
}

function stripCodeFences(text: string): string {
  let t = text.trim();
  // Strip ```json ... ``` or ``` ... ``` wrappers if Llama emits them despite instructions.
  const fence = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fence) t = fence[1].trim();
  // Some models emit prose followed by JSON; grab the first balanced object.
  if (t[0] !== "{") {
    const start = t.indexOf("{");
    const end = t.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      t = t.slice(start, end + 1);
    }
  }
  return t;
}

function tryParse(raw: string): z.infer<typeof ExtractionSchema> {
  const cleaned = stripCodeFences(raw);
  const json = JSON.parse(cleaned);
  return ExtractionSchema.parse(json);
}

let cachedClient: Groq | null = null;
function getClient(): Groq {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");
  cachedClient = new Groq({ apiKey });
  return cachedClient;
}

async function callGroq(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const client = getClient();
  const resp = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.1,
    max_tokens: 4096,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });
  return resp.choices[0]?.message?.content ?? "";
}

export async function extractActionItems(
  transcript: string
): Promise<ExtractionResult> {
  const systemPrompt = buildSystemPrompt();
  const baseUserMessage = `Extract action items and decisions from the following meeting transcript:\n\n${transcript}`;

  const firstRaw = await callGroq(systemPrompt, baseUserMessage);
  console.log("[extract] attempt 1 raw response:", firstRaw.slice(0, 500));

  let parsed: z.infer<typeof ExtractionSchema>;
  try {
    parsed = tryParse(firstRaw);
  } catch (firstErr) {
    console.warn(
      "[extract] attempt 1 failed validation:",
      firstErr instanceof Error ? firstErr.message : String(firstErr)
    );

    const retryUser = `Your previous response failed schema validation. The response MUST be valid JSON matching the schema in the system prompt exactly. No extra fields, no missing fields, all enums spelled exactly. Try again.\n\n${baseUserMessage}`;

    const secondRaw = await callGroq(systemPrompt, retryUser);
    console.log("[extract] attempt 2 raw response:", secondRaw.slice(0, 500));

    try {
      parsed = tryParse(secondRaw);
    } catch (secondErr) {
      const message =
        secondErr instanceof Error ? secondErr.message : String(secondErr);
      throw new Error(
        `Groq extraction failed after retry. Last validation error: ${message}\n\nLast raw response:\n${secondRaw.slice(0, 2000)}`
      );
    }
  }

  return {
    meeting_summary: parsed.meeting_summary,
    decisions: parsed.decisions,
    manual_time_estimate_minutes: Math.max(0, Math.round(parsed.manual_time_estimate_minutes)),
    manual_time_reasoning: parsed.manual_time_reasoning,
    action_items: parsed.action_items.map((item) => ({
      ...item,
      id: uuidv4(),
      confidence: Math.max(0, Math.min(1, item.confidence)),
    })),
  };
}
