# TicketForge

Convert meeting transcripts into properly-structured Linear tickets in seconds.

Built with **Python end to end** — a [FastAPI](https://fastapi.tiangolo.com/)
backend and server-rendered [Jinja2](https://jinja.palletsprojects.com/) frontend.
No TypeScript, no Node.

## What it does

Engineering managers spend 4–6 hours per week converting meeting notes into tickets.
For a 20-person team, that's $130K/year in lost capacity. TicketForge fixes this:

1. **Paste or record** a meeting transcript
2. **AI extracts** action items with confidence scores, source quotes, and assignee matches
3. **Review and edit** in a clean human-in-the-loop UI
4. **Push to Linear**

## Differentiators

- **Confidence scoring** — every extraction comes with a 0–1 score so humans review what needs review, not everything
- **Source quotes** — every ticket links back to the exact line in the transcript. No hallucinations.
- **Smart assignee matching** — Levenshtein + first-name boost matches "marcus" to "Marcus Chen" at 88%
- **Voice → tickets** — record a meeting and Whisper transcribes it in seconds

## Stack

- **FastAPI** + **Jinja2** (server-rendered HTML) + plain CSS / vanilla JS
- **Pydantic** for structured-output validation with retry
- **Groq** (Llama 3.3 70B + Whisper Large V3 Turbo) for extraction and transcription
- **Linear** via its GraphQL API (`httpx`)

## Local setup

Python 3.11+ recommended (developed on 3.14).

```bash
# 1. Virtual environment
python3 -m venv .venv
source .venv/bin/activate
# If `python -m venv` can't bootstrap pip on your system (Debian/Ubuntu):
#   python3 -m venv .venv --without-pip
#   curl -sS https://bootstrap.pypa.io/get-pip.py | .venv/bin/python

# 2. Dependencies
pip install -r requirements.txt

# 3. Environment
cp .env.example .env
#   fill in GROQ_API_KEY (required for extract/transcribe)
#   and LINEAR_API_KEY (required to push)

# 4. Run
python run.py                    # http://127.0.0.1:8000
# or: uvicorn app.main:app --reload
```

## Environment variables

| Variable           | Required        | Purpose                                 |
| ------------------ | --------------- | --------------------------------------- |
| `GROQ_API_KEY`     | yes             | Extraction + transcription              |
| `LINEAR_API_KEY`   | to push tickets | Fetch workspace, create issues          |
| `EXTRACT_MODEL`    | no              | default `llama-3.3-70b-versatile`       |
| `TRANSCRIBE_MODEL` | no              | default `whisper-large-v3-turbo`        |
| `SESSION_SECRET`   | prod            | signs the extract→review session cookie |

## Project layout

```
app/         FastAPI app, routes, extraction, matching, Linear client, models
templates/   Jinja2 pages (index, extract, review, success)
static/      CSS + vanilla JS
public/      favicon / OG assets
run.py       dev entrypoint
```

## Roadmap

Core pipeline (extract → review → push to Linear + transcription) is implemented.
Not yet ported: GitHub / Notion destinations, the Slack bot, the stalled-commitments
tracker, and the MCP server.

## License

MIT
