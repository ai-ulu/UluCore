from .base_db import BaseDatabase
from typing import Optional, Any, List
from app.domain.event import Event

# Bu dosyanın içeriği, Alembic migration'ları oluşturulurken
# sunucunun çökmesini engellemek için geçici olarak basitleştirilmiştir.
# Migration tamamlandıktan sonra asyncpg kullanılarak doldurulacaktır.

class PostgresDatabase(BaseDatabase):
    async def connect(self, *args, **kwargs) -> None:
        print("Database connection (mocked)")
        pass

    async def disconnect(self, *args, **kwargs) -> None:
        print("Database disconnection (mocked)")
        pass

    async def create_event(self, event: Event) -> Event:
        print(f"Creating event (mocked): {event.id}")
        return event

    async def get_events(self, user_id: Optional[str] = None, limit: int = 100, offset: int = 0) -> list[Event]:
        print("Getting events (mocked)")
        return []

    async def get_event_by_id(self, event_id: str) -> Optional[Event]:
        print(f"Getting event by id (mocked): {event_id}")
        return None

    async def get_user_by_email(self, email: str) -> Optional[dict]:
        print(f"Getting user by email (mocked): {email}")
        return None
        
    async def get_user_by_id(self, user_id: str) -> Optional[dict]:
        print(f"Getting user by id (mocked): {user_id}")
        return {"id": user_id, "email": "mock@user.com"}

    # Eksik olan abstract metodlar
    async def create_api_key(self, *args, **kwargs):
        pass
    async def create_user(self, *args, **kwargs):
        pass
    async def delete_api_key(self, *args, **kwargs):
        pass
    async def get_api_key_by_hash(self, *args, **kwargs):
        pass
    async def get_api_keys_by_user(self, *args, **kwargs):
        return []
    async def get_metrics(self, *args, **kwargs):
        return {}

