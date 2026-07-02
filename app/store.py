"""In-memory hand-off store for extraction results between /extract and /review.

Replaces the browser sessionStorage used by the SPA. Each extraction is stashed
server-side under a random id; the id travels in a signed cookie. Entries expire
so the process doesn't grow unbounded. This is per-process (fine for the single
uvicorn worker used in development); swap for Redis to run multiple workers.
"""

from __future__ import annotations

import time
import uuid
from threading import Lock

from .models import ExtractPayload

_TTL_S = 60 * 60  # 1 hour
_store: dict[str, tuple[ExtractPayload, float]] = {}
_lock = Lock()


def _evict_expired() -> None:
    now = time.time()
    stale = [k for k, (_, ts) in _store.items() if now - ts > _TTL_S]
    for k in stale:
        _store.pop(k, None)


def save(payload: ExtractPayload) -> str:
    token = uuid.uuid4().hex
    with _lock:
        _evict_expired()
        _store[token] = (payload, time.time())
    return token


def load(token: str | None) -> ExtractPayload | None:
    if not token:
        return None
    with _lock:
        entry = _store.get(token)
        if entry is None:
            return None
        payload, ts = entry
        if time.time() - ts > _TTL_S:
            _store.pop(token, None)
            return None
        return payload


def update(token: str, payload: ExtractPayload) -> None:
    with _lock:
        if token in _store:
            _store[token] = (payload, time.time())


def clear(token: str | None) -> None:
    if not token:
        return
    with _lock:
        _store.pop(token, None)
