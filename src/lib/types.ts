export type Priority = "urgent" | "high" | "medium" | "low";

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  assignee_hint: string | null;
  priority: Priority;
  due_date_hint: string | null;
  confidence: number;
  source_quote: string;
}

export interface ExtractionResult {
  meeting_summary: string;
  decisions: string[];
  action_items: ActionItem[];
}

export interface LinearUser {
  id: string;
  name: string;
  displayName: string;
  email: string;
}

export interface LinearTeam {
  id: string;
  name: string;
  key: string;
}

export interface LinearWorkspace {
  teams: LinearTeam[];
  users: LinearUser[];
}

export interface AssigneeMatch {
  user: LinearUser;
  score: number;
}

export interface ReviewItem extends ActionItem {
  assignee_user_id: string | null;
  match_score: number | null;
  team_id: string | null;
}

export interface PushResult {
  id: string;
  url: string;
  title: string;
  identifier: string;
}
