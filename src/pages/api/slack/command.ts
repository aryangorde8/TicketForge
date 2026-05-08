import type { NextApiRequest, NextApiResponse } from "next";
import { extractActionItems } from "@/lib/extract";
import { getWorkspace } from "@/lib/linear";
import { matchAssignee } from "@/lib/match";
import {
  buildExtractionBlocks,
  respondToSlack,
  verifySlackSignature,
} from "@/lib/slack";
import type { ReviewItem } from "@/lib/types";

export const config = {
  api: { bodyParser: false },
  maxDuration: 60,
};

const slackPayloads = new Map<
  string,
  { items: ReviewItem[]; teamId: string; ts: number }
>();

export function getSlackPayload(key: string) {
  return slackPayloads.get(key);
}

async function readRawBody(req: NextApiRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function parseFormBody(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of raw.split("&")) {
    const [k, v] = part.split("=");
    if (k) out[decodeURIComponent(k)] = decodeURIComponent((v ?? "").replace(/\+/g, " "));
  }
  return out;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const raw = await readRawBody(req);
  if (!verifySlackSignature(req, raw)) {
    return res.status(401).json({ error: "invalid signature" });
  }

  const body = parseFormBody(raw);
  const transcript = (body.text ?? "").trim();
  const responseUrl = body.response_url;

  if (!transcript) {
    return res.status(200).json({
      response_type: "ephemeral",
      text: "Paste a transcript after the command: `/ticketforge <transcript>`",
    });
  }

  // Acknowledge immediately so Slack doesn't time out
  res.status(200).json({
    response_type: "ephemeral",
    text: "🪄 Extracting action items… give me 3 seconds.",
  });

  // Do the work async and post back to response_url
  void (async () => {
    try {
      const extraction = await extractActionItems(transcript);
      const ws = await getWorkspace();
      const items: ReviewItem[] = extraction.action_items.map((it) => {
        const match = matchAssignee(it.assignee_hint, ws.users);
        return {
          ...it,
          assignee_user_id: match?.user.id ?? null,
          match_score: match?.score ?? null,
          team_id: ws.teams[0]?.id ?? null,
        };
      });

      const key = `slk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      slackPayloads.set(key, {
        items,
        teamId: ws.teams[0]?.id ?? "",
        ts: Date.now(),
      });

      // Cleanup old payloads (>1 hour)
      for (const [k, v] of slackPayloads) {
        if (Date.now() - v.ts > 60 * 60 * 1000) slackPayloads.delete(k);
      }

      const blocks = buildExtractionBlocks(items, key);
      await respondToSlack(
        responseUrl,
        blocks,
        `Found ${items.length} action items`,
        true
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Extraction failed";
      await respondToSlack(
        responseUrl,
        [
          {
            type: "section",
            text: { type: "mrkdwn", text: `❌ *Extraction failed*\n${msg}` },
          },
        ],
        `Extraction failed: ${msg}`,
        true
      );
    }
  })();
}
