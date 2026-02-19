import secrets
import hashlib
from typing import Optional
from fastapi import HTTPException, Depends, status
from fastapi.security import APIKeyHeader

from app.adapters import db

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def generate_api_key() -> tuple[str, str, str]:
    """Generate a new API key. Returns (full_key, key_hash, key_prefix)"""
    key = f"ulc_{secrets.token_urlsafe(32)}"
    key_hash = hashlib.sha256(key.encode()).hexdigest()
    key_prefix = key[:12]
    return key, key_hash, key_prefix


def hash_api_key(key: str) -> str:
    """Hash an API key for storage/lookup"""
    return hashlib.sha256(key.encode()).hexdigest()


async def get_api_key_user(
    api_key: Optional[str] = Depends(api_key_header),
) -> Optional[dict]:
    """Validate API key and return associated user"""
    if not api_key:
        return None

    key_hash = hash_api_key(api_key)
    api_key_record = await db.get_api_key_by_hash(key_hash)

    if not api_key_record:
        return None

    user = await db.get_user_by_id(api_key_record["user_id"])
    return user


async def require_api_key(api_key: Optional[str] = Depends(api_key_header)) -> dict:
    """Require a valid API key"""
    user = await get_api_key_user(api_key)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    return user
