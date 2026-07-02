"""Fuzzy assignee matching — Python port of `src/lib/match.py` (match.ts).

Levenshtein similarity with a first-name boost, since transcripts usually refer
to people by first name. Behaviour and thresholds are kept identical to the
original TypeScript.
"""

from __future__ import annotations

import re
from typing import Optional

from .models import AssigneeMatch, LinearUser

_WS = re.compile(r"\s+")


def _levenshtein(a: str, b: str) -> int:
    m, n = len(a), len(b)
    if m == 0:
        return n
    if n == 0:
        return m
    dp = list(range(n + 1))
    for i in range(1, m + 1):
        prev = dp[0]
        dp[0] = i
        for j in range(1, n + 1):
            tmp = dp[j]
            dp[j] = min(
                dp[j] + 1,
                dp[j - 1] + 1,
                prev + (0 if a[i - 1] == b[j - 1] else 1),
            )
            prev = tmp
    return dp[n]


def _norm(s: str) -> str:
    return _WS.sub(" ", s.lower().strip())


def _similarity(a: str, b: str) -> float:
    na, nb = _norm(a), _norm(b)
    if not na or not nb:
        return 0.0
    if na == nb:
        return 1.0
    max_len = max(len(na), len(nb))
    return 1 - _levenshtein(na, nb) / max_len


def _score_user(hint: str, user: LinearUser) -> float:
    """Score a hint against a user's name fields, boosting first-name matches."""
    h = _norm(hint)
    candidates = [user.name, user.displayName, user.email.split("@")[0]]

    best = 0.0
    for c in candidates:
        if not c:
            continue
        cn = _norm(c)
        if not cn:
            continue
        # exact full match
        best = max(best, _similarity(h, cn))
        # first-name match (hint "Sarah" -> match against "Sarah Chen")
        first_word = cn.split(" ")[0]
        if first_word:
            best = max(best, _similarity(h, first_word))
        # substring containment as a floor (e.g. "sarah" in "sarah-c")
        if h in cn or cn in h:
            best = max(best, 0.85)
    return best


def match_assignee(hint: Optional[str], users: list[LinearUser]) -> Optional[AssigneeMatch]:
    if not hint or not users:
        return None
    best_user: Optional[LinearUser] = None
    best_score = 0.0
    for user in users:
        s = _score_user(hint, user)
        if s > best_score:
            best_score = s
            best_user = user
    if best_user is None or best_score < 0.55:
        return None
    return AssigneeMatch(user=best_user, score=best_score)
