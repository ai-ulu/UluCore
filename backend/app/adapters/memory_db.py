from typing import Optional
from datetime import datetime
import uuid

from app.adapters.base_db import BaseDatabase
from app.domain.event import Event
from app.models.schemas import Policy, PolicyCreate, PolicyUpdate


class InMemoryDatabase(BaseDatabase):
    """
    In-memory database implementation for MVP/development.
    Data is lost on restart - suitable for proof of concept.
    """

    def __init__(self):
        self._events: list[Event] = []
        self._users: dict[str, dict] = {}
        self._api_keys: dict[str, dict] = {}
        self._policies: dict[str, Policy] = {}

    async def create_event(self, event: Event) -> Event:
        self._events.append(event)
        return event

    async def get_events(
        self, user_id: Optional[str] = None, limit: int = 100, offset: int = 0
    ) -> list[Event]:
        events = self._events
        if user_id:
            events = [e for e in events if e.user_id == user_id]
        events = sorted(events, key=lambda e: e.timestamp, reverse=True)
        return events[offset : offset + limit]

    async def get_event_by_id(self, event_id: str) -> Optional[Event]:
        for event in self._events:
            if event.id == event_id:
                return event
        return None

    async def get_metrics(self) -> dict:
        total = len(self._events)
        approved = sum(1 for e in self._events if e.decision == "approve")
        rejected = sum(1 for e in self._events if e.decision == "reject")
        ai_unavailable = sum(1 for e in self._events if not e.ai_available)

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
        user = {
            "id": user_id,
            "email": email,
            "password_hash": password_hash,
            "name": name,
            "created_at": datetime.utcnow(),
        }
        self._users[user_id] = user
        return user

    async def get_user_by_email(self, email: str) -> Optional[dict]:
        for user in self._users.values():
            if user["email"] == email:
                return user
        return None

    async def get_user_by_id(self, user_id: str) -> Optional[dict]:
        return self._users.get(user_id)

    async def create_api_key(
        self, user_id: str, name: str, key_hash: str, key_prefix: str
    ) -> dict:
        key_id = str(uuid.uuid4())
        api_key = {
            "id": key_id,
            "user_id": user_id,
            "name": name,
            "key_hash": key_hash,
            "key_prefix": key_prefix,
            "created_at": datetime.utcnow(),
        }
        self._api_keys[key_id] = api_key
        return api_key

    async def get_api_keys_by_user(self, user_id: str) -> list[dict]:
        return [k for k in self._api_keys.values() if k["user_id"] == user_id]

    async def get_api_key_by_hash(self, key_hash: str) -> Optional[dict]:
        for key in self._api_keys.values():
            if key["key_hash"] == key_hash:
                return key
        return None

    async def delete_api_key(self, key_id: str, user_id: str) -> bool:
        if key_id in self._api_keys and self._api_keys[key_id]["user_id"] == user_id:
            del self._api_keys[key_id]
            return True
        return False

    # --- Policy Management ---

    async def create_policy(self, policy_data: PolicyCreate) -> Policy:
        policy = Policy(**policy_data.model_dump())
        self._policies[policy.id] = policy
        return policy

    async def get_policy(self, policy_id: str) -> Optional[Policy]:
        return self._policies.get(policy_id)

    async def get_all_policies(self) -> list[Policy]:
        return list(self._policies.values())

    async def update_policy(
        self, policy_id: str, policy_data: PolicyUpdate
    ) -> Optional[Policy]:
        policy = self._policies.get(policy_id)
        if not policy:
            return None

        update_data = policy_data.model_dump(exclude_unset=True)
        updated_policy = policy.model_copy(update=update_data)
        updated_policy.updated_at = datetime.utcnow()
        self._policies[policy_id] = updated_policy
        return updated_policy

    async def delete_policy(self, policy_id: str) -> bool:
        if policy_id in self._policies:
            del self._policies[policy_id]
            return True
        return False


db = InMemoryDatabase()
