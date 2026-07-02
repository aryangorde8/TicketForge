"""Data models — Python/Pydantic port of `src/lib/types.ts`.

The `*Raw` models mirror the Zod schemas used to validate the LLM output; the
public models add the fields the app layers on (ids, match scores, team ids).
"""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

Priority = Literal["urgent", "high", "medium", "low"]


# --- Raw LLM output validation (mirrors the Zod schemas in extract.ts) ---------
class ActionItemRaw(BaseModel):
    title: str = Field(min_length=1)
    description: str
    assignee_hint: Optional[str] = None
    priority: Priority
    due_date_hint: Optional[str] = None
    confidence: float = Field(ge=0.0, le=1.0)
    source_quote: str = Field(min_length=1)


class ExtractionRaw(BaseModel):
    meeting_summary: str
    decisions: list[str]
    action_items: list[ActionItemRaw]
    manual_time_estimate_minutes: float = Field(ge=0.0, le=240.0)
    manual_time_reasoning: str


# --- Public app models --------------------------------------------------------
class ActionItem(BaseModel):
    id: str
    title: str
    description: str
    assignee_hint: Optional[str] = None
    priority: Priority
    due_date_hint: Optional[str] = None
    confidence: float
    source_quote: str


class ExtractionResult(BaseModel):
    meeting_summary: str
    decisions: list[str]
    action_items: list[ActionItem]
    manual_time_estimate_minutes: int
    manual_time_reasoning: str


class LinearUser(BaseModel):
    id: str
    name: str
    displayName: str
    email: str


class LinearTeam(BaseModel):
    id: str
    name: str
    key: str


class LinearWorkspace(BaseModel):
    teams: list[LinearTeam]
    users: list[LinearUser]


class AssigneeMatch(BaseModel):
    user: LinearUser
    score: float


class ReviewItem(ActionItem):
    assignee_user_id: Optional[str] = None
    match_score: Optional[float] = None
    team_id: Optional[str] = None


class PushResult(BaseModel):
    id: str
    url: str
    title: str
    identifier: str


class ExtractPayload(BaseModel):
    """What gets stashed between /extract and /review (mirrors extract-store.ts)."""

    meeting_summary: str
    decisions: list[str]
    items: list[ReviewItem]
    teams: list[LinearTeam]
    default_team_id: Optional[str] = None
    transcript: str = ""
    manual_time_estimate_minutes: Optional[int] = None
    manual_time_reasoning: Optional[str] = None
