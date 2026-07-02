"""Structured extraction via Groq / Llama 3.3 70B — port of `src/lib/extract.ts`.

Groq's JSON mode guarantees valid JSON syntax but not schema adherence, so we
validate with Pydantic (in place of Zod) and retry once on a validation failure
with a stricter instruction.
"""

from __future__ import annotations

import json
import logging
import re
import uuid
from datetime import date

from groq import Groq
from pydantic import ValidationError

from .config import settings
from .models import ActionItem, ExtractionRaw, ExtractionResult

log = logging.getLogger("ticketforge.extract")

SCHEMA_TS = """interface ActionItem {
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
}"""

_FENCE_RE = re.compile(r"^```(?:json)?\s*([\s\S]*?)\s*```$")


def _build_system_prompt() -> str:
    today = date.today().isoformat()
    year = today[:4]
    return f"""You are an expert meeting analyst. You convert meeting transcripts into structured JSON describing the action items and decisions.

You return ONLY valid JSON. No markdown code fences. No prose before or after the JSON. No commentary. No explanation. The first character of your response must be `{{` and the last character must be `}}`.

The JSON must match this TypeScript schema EXACTLY — same field names, same types, no extra fields, no missing fields:

{SCHEMA_TS}

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
- due_date_hint: ISO date "YYYY-MM-DD" if a specific date was given (today is {today}; resolve "May 15" to "{year}-05-15"), or a verbatim relative phrase if that's all that was said ("by Friday", "next sprint", "end of Q3"). null if no deadline was mentioned.
- source_quote: verbatim sentence(s) from the input transcript that justify this extraction. Do not paraphrase, do not edit, do not summarize. Copy the exact text.
- confidence: must be a number between 0 and 1 inclusive.
- priority: must be exactly one of "urgent", "high", "medium", "low" — lowercase, no other values.

Output the JSON object now. Nothing else."""


def _strip_code_fences(text: str) -> str:
    t = text.strip()
    fence = _FENCE_RE.match(t)
    if fence:
        t = fence.group(1).strip()
    if t and t[0] != "{":
        start = t.find("{")
        end = t.rfind("}")
        if start != -1 and end != -1 and end > start:
            t = t[start : end + 1]
    return t


def _try_parse(raw: str) -> ExtractionRaw:
    cleaned = _strip_code_fences(raw)
    data = json.loads(cleaned)
    return ExtractionRaw.model_validate(data)


_client: Groq | None = None


def _get_client() -> Groq:
    global _client
    if _client is not None:
        return _client
    if not settings.GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not set")
    _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client


def _call_groq(system_prompt: str, user_message: str) -> str:
    client = _get_client()
    resp = client.chat.completions.create(
        model=settings.EXTRACT_MODEL,
        temperature=0.1,
        max_tokens=4096,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
    )
    return resp.choices[0].message.content or ""


def extract_action_items(transcript: str) -> ExtractionResult:
    system_prompt = _build_system_prompt()
    base_user = (
        "Extract action items and decisions from the following meeting transcript:\n\n"
        + transcript
    )

    first_raw = _call_groq(system_prompt, base_user)
    log.info("[extract] attempt 1 raw response: %s", first_raw[:500])

    try:
        parsed = _try_parse(first_raw)
    except (json.JSONDecodeError, ValidationError) as first_err:
        log.warning("[extract] attempt 1 failed validation: %s", first_err)
        retry_user = (
            "Your previous response failed schema validation. The response MUST be "
            "valid JSON matching the schema in the system prompt exactly. No extra "
            "fields, no missing fields, all enums spelled exactly. Try again.\n\n"
            + base_user
        )
        second_raw = _call_groq(system_prompt, retry_user)
        log.info("[extract] attempt 2 raw response: %s", second_raw[:500])
        try:
            parsed = _try_parse(second_raw)
        except (json.JSONDecodeError, ValidationError) as second_err:
            raise RuntimeError(
                f"Groq extraction failed after retry. Last validation error: "
                f"{second_err}\n\nLast raw response:\n{second_raw[:2000]}"
            ) from second_err

    return ExtractionResult(
        meeting_summary=parsed.meeting_summary,
        decisions=parsed.decisions,
        manual_time_estimate_minutes=max(0, round(parsed.manual_time_estimate_minutes)),
        manual_time_reasoning=parsed.manual_time_reasoning,
        action_items=[
            ActionItem(
                id=str(uuid.uuid4()),
                title=item.title,
                description=item.description,
                assignee_hint=item.assignee_hint,
                priority=item.priority,
                due_date_hint=item.due_date_hint,
                confidence=max(0.0, min(1.0, item.confidence)),
                source_quote=item.source_quote,
            )
            for item in parsed.action_items
        ],
    )
