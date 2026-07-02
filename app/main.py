"""TicketForge FastAPI application.

Server-rendered (Jinja2) frontend + JSON API, all in Python. Implements the core
pipeline: extract -> review -> push to Linear, plus audio transcription.
"""

from __future__ import annotations

import base64
import json
import logging
from pathlib import Path

from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from itsdangerous import BadSignature, URLSafeSerializer

from . import store
from .config import settings
from .extract import extract_action_items
from .linear_client import LinearError, create_issues, get_workspace
from .match import match_assignee
from .models import ExtractPayload, LinearTeam, LinearUser, Priority, ReviewItem
from .sample_transcripts import SAMPLE_SCENARIOS, SAMPLE_TRANSCRIPT

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("ticketforge")

BASE_DIR = Path(__file__).resolve().parent.parent
COOKIE_NAME = "tf_session"
PRIORITIES: list[Priority] = ["urgent", "high", "medium", "low"]
MAX_TRANSCRIPT_CHARS = 100_000

app = FastAPI(title="TicketForge", version="0.5.0-py")
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
app.mount("/public", StaticFiles(directory=BASE_DIR / "public"), name="public")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

_signer = URLSafeSerializer(settings.SESSION_SECRET, salt="tf-session")


def _tpl(name: str, context: dict, status_code: int = 200):
    """Render a template using Starlette 1.x's (request, name, context) signature.

    Every caller already puts `request` in the context dict, so we pull it back
    out and pass it positionally.
    """
    request = context["request"]
    return templates.TemplateResponse(request, name, context, status_code=status_code)


# --- cookie helpers -----------------------------------------------------------
def _read_token(request: Request) -> str | None:
    raw = request.cookies.get(COOKIE_NAME)
    if not raw:
        return None
    try:
        return _signer.loads(raw)
    except BadSignature:
        return None


def _write_token(response, token: str) -> None:
    response.set_cookie(
        COOKIE_NAME,
        _signer.dumps(token),
        httponly=True,
        samesite="lax",
        max_age=60 * 60,
    )


def _destinations() -> dict[str, bool]:
    # Only Linear is wired in this phase; GitHub/Notion come later.
    return {"linear": settings.linear_configured, "github": False, "notion": False}


def _scenarios_json() -> str:
    return json.dumps(
        [
            {
                "id": s.id,
                "label": s.label,
                "description": s.description,
                "emoji": s.emoji,
                "transcript": s.transcript,
            }
            for s in SAMPLE_SCENARIOS
        ]
    )


def _distinct_users(items: list[ReviewItem]) -> list[dict[str, str]]:
    """Assignee options for the review selects (mirrors the SPA's `users` memo)."""
    seen: dict[str, dict[str, str]] = {}
    for it in items:
        if it.assignee_user_id:
            seen[it.assignee_user_id] = {
                "id": it.assignee_user_id,
                "name": it.assignee_hint or it.assignee_user_id,
            }
    return list(seen.values())


# --- routes -------------------------------------------------------------------
@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return _tpl("index.html", {"request": request})


@app.get("/extract", response_class=HTMLResponse)
def extract_page(request: Request):
    prefill = ""
    if request.query_params.get("sample") == "1":
        prefill = SAMPLE_TRANSCRIPT
    scenario_id = request.query_params.get("scenario")
    if scenario_id:
        for s in SAMPLE_SCENARIOS:
            if s.id == scenario_id:
                prefill = s.transcript
                break
    return _tpl(
        "extract.html",
        {
            "request": request,
            "prefill": prefill,
            "scenarios": SAMPLE_SCENARIOS,
            "scenarios_json": _scenarios_json(),
            "error": None,
            "groq_configured": settings.groq_configured,
        },
    )


@app.post("/extract")
async def extract_submit(request: Request, transcript: str = Form("")):
    transcript = (transcript or "").strip()

    def render_error(msg: str, status: int = 400):
        return _tpl(
            "extract.html",
            {
                "request": request,
                "prefill": transcript,
                "scenarios": SAMPLE_SCENARIOS,
                "scenarios_json": _scenarios_json(),
                "error": msg,
                "groq_configured": settings.groq_configured,
            },
            status_code=status,
        )

    if not transcript:
        return render_error("Paste a transcript first.")
    if len(transcript) > MAX_TRANSCRIPT_CHARS:
        return render_error("transcript too long (max 100k chars)")

    try:
        extraction = extract_action_items(transcript)
    except Exception as err:  # noqa: BLE001 — surface the message to the user
        log.exception("extraction failed")
        return render_error(str(err) or "Extraction failed", status=500)

    # Workspace fetch is non-fatal: without it we still let the user review.
    teams: list[LinearTeam] = []
    users: list[LinearUser] = []
    try:
        ws = get_workspace()
        teams, users = ws.teams, ws.users
    except Exception:  # noqa: BLE001
        log.warning("Linear workspace fetch failed", exc_info=True)

    default_team_id = teams[0].id if teams else None
    items: list[ReviewItem] = []
    for item in extraction.action_items:
        m = match_assignee(item.assignee_hint, users)
        items.append(
            ReviewItem(
                **item.model_dump(),
                assignee_user_id=m.user.id if m else None,
                match_score=m.score if m else None,
                team_id=default_team_id,
            )
        )

    payload = ExtractPayload(
        meeting_summary=extraction.meeting_summary,
        decisions=extraction.decisions,
        items=items,
        teams=teams,
        default_team_id=default_team_id,
        transcript=transcript,
        manual_time_estimate_minutes=extraction.manual_time_estimate_minutes,
        manual_time_reasoning=extraction.manual_time_reasoning,
    )
    token = store.save(payload)
    response = RedirectResponse(url="/review", status_code=303)
    _write_token(response, token)
    return response


