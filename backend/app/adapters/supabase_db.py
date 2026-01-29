from typing import Optional
from datetime import datetime, timezone
import uuid
from contextlib import asynccontextmanager

from supabase import create_client, Client

from app.adapters.base_db import BaseDatabase
from app.domain.event import Event
from app.config import settings


class SupabaseDatabase(BaseDatabase):
    """
    Supabase database implementation for production.
    Data persists across restarts.
    """

    def __init__(self):
        self._client: Client = create_client(
            settings.SUPABASE_URL, settings.SUPABASE_KEY
        )

    async def create_event(self, event: Event) -> Event:
        data = {
            "id": event.id,
            "action_type": event.action_type,
            "resource_id": event.resource_id,
            "user_id": event.user_id,
            "decision": event.decision,
            "reason": event.reason,
            "ai_recommendation": event.ai_recommendation,
            "ai_available": event.ai_available,
            "timestamp": event.timestamp.isoformat(),
            "metadata": event.metadata or {},
        }
        self._client.table("events").insert(data).execute()
        return event

    async def get_events(
        self, user_id: Optional[str] = None, limit: int = 100, offset: int = 0
    ) -> list[Event]:
        query = (
            self._client.table("events")
            .select("*")
            .order("timestamp", desc=True)
            .limit(limit)
            .offset(offset)
        )
        if user_id:
            query = query.eq("user_id", user_id)
        result = query.execute()

        events = []
        for row in result.data:
            events.append(
                Event(
                    id=row["id"],
                    action_type=row["action_type"],
                    resource_id=row["resource_id"],
                    user_id=row["user_id"],
                    decision=row["decision"],
                    reason=row["reason"],
                    ai_recommendation=row.get("ai_recommendation"),
                    ai_available=row["ai_available"],
                    timestamp=(
                        datetime.fromisoformat(row["timestamp"].replace("Z", "+00:00"))
                        if isinstance(row["timestamp"], str)
                        else row["timestamp"]
                    ),
                    metadata=row.get("metadata"),
                )
            )
        return events

    async def get_event_by_id(self, event_id: str) -> Optional[Event]:
        result = self._client.table("events").select("*").eq("id", event_id).execute()
        if not result.data:
            return None
        row = result.data[0]
        return Event(
            id=row["id"],
            action_type=row["action_type"],
            resource_id=row["resource_id"],
            user_id=row["user_id"],
            decision=row["decision"],
            reason=row["reason"],
            ai_recommendation=row.get("ai_recommendation"),
            ai_available=row["ai_available"],
            timestamp=(
                datetime.fromisoformat(row["timestamp"].replace("Z", "+00:00"))
                if isinstance(row["timestamp"], str)
                else row["timestamp"]
            ),
            metadata=row.get("metadata"),
        )

    async def get_metrics(self) -> dict:
        result = self._client.table("events").select("decision, ai_available").execute()
        events = result.data

        total = len(events)
        approved = sum(1 for e in events if e["decision"] == "approve")
        rejected = sum(1 for e in events if e["decision"] == "reject")
        ai_unavailable = sum(1 for e in events if not e["ai_available"])

        return {
            "total_actions": total,
            "approved_count": approved,
            "rejected_count": rejected,
            "reject_rate": rejected / total if total > 0 else 0.0,
            "ai_unavailable_count": ai_unavailable,
        }

    async def create_user(
        self, email: str, password_hash: str, name: Optional[str] = None
    ) -> dict:
        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        user = {
            "id": user_id,
            "email": email,
            "password_hash": password_hash,
            "name": name,
            "created_at": now.isoformat(),
        }
        self._client.table("users").insert(user).execute()
        return {
            "id": user_id,
            "email": email,
            "password_hash": password_hash,
            "name": name,
            "created_at": now,
        }

    async def get_user_by_email(self, email: str) -> Optional[dict]:
        result = self._client.table("users").select("*").eq("email", email).execute()
        if not result.data:
            return None
        row = result.data[0]
        return {
            "id": row["id"],
            "email": row["email"],
            "password_hash": row["password_hash"],
            "name": row.get("name"),
            "created_at": (
                datetime.fromisoformat(row["created_at"].replace("Z", "+00:00"))
                if isinstance(row["created_at"], str)
                else row["created_at"]
            ),
        }

    async def get_user_by_id(self, user_id: str) -> Optional[dict]:
        result = self._client.table("users").select("*").eq("id", user_id).execute()
        if not result.data:
            return None
        row = result.data[0]
        return {
            "id": row["id"],
            "email": row["email"],
            "password_hash": row["password_hash"],
            "name": row.get("name"),
            "created_at": (
                datetime.fromisoformat(row["created_at"].replace("Z", "+00:00"))
                if isinstance(row["created_at"], str)
                else row["created_at"]
            ),
        }

    async def create_api_key(
        self, user_id: str, name: str, key_hash: str, key_prefix: str
    ) -> dict:
        key_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        api_key = {
            "id": key_id,
            "user_id": user_id,
            "name": name,
            "key_hash": key_hash,
            "key_prefix": key_prefix,
            "created_at": now.isoformat(),
        }
        self._client.table("api_keys").insert(api_key).execute()
        return {
            "id": key_id,
            "user_id": user_id,
            "name": name,
            "key_hash": key_hash,
            "key_prefix": key_prefix,
            "created_at": now,
        }

    async def get_api_keys_by_user(self, user_id: str) -> list[dict]:
        result = (
            self._client.table("api_keys").select("*").eq("user_id", user_id).execute()
        )
        keys = []
        for row in result.data:
            keys.append(
                {
                    "id": row["id"],
                    "user_id": row["user_id"],
                    "name": row["name"],
                    "key_hash": row["key_hash"],
                    "key_prefix": row["key_prefix"],
                    "created_at": (
                        datetime.fromisoformat(row["created_at"].replace("Z", "+00:00"))
                        if isinstance(row["created_at"], str)
                        else row["created_at"]
                    ),
                }
            )
        return keys

    async def get_api_key_by_hash(self, key_hash: str) -> Optional[dict]:
        result = (
            self._client.table("api_keys")
            .select("*")
            .eq("key_hash", key_hash)
            .execute()
        )
        if not result.data:
            return None
        row = result.data[0]
        return {
            "id": row["id"],
            "user_id": row["user_id"],
            "name": row["name"],
            "key_hash": row["key_hash"],
            "key_prefix": row["key_prefix"],
            "created_at": (
                datetime.fromisoformat(row["created_at"].replace("Z", "+00:00"))
                if isinstance(row["created_at"], str)
                else row["created_at"]
            ),
        }

    async def delete_api_key(self, key_id: str, user_id: str) -> bool:
        result = (
            self._client.table("api_keys")
            .delete()
            .eq("id", key_id)
            .eq("user_id", user_id)
            .execute()
        )
        return len(result.data) > 0

    # --- Idempotency ---

    async def get_idempotency_record(self, key: str, user_id: str) -> Optional[dict]:
        result = (
            self._client.table("idempotency_keys")
            .select("*")
            .eq("key", key)
            .eq("user_id", user_id)
            .execute()
        )
        if not result.data:
            return None
        return result.data[0]

    async def create_idempotency_record(
        self, key: str, user_id: str, response_body: dict, status_code: int = 200
    ) -> dict:
        record = {
            "key": key,
            "user_id": user_id,
            "response_body": response_body,
            "status_code": status_code,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self._client.table("idempotency_keys").insert(record).execute()
        return record

    @asynccontextmanager
    async def transaction(self):
        """
        Supabase/PostgREST doesn't support transactions via the client in a simple way.
        Multi-table transactions should be implemented via Postgres Functions (RPC).
        For now, this is a placeholder.
        """
        yield
