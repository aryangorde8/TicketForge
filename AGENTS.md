# Agent notes

TicketForge is a **Python-only** project: a FastAPI backend with server-rendered
Jinja2 templates. There is no TypeScript, Node, or Next.js here.

- Backend + routes: `app/` (FastAPI, Pydantic, httpx, Groq SDK)
- Frontend: `templates/` (Jinja2) + `static/` (plain CSS, vanilla JS)
- Run: `python run.py` (or `uvicorn app.main:app --reload`)
- Dependencies live in a virtualenv; see `README.md` for setup.

Keep it Python. Do not reintroduce a JavaScript/TypeScript build step.
