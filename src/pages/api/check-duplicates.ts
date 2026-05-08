import type { NextApiRequest, NextApiResponse } from "next";
import { LinearClient } from "@linear/sdk";

interface DuplicateMatch {
  itemId: string;
  itemTitle: string;
  matches: Array<{
    identifier: string;
    title: string;
    url: string;
    similarity: number;
  }>;
}

interface ResponsePayload {
  duplicates: DuplicateMatch[];
}

interface ErrorResponse {
  error: string;
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2)
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const t of a) if (b.has(t)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponsePayload | ErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "LINEAR_API_KEY not set" });

  const items = req.body?.items as Array<{ id: string; title: string }> | undefined;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "No items provided" });
  }

  try {
    const client = new LinearClient({ apiKey });
    const conn = await client.issues({
      first: 100,
      filter: { state: { type: { nin: ["completed", "canceled"] } } },
    });

    const existing = conn.nodes.map((iss) => ({
      identifier: iss.identifier,
      title: iss.title,
      url: iss.url,
      tokens: tokenize(iss.title),
    }));

    const duplicates: DuplicateMatch[] = [];
    for (const item of items) {
      const itemTokens = tokenize(item.title);
      const matches = existing
        .map((e) => ({
          identifier: e.identifier,
          title: e.title,
          url: e.url,
          similarity: jaccard(itemTokens, e.tokens),
        }))
        .filter((m) => m.similarity >= 0.5)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3);

      if (matches.length > 0) {
        duplicates.push({
          itemId: item.id,
          itemTitle: item.title,
          matches,
        });
      }
    }

    return res.status(200).json({ duplicates });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lookup failed";
    return res.status(500).json({ error: message });
  }
}
