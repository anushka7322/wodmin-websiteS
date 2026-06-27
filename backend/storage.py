"""Thin wrapper around the Emergent managed object storage."""
from __future__ import annotations

import logging
import os
import uuid

import requests

logger = logging.getLogger("wodmin.storage")

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
APP_NAME = os.environ.get("STORAGE_APP_NAME", "wodmin")

ALLOWED_EXTS = {"jpg", "jpeg", "png", "webp", "gif"}
MIME_BY_EXT = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg",
    "png": "image/png", "webp": "image/webp", "gif": "image/gif",
}
MAX_BYTES = 8 * 1024 * 1024  # 8 MB

_storage_key: str | None = None


def init_storage() -> str | None:
    global _storage_key
    if _storage_key:
        return _storage_key
    emergent_key = os.environ.get("EMERGENT_LLM_KEY")
    if not emergent_key:
        logger.warning("EMERGENT_LLM_KEY not set; uploads will be disabled.")
        return None
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": emergent_key}, timeout=30)
        resp.raise_for_status()
        _storage_key = resp.json().get("storage_key")
        logger.info("Object storage initialised.")
        return _storage_key
    except Exception as e:  # noqa: BLE001
        logger.warning("Object storage init failed: %s", e)
        return None


def _force_init() -> str:
    key = init_storage()
    if not key:
        raise RuntimeError("Object storage is not available (EMERGENT_LLM_KEY missing or init failed).")
    return key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = _force_init()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120,
    )
    if resp.status_code == 403:
        # Stale key — refresh and retry once
        global _storage_key
        _storage_key = None
        key = _force_init()
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data, timeout=120,
        )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str) -> tuple[bytes, str]:
    key = _force_init()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60,
    )
    if resp.status_code == 403:
        global _storage_key
        _storage_key = None
        key = _force_init()
        resp = requests.get(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key}, timeout=60,
        )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


def build_upload_path(ext: str) -> str:
    ext = (ext or "").lower().lstrip(".")
    if ext not in ALLOWED_EXTS:
        raise ValueError(f"Unsupported file extension: .{ext}")
    return f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
