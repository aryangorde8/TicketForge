import { LinearClient } from "@linear/sdk";
import type {
  LinearTeam,
  LinearUser,
  LinearWorkspace,
  ReviewItem,
  PushResult,
  Priority,
} from "./types";

let cachedClient: LinearClient | null = null;
let cachedWorkspace: { data: LinearWorkspace; ts: number } | null = null;
const WORKSPACE_TTL_MS = 5 * 60 * 1000;

function getClient(): LinearClient {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) throw new Error("LINEAR_API_KEY is not set");
  cachedClient = new LinearClient({ apiKey });
  return cachedClient;
}

export async function getWorkspace(): Promise<LinearWorkspace> {
  if (cachedWorkspace && Date.now() - cachedWorkspace.ts < WORKSPACE_TTL_MS) {
    return cachedWorkspace.data;
  }

  const client = getClient();
  const [teamsConn, usersConn] = await Promise.all([
    client.teams({ first: 50 }),
    client.users({ first: 250 }),
  ]);

  const teams: LinearTeam[] = teamsConn.nodes.map((t) => ({
    id: t.id,
    name: t.name,
    key: t.key,
  }));

  const users: LinearUser[] = usersConn.nodes
    .filter((u) => !u.active === false)
    .map((u) => ({
      id: u.id,
      name: u.name,
      displayName: u.displayName,
      email: u.email,
    }));

  const data: LinearWorkspace = { teams, users };
  cachedWorkspace = { data, ts: Date.now() };
  return data;
}

// Linear priority: 0 = none, 1 = urgent, 2 = high, 3 = medium, 4 = low
function priorityToLinear(p: Priority): number {
  switch (p) {
    case "urgent":
      return 1;
    case "high":
      return 2;
    case "medium":
      return 3;
    case "low":
      return 4;
  }
}

function buildDescription(item: ReviewItem): string {
  const parts: string[] = [item.description.trim()];
  if (item.due_date_hint) {
    parts.push(`\n**Due:** ${item.due_date_hint}`);
  }
  parts.push(
    `\n---\n**Source from transcript:**\n> ${item.source_quote.replace(/\n/g, "\n> ")}`
  );
  parts.push(
    `\n_Extracted by TicketForge with confidence ${(item.confidence * 100).toFixed(0)}%._`
  );
  return parts.join("\n");
}

function parseDueDate(hint: string | null): string | undefined {
  if (!hint) return undefined;
  // Accept ISO date or YYYY-MM-DD; otherwise leave unset and keep the hint in the description.
  const iso = hint.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  return undefined;
}

export async function createIssues(
  items: ReviewItem[],
  defaultTeamId: string
): Promise<PushResult[]> {
  const client = getClient();
  const results: PushResult[] = [];

  for (const item of items) {
    const teamId = item.team_id || defaultTeamId;
    const payload = await client.createIssue({
      teamId,
      title: item.title,
      description: buildDescription(item),
      priority: priorityToLinear(item.priority),
      assigneeId: item.assignee_user_id || undefined,
      dueDate: parseDueDate(item.due_date_hint),
    });

    const issue = await payload.issue;
    if (issue) {
      results.push({
        id: issue.id,
        url: issue.url,
        title: issue.title,
        identifier: issue.identifier,
      });
    }
  }

  return results;
}
