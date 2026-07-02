"""Environment configuration.

Loads a local `.env` file (simple KEY=VALUE parser, no external dependency) and
exposes the settings the app needs. Mirrors the env vars used by the original
Next.js app so the same `.env` works for both during the migration.
"""

from __future__ import annotations

import os
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent


def _load_dotenv() -> None:
    """Populate os.environ from a .env / .env.local file if present.

    Existing environment variables always win over file values.
    """
    for name in (".env", ".env.local"):
        path = _ROOT / name
        if not path.exists():
            continue
        for raw in path.read_text(encoding="utf-8").splitlines():
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value


_load_dotenv()


class Settings:
    """Runtime settings read from the environment."""

    GROQ_API_KEY: str | None = os.getenv("GROQ_API_KEY")
    LINEAR_API_KEY: str | None = os.getenv("LINEAR_API_KEY")

    # Model ids — kept identical to the TypeScript implementation.
    EXTRACT_MODEL: str = os.getenv("EXTRACT_MODEL", "llama-3.3-70b-versatile")
    TRANSCRIBE_MODEL: str = os.getenv("TRANSCRIBE_MODEL", "whisper-large-v3-turbo")

    # Secret used to sign the session cookie that references the stored extraction.
    SESSION_SECRET: str = os.getenv("SESSION_SECRET", "ticketforge-dev-secret-change-me")

    @property
    def linear_configured(self) -> bool:
        return bool(self.LINEAR_API_KEY)

    @property
    def groq_configured(self) -> bool:
        return bool(self.GROQ_API_KEY)


settings = Settings()
