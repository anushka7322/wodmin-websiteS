"""WODMIN admin authentication — JWT (HS256) + bcrypt."""
from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr

JWT_ALGORITHM = "HS256"
TOKEN_EXPIRY_HOURS = 12

bearer_scheme = HTTPBearer(auto_error=False)


def _jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8")[:72], hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def create_access_token(*, sub: str, email: str, role: str = "admin") -> str:
    payload = {
        "sub": sub,
        "email": email,
        "role": role,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRY_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError as e:
        raise HTTPException(status_code=401, detail="Token expired") from e
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail="Invalid token") from e


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class AdminPublic(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: AdminPublic


def get_admin_dependency(db):
    """Factory that returns a FastAPI dependency yielding the current admin."""

    async def _dep(creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)) -> dict:
        if creds is None or not creds.credentials:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
        payload = decode_token(creds.credentials)
        if payload.get("type") != "access" or payload.get("role") != "admin":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.admin_users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Admin not found")
        return user

    return _dep


async def seed_admin(db) -> None:
    """Idempotent admin seeding from env."""
    import uuid

    email = os.environ.get("ADMIN_EMAIL", "admin@wodmin.in").lower().strip()
    password = os.environ.get("ADMIN_PASSWORD", "WodminAdmin@2026")
    name = os.environ.get("ADMIN_NAME", "WODMIN Admin")

    existing = await db.admin_users.find_one({"email": email})
    if existing is None:
        await db.admin_users.insert_one({
            "id": str(uuid.uuid4()),
            "email": email,
            "name": name,
            "role": "admin",
            "password_hash": hash_password(password),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(password, existing.get("password_hash", "")):
        # Sync password if env changed
        await db.admin_users.update_one(
            {"email": email},
            {"$set": {"password_hash": hash_password(password), "name": name}},
        )