@app.get("/review", response_class=HTMLResponse)
def review_page(request: Request):
    token = _read_token(request)
    payload = store.load(token)
    if payload is None or (not payload.items and not payload.meeting_summary):
        return _tpl(
            "review.html",
            {"request": request, "payload": None},
        )

    team_label = (
        f"{payload.teams[0].name} ({payload.teams[0].key})"
        if payload.teams
        else "your default Linear team"
    )
    return _tpl(
        "review.html",
        {
            "request": request,
            "payload": payload,
            "users": _distinct_users(payload.items),
            "priorities": PRIORITIES,
            "destinations": _destinations(),
            "team_label": team_label,
            "low_confidence_count": sum(1 for it in payload.items if it.confidence < 0.7),
            "error": None,
        },
    )


@app.post("/push", response_class=HTMLResponse)
async def push_submit(request: Request):
    token = _read_token(request)
    payload = store.load(token)
    if payload is None:
        return RedirectResponse(url="/extract", status_code=303)

    form = await request.form()
    ids = form.getlist("id")
    titles = form.getlist("title")
    assignees = form.getlist("assignee")
    priorities = form.getlist("priority")
    dues = form.getlist("due")
    descriptions = form.getlist("description")
    quotes = form.getlist("source_quote")
    confidences = form.getlist("confidence")
    destination = form.get("destination", "linear")

    items: list[ReviewItem] = []
    for i in range(len(ids)):
        try:
            confidence = float(confidences[i])
        except (ValueError, IndexError):
            confidence = 0.0
        priority = priorities[i] if priorities[i] in PRIORITIES else "medium"
        assignee = assignees[i] if i < len(assignees) and assignees[i] else None
        due = dues[i].strip() if i < len(dues) and dues[i].strip() else None
        items.append(
            ReviewItem(
                id=ids[i],
                title=titles[i],
                description=descriptions[i] if i < len(descriptions) else "",
                assignee_hint=None,
                priority=priority,  # type: ignore[arg-type]
                due_date_hint=due,
                confidence=confidence,
                source_quote=quotes[i] if i < len(quotes) else "",
                assignee_user_id=assignee,
                match_score=None,
                team_id=payload.default_team_id,
            )
        )

    def render_review_error(msg: str, status: int = 400):
        team_label = (
            f"{payload.teams[0].name} ({payload.teams[0].key})"
            if payload.teams
            else "your default Linear team"
        )
        return _tpl(
            "review.html",
            {
                "request": request,
                "payload": payload,
                "users": _distinct_users(payload.items),
                "priorities": PRIORITIES,
                "destinations": _destinations(),
                "team_label": team_label,
                "low_confidence_count": sum(1 for it in payload.items if it.confidence < 0.7),
                "error": msg,
            },
            status_code=status,
        )

    if not items:
        return render_review_error("No items to push.")

    if destination != "linear":
        return render_review_error(f"{destination} is not configured yet.")

    team_id = payload.default_team_id or ""
    if not team_id:
        try:
            ws = get_workspace()
            team_id = ws.teams[0].id if ws.teams else ""
        except LinearError as err:
            return render_review_error(str(err), status=500)
    if not team_id:
        return render_review_error("No Linear team available", status=400)

    try:
        created = create_issues(items, team_id)
    except Exception as err:  # noqa: BLE001
        log.exception("push failed")
        return render_review_error(str(err) or "Push failed", status=500)

    skipped = sum(1 for it in payload.items if it.confidence < 0.7)
    store.clear(token)
    response = _tpl(
        "success.html",
        {
            "request": request,
            "results": created,
            "skipped": skipped,
            "destination": "linear",
            "destination_label": "Linear",
            "manual_time_minutes": payload.manual_time_estimate_minutes,
        },
    )
    response.delete_cookie(COOKIE_NAME)
    return response


# --- JSON API -----------------------------------------------------------------
@app.get("/api/config")
def api_config():
    return JSONResponse(
        {"destinations": _destinations()},
        headers={"Cache-Control": "public, max-age=60"},
    )


@app.post("/api/transcribe")
async def api_transcribe(request: Request):
    body = await request.json()
    audio_b64 = body.get("audio")
    mime_type = body.get("mimeType") or "audio/webm"
    if not audio_b64:
        return JSONResponse({"error": "Audio data required"}, status_code=400)
    if not settings.groq_configured:
        return JSONResponse({"error": "GROQ_API_KEY not set"}, status_code=500)

    try:
        audio_bytes = base64.b64decode(audio_b64)
        ext = "webm" if "webm" in mime_type else "mp4" if "mp4" in mime_type else "wav"
        from groq import Groq

        client = Groq(api_key=settings.GROQ_API_KEY)
        transcription = client.audio.transcriptions.create(
            file=(f"recording.{ext}", audio_bytes),
            model=settings.TRANSCRIBE_MODEL,
            response_format="verbose_json",
            temperature=0,
        )
        return JSONResponse(
            {
                "text": transcription.text,
                "duration": getattr(transcription, "duration", None),
            }
        )
    except Exception as err:  # noqa: BLE001
        log.exception("transcription failed")
        return JSONResponse(
            {"error": str(err) or "Transcription failed"}, status_code=500
        )
