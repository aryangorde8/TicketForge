import type { NextApiRequest, NextApiResponse } from "next";
import { createIssues, getWorkspace } from "@/lib/linear";
import type { ReviewItem, PushResult } from "@/lib/types";

interface PushApiResponse {
  created: PushResult[];
}

interface ErrorResponse {
  error: string;
}

export const config = {
  maxDuration: 60,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PushApiResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const items = req.body?.items as ReviewItem[] | undefined;
  let teamId = (req.body?.team_id ?? "").toString();

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "No items to push" });
  }

  if (!teamId) {
    try {
      const ws = await getWorkspace();
      teamId = ws.teams[0]?.id ?? "";
    } catch (err) {
      return res.status(500).json({
        error: `Could not load Linear workspace: ${
          err instanceof Error ? err.message : String(err)
        }`,
      });
    }
  }

  if (!teamId) {
    return res.status(400).json({ error: "No Linear team available" });
  }

  try {
    const created = await createIssues(items, teamId);
    return res.status(200).json({ created });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Push failed";
    return res.status(500).json({ error: message });
  }
}
