import type { NextApiRequest, NextApiResponse } from "next";
import { createIssues, getWorkspace } from "@/lib/linear";
import { createGitHubIssues } from "@/lib/github";
import type { ReviewItem, PushResult } from "@/lib/types";

interface PushApiResponse {
  created: PushResult[];
  destination: string;
}

interface ErrorResponse {
  error: string;
}

export const config = {
  maxDuration: 60,
};

type Destination = "linear" | "github";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PushApiResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const items = req.body?.items as ReviewItem[] | undefined;
  const destination = (req.body?.destination ?? "linear") as Destination;
  let teamId = (req.body?.team_id ?? "").toString();

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "No items to push" });
  }

  try {
    if (destination === "github") {
      const created = await createGitHubIssues(items);
      return res.status(200).json({ created, destination });
    }

    if (!teamId) {
      const ws = await getWorkspace();
      teamId = ws.teams[0]?.id ?? "";
    }
    if (!teamId) {
      return res.status(400).json({ error: "No Linear team available" });
    }
    const created = await createIssues(items, teamId);
    return res.status(200).json({ created, destination });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Push failed";
    return res.status(500).json({ error: message });
  }
}
