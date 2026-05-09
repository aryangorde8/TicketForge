// Tiny in-memory passover for /extract → /review. SSR-safe (guards window).
// Data also mirrored to sessionStorage so a refresh survives.

import type { ReviewItem, LinearTeam } from "./types";

export interface ExtractPayload {
  meeting_summary: string;
  decisions: string[];
  items: ReviewItem[];
  teams: LinearTeam[];
  default_team_id: string | null;
  transcript: string;
  manual_time_estimate_minutes?: number;
  manual_time_reasoning?: string;
}

const KEY = "ticketforge:extract";

export function saveExtract(payload: ExtractPayload) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // ignore (quota/private mode)
  }
}

export function loadExtract(): ExtractPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ExtractPayload;
  } catch {
    return null;
  }
}

export function clearExtract() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
