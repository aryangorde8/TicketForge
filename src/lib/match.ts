import type { LinearUser, AssigneeMatch } from "./types";

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[] = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      prev = tmp;
    }
  }
  return dp[n];
}

function norm(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

function similarity(a: string, b: string): number {
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const maxLen = Math.max(na.length, nb.length);
  return 1 - levenshtein(na, nb) / maxLen;
}

// Score a single hint against a user's name fields. Boost first-name-only matches
// since transcripts usually use first names.
function scoreUser(hint: string, user: LinearUser): number {
  const h = norm(hint);
  const candidates = [
    user.name,
    user.displayName,
    user.email.split("@")[0],
  ].filter(Boolean);

  let best = 0;
  for (const c of candidates) {
    const cn = norm(c);
    if (!cn) continue;
    // exact full match
    best = Math.max(best, similarity(h, cn));
    // first-name match (hint is just "Sarah" → match against "Sarah Chen")
    const firstWord = cn.split(" ")[0];
    if (firstWord) {
      best = Math.max(best, similarity(h, firstWord));
    }
    // substring containment as a floor (e.g. "sarah" in "sarah-c")
    if (cn.includes(h) || h.includes(cn)) {
      best = Math.max(best, 0.85);
    }
  }
  return best;
}

export function matchAssignee(
  hint: string | null,
  users: LinearUser[]
): AssigneeMatch | null {
  if (!hint || users.length === 0) return null;
  let bestUser: LinearUser | null = null;
  let bestScore = 0;
  for (const user of users) {
    const s = scoreUser(hint, user);
    if (s > bestScore) {
      bestScore = s;
      bestUser = user;
    }
  }
  if (!bestUser || bestScore < 0.55) return null;
  return { user: bestUser, score: bestScore };
}
