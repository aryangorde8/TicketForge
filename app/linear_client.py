"""Linear integration — Python port of `src/lib/linear.ts`.

The TypeScript app uses the official `@linear/sdk` (a typed GraphQL client). There
is no equally mature Python SDK, so we talk to Linear's GraphQL API directly with
httpx. Behaviour (workspace caching, priority mapping, description formatting,
due-date parsing) matches the original.
"""

from __future__ import annotations

import re
import time
from typing import Optional

import httpx

from .config import settings
from .models import (
    LinearTeam,
    LinearUser,
    LinearWorkspace,
    Priority,
    PushResult,
    ReviewItem,
)

LINEAR_API_URL = "https://api.linear.app/graphql"
_WORKSPACE_TTL_S = 5 * 60

_workspace_cache: Optional[tuple[LinearWorkspace, float]] = None
_ISO_DATE_RE = re.compile(r"^(\d{4}-\d{2}-\d{2})")

# Linear priority: 0 = none, 1 = urgent, 2 = high, 3 = medium, 4 = low
_PRIORITY_TO_LINEAR: dict[Priority, int] = {
    "urgent": 1,
    "high": 2,
    "medium": 3,
    "low": 4,
}


class LinearError(RuntimeError):
    pass


def _api_key() -> str:
    if not settings.LINEAR_API_KEY:
        raise LinearError("LINEAR_API_KEY is not set")
    return settings.LINEAR_API_KEY


def _gql(query: str, variables: Optional[dict] = None) -> dict:
    resp = httpx.post(
        LINEAR_API_URL,
        headers={
            "Authorization": _api_key(),
            "Content-Type": "application/json",
        },
        json={"query": query, "variables": variables or {}},
        timeout=30.0,
    )
    resp.raise_for_status()
    body = resp.json()
    if body.get("errors"):
        messages = "; ".join(e.get("message", "unknown") for e in body["errors"])
        raise LinearError(f"Linear API error: {messages}")
    return body["data"]


_WORKSPACE_QUERY = """
query Workspace {
  teams(first: 50) { nodes { id name key } }
  users(first: 250) { nodes { id name displayName email active } }
}
"""


def get_workspace() -> LinearWorkspace:
    global _workspace_cache
    if _workspace_cache is not None:
        data, ts = _workspace_cache
        if time.time() - ts < _WORKSPACE_TTL_S:
            return data

    data = _gql(_WORKSPACE_QUERY)
    teams = [
        LinearTeam(id=t["id"], name=t["name"], key=t["key"])
        for t in data["teams"]["nodes"]
    ]
    users = [
        LinearUser(
            id=u["id"],
            name=u["name"],
            displayName=u["displayName"],
            email=u["email"],
        )
        for u in data["users"]["nodes"]
        if u.get("active", True)
    ]
    workspace = LinearWorkspace(teams=teams, users=users)
    _workspace_cache = (workspace, time.time())
    return workspace


def _build_description(item: ReviewItem) -> str:
    parts = [item.description.strip()]
    if item.due_date_hint:
        parts.append(f"\n**Due:** {item.due_date_hint}")
    quoted = item.source_quote.replace("\n", "\n> ")
    parts.append(f"\n---\n**Source from transcript:**\n> {quoted}")
    parts.append(
        f"\n_Extracted by TicketForge with confidence {round(item.confidence * 100)}%._"
    )
    return "\n".join(parts)


def _parse_due_date(hint: Optional[str]) -> Optional[str]:
    if not hint:
        return None
    m = _ISO_DATE_RE.match(hint)
    return m.group(1) if m else None


_CREATE_ISSUE_MUTATION = """
mutation CreateIssue($input: IssueCreateInput!) {
  issueCreate(input: $input) {
    success
    issue { id identifier title url }
  }
}
"""


def create_issues(items: list[ReviewItem], default_team_id: str) -> list[PushResult]:
    results: list[PushResult] = []
    for item in items:
        team_id = item.team_id or default_team_id
        input_obj: dict = {
            "teamId": team_id,
            "title": item.title,
            "description": _build_description(item),
            "priority": _PRIORITY_TO_LINEAR[item.priority],
        }
        if item.assignee_user_id:
            input_obj["assigneeId"] = item.assignee_user_id
        due = _parse_due_date(item.due_date_hint)
        if due:
            input_obj["dueDate"] = due

        data = _gql(_CREATE_ISSUE_MUTATION, {"input": input_obj})
        issue = data["issueCreate"].get("issue")
        if issue:
            results.append(
                PushResult(
                    id=issue["id"],
                    url=issue["url"],
                    title=issue["title"],
                    identifier=issue["identifier"],
                )
            )
    return results
