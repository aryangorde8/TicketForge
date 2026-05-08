import type { NextApiRequest, NextApiResponse } from "next";
import { getStalledIssues, getWorkspace } from "@/lib/linear";
import { matchAssignee } from "@/lib/match";
import type { StalledIssue } from "@/lib/types";

interface StalledResponse {
  issues: StalledIssue[];
  groupedByAssignee: Record<string, StalledIssue[]>;
}

interface ErrorResponse {
  error: string;
}

export const config = {
  maxDuration: 30,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StalledResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const assigneeHints = (req.body?.assignee_hints ?? []) as string[];
  const staleDays = Number(req.body?.stale_days ?? 7);

  try {
    const ws = await getWorkspace();

    let assigneeIds: string[] | undefined;
    if (Array.isArray(assigneeHints) && assigneeHints.length > 0) {
      const ids = new Set<string>();
      for (const hint of assigneeHints) {
        if (!hint) continue;
        const match = matchAssignee(hint, ws.users);
        if (match && match.score >= 0.7) ids.add(match.user.id);
      }
      assigneeIds = Array.from(ids);
      if (assigneeIds.length === 0) {
        return res.status(200).json({ issues: [], groupedByAssignee: {} });
      }
    }

    const issues = await getStalledIssues({
      assigneeIds,
      staleDays,
      limit: 50,
    });

    const groupedByAssignee: Record<string, StalledIssue[]> = {};
    for (const issue of issues) {
      const key = issue.assigneeName ?? "Unassigned";
      if (!groupedByAssignee[key]) groupedByAssignee[key] = [];
      groupedByAssignee[key].push(issue);
    }

    return res.status(200).json({ issues, groupedByAssignee });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch stalled issues";
    return res.status(500).json({ error: message });
  }
}
