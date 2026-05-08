import crypto from "crypto";
import type { NextApiRequest } from "next";

export function verifySlackSignature(
  req: NextApiRequest,
  rawBody: string
): boolean {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  if (!signingSecret) return false;

  const timestamp = req.headers["x-slack-request-timestamp"];
  const signature = req.headers["x-slack-signature"];
  if (typeof timestamp !== "string" || typeof signature !== "string") {
    return false;
  }

  // Reject requests older than 5 minutes
  const fiveMinutes = 60 * 5;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > fiveMinutes) {
    return false;
  }

  const baseString = `v0:${timestamp}:${rawBody}`;
  const expected =
    "v0=" +
    crypto
      .createHmac("sha256", signingSecret)
      .update(baseString)
      .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    );
  } catch {
    return false;
  }
}

export async function postToSlack(
  channel: string,
  blocks: object[],
  text: string
): Promise<void> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error("SLACK_BOT_TOKEN not set");

  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ channel, blocks, text }),
  });

  const data = (await res.json()) as { ok: boolean; error?: string };
  if (!data.ok) throw new Error(data.error ?? "Slack postMessage failed");
}

export async function respondToSlack(
  responseUrl: string,
  blocks: object[],
  text: string,
  replaceOriginal = false
): Promise<void> {
  await fetch(responseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      blocks,
      text,
      replace_original: replaceOriginal,
      response_type: "ephemeral",
    }),
  });
}

export function buildExtractionBlocks(
  items: Array<{
    id: string;
    title: string;
    priority: string;
    confidence: number;
    assignee_hint: string | null;
  }>,
  payloadKey: string
): object[] {
  const high = items.filter((i) => i.confidence >= 0.85).length;
  const med = items.filter((i) => i.confidence >= 0.7 && i.confidence < 0.85).length;
  const low = items.filter((i) => i.confidence < 0.7).length;

  const blocks: object[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `🪄 Found ${items.length} action items`,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `*Confidence:* ${high} high · ${med} medium · ${low} need review`,
        },
      ],
    },
    { type: "divider" },
  ];

  for (const item of items.slice(0, 8)) {
    const emoji =
      item.priority === "urgent"
        ? "🔴"
        : item.priority === "high"
          ? "🟠"
          : item.priority === "medium"
            ? "🔵"
            : "⚪️";
    const conf =
      item.confidence >= 0.85 ? "✅" : item.confidence >= 0.7 ? "⚠️" : "❓";
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${emoji} *${item.title}*\n${conf} ${item.confidence.toFixed(2)} · ${item.assignee_hint ?? "_unassigned_"}`,
      },
    });
  }

  if (items.length > 8) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `+ ${items.length - 8} more — review on the web`,
        },
      ],
    });
  }

  blocks.push({ type: "divider" });
  blocks.push({
    type: "actions",
    elements: [
      {
        type: "button",
        style: "primary",
        text: { type: "plain_text", text: "Push all to Linear" },
        action_id: "push_to_linear",
        value: payloadKey,
      },
      {
        type: "button",
        text: { type: "plain_text", text: "Review on web" },
        url: `${process.env.TICKETFORGE_URL ?? "https://ticketforge.aryangorde.com"}/extract`,
        action_id: "review_web",
      },
    ],
  });

  return blocks;
}
