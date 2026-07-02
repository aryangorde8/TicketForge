# TicketForge — Python edition

A full rewrite of TicketForge with **Python on both ends**: a
[FastAPI](https://fastapi.tiangolo.com/) backend and a server-rendered
[Jinja2](https://jinja.palletsprojects.com/) frontend. No TypeScript, no Node.
The original Next.js source is still in the repo (`src/`) as a reference during
the migration — the Python app is self-contained under `app/`, `templates/`, and
`static/`.

## What's implemented (core pipeline)

Extract → review → push to Linear, plus audio transcription:

- **Paste or record** a transcript (`/extract`)
- **AI extraction** with confidence scores, source quotes, priorities, due dates
  (Groq / Llama 3.3 70B)
- **Smart assignee matching** (Levenshtein + first-name boost) against your Linear team
- **Human-in-the-loop review** (`/review`) — inline edits, bulk actions, filtering,
  low-confidence flagging
- **Push to Linear** via its GraphQL API
- **Live transcription** (Whisper Large V3 Turbo via Groq)

Not yet ported (deliberately, per the "core pipeline first" scope): GitHub / Notion
destinations, the Slack bot, the stalled-commitments tracker, and the MCP server.

## Setup

Python 3.11+ recommended (developed on 3.14).

```bash
# 1. Virtual environment
python3 -m venv .venv
source .venv/bin/activate
# If `python -m venv` can't bootstrap pip on your system (Debian/Ubuntu), run:
#   python3 -m venv .venv --without-pip
#   curl -sS https://bootstrap.pypa.io/get-pip.py | .venv/bin/python

# 2. Dependencies
pip install -r requirements.txt

# 3. Environment
cp .env.example .env
#   fill in GROQ_API_KEY (required for extract/transcribe)
#   and LINEAR_API_KEY (required to push)

# 4. Run
python run.py                       # http://127.0.0.1:8000
# or: uvicorn app.main:app --reload
```

## Environment variables

| Variable            | Required        | Purpose                                   |
| ------------------- | --------------- | ----------------------------------------- |
| `GROQ_API_KEY`      | yes             | Extraction + transcription                |
| `LINEAR_API_KEY`    | to push tickets | Fetch workspace, create issues            |
| `EXTRACT_MODEL`     | no              | default `llama-3.3-70b-versatile`         |
| `TRANSCRIBE_MODEL`  | no              | default `whisper-large-v3-turbo`          |
| `SESSION_SECRET`    | prod            | signs the extract→review session cookie   |

## Architecture (TypeScript → Python map)

| Next.js (original)                | Python (this app)                          |
| --------------------------------- | ------------------------------------------ |
| `src/lib/types.ts` (Zod)          | `app/models.py` (Pydantic)                 |
| `src/lib/extract.ts`              | `app/extract.py`                           |
| `src/lib/match.ts`                | `app/match.py`                             |
| `src/lib/linear.ts` (`@linear/sdk`) | `app/linear_client.py` (httpx + GraphQL) |
| `src/lib/extract-store.ts` (sessionStorage) | `app/store.py` (in-memory + signed cookie) |
| `pages/api/*.ts`                  | routes in `app/main.py`                    |
| `pages/*.tsx` (React)             | `templates/*.html` (Jinja2) + `static/js/*.js` |
| `src/styles/globals.css` (Tailwind) | `static/css/style.css` (plain CSS)       |

### Notes

- The frontend is server-rendered HTML; interactivity (bulk edits, filtering,
  recording, submit states) is a small amount of vanilla JS in `static/js/`.
- `app/store.py` keeps extraction results in memory keyed by a signed cookie —
  fine for a single dev worker. For multiple workers, back it with Redis.
- Linear has no first-party Python SDK on par with `@linear/sdk`, so the client
  calls the GraphQL endpoint directly with `httpx`. Behaviour (workspace caching,
  priority mapping, description formatting, due-date parsing) matches the original.
```
