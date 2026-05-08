import type { NextApiRequest, NextApiResponse } from "next";
import { createIssues } from "@/lib/linear";
import { respondToSlack, verifySlackSignature } from "@/lib/slack";
import { getSlackPayload } from "./command";

export const config = {
  api: { bodyParser: false },
  maxDuration: 60,
};

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

interface SlackPayload {
  type: string;
  response_url: string;
  actions?: Array<{ action_id: string; value: string }>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const raw = await readRawBody(req);
  if (!verifySlackSignature(req, raw)) {
    return res.status(401).json({ error: "invalid signature" });
  }

  const body = parseFormBody(raw);
  const payload = JSON.parse(body.payload ?? "{}") as SlackPayload;
  const action = payload.actions?.[0];
  if (!action) return res.status(200).end();

  res.status(200).end();

  if (action.action_id === "push_to_linear") {
    const stored = getSlackPayload(action.value);
    if (!stored) {
      await respondToSlack(
        payload.response_url,
        [
          {
            type: "section",
            text: { type: "mrkdwn", text: "⚠️ Session expired. Run `/ticketforge` again." },
          },
        ],
        "Session expired",
        true
      );
      return;
    }

    try {
      const created = await createIssues(stored.items, stored.teamId);
      const lines = created
        .map((c) => `• <${c.url}|${c.identifier}> ${c.title}`)
        .join("\n");
      await respondToSlack(
        payload.response_url,
        [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `✅ *Pushed ${created.length} issues to Linear*\n${lines}`,
            },
          },
        ],
        `Pushed ${created.length} issues`,
        true
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Push failed";
      await respondToSlack(
        payload.response_url,
        [
          {
            type: "section",
            text: { type: "mrkdwn", text: `❌ *Push failed*\n${msg}` },
          },
        ],
        `Push failed: ${msg}`,
        true
      );
    }
  }
}
