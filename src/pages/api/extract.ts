import type { NextApiRequest, NextApiResponse } from "next";
import { extractActionItems } from "@/lib/extract";
import { getWorkspace } from "@/lib/linear";
import { matchAssignee } from "@/lib/match";
import type { ReviewItem, ExtractionResult, LinearTeam } from "@/lib/types";

interface ExtractApiResponse {
  meeting_summary: string;
  decisions: string[];
  items: ReviewItem[];
  teams: LinearTeam[];
  default_team_id: string | null;
}

interface ErrorResponse {
  error: string;
}

export const config = {
  maxDuration: 60,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtractApiResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const transcript = (req.body?.transcript ?? "").toString().trim();
  if (!transcript) {
    return res.status(400).json({ error: "transcript is required" });
  }
  if (transcript.length > 100_000) {
    return res.status(400).json({ error: "transcript too long (max 100k chars)" });
  }

  let extraction: ExtractionResult;
  try {
    extraction = await extractActionItems(transcript);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed";
    return res.status(500).json({ error: message });
  }

  // Fetch workspace in parallel-friendly way; failure here is non-fatal — we return the
  // extraction without assignee matching so the user can still review.
  let teams: LinearTeam[] = [];
  let users: { id: string; name: string; displayName: string; email: string }[] = [];
  try {
    const workspace = await getWorkspace();
    teams = workspace.teams;
    users = workspace.users;
  } catch (err) {
    console.error("Linear workspace fetch failed:", err);
  }

  const defaultTeamId = teams[0]?.id ?? null;

  const items: ReviewItem[] = extraction.action_items.map((item) => {
    const match = matchAssignee(item.assignee_hint, users);
    return {
      ...item,
      assignee_user_id: match?.user.id ?? null,
      match_score: match?.score ?? null,
      team_id: defaultTeamId,
    };
  });

  return res.status(200).json({
    meeting_summary: extraction.meeting_summary,
    decisions: extraction.decisions,
    items,
    teams,
    default_team_id: defaultTeamId,
  });
}
