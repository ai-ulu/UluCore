from abc import ABC, abstractmethod
from typing import Optional
from app.domain.event import Event


class BaseDatabase(ABC):
    """
    Abstract base class for database adapters.
    DB-Agnostic: Supabase is an adapter, not the soul.
    """

    @abstractmethod
    async def create_event(self, event: Event) -> Event:
        """Append a new event (immutable, no updates)"""
        pass

    @abstractmethod
    async def get_events(
        self, user_id: Optional[str] = None, limit: int = 100, offset: int = 0
    ) -> list[Event]:
        """Get events, optionally filtered by user_id"""
        pass

    @abstractmethod
    async def get_event_by_id(self, event_id: str) -> Optional[Event]:
        """Get a single event by ID"""
        pass

    @abstractmethod
    async def get_metrics(self) -> dict:
        """Get aggregated metrics"""
        pass

    @abstractmethod
    async def create_user(
        self, email: str, password_hash: str, name: Optional[str] = None
    ) -> dict:
        """Create a new user"""
        pass

    @abstractmethod
    async def get_user_by_email(self, email: str) -> Optional[dict]:
        """Get user by email"""
        pass

    @abstractmethod
    async def get_user_by_id(self, user_id: str) -> Optional[dict]:
        """Get user by ID"""
        pass

    @abstractmethod
    async def create_api_key(
        self, user_id: str, name: str, key_hash: str, key_prefix: str
    ) -> dict:
        """Create a new API key"""
        pass

    @abstractmethod
    async def get_api_keys_by_user(self, user_id: str) -> list[dict]:
        """Get all API keys for a user"""
        pass

    @abstractmethod
    async def get_api_key_by_hash(self, key_hash: str) -> Optional[dict]:
        """Get API key by its hash"""
        pass

    @abstractmethod
    async def delete_api_key(self, key_id: str, user_id: str) -> bool:
        """Delete an API key"""
        pass
