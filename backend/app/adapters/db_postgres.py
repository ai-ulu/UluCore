import asyncpg
from typing import Optional, Any, List
from app.domain.event import Event
from app.config import settings

class PostgresDatabase:
    _pool: Optional[asyncpg.Pool] = None

    async def connect(self) -> None:
        if not self._pool:
            self._pool = await asyncpg.create_pool(
                dsn=settings.DATABASE_URL,
                min_size=1,
                max_size=10
            )

    async def disconnect(self) -> None:
        if self._pool:
            await self._pool.close()
            self._pool = None

    async def create_event(self, event: Event) -> Event:
        if not self._pool:
            await self.connect()
        
        query = """
            INSERT INTO events (event_id, action_type, context, decision, policy_version, policy_id, ai_advice, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING event_id;
        """
        
        async with self._pool.acquire() as connection:
            await connection.execute(
                query,
                event.event_id,
                event.action_type,
                event.context,
                event.decision,
                event.policy_version,
                event.policy_id,
                event.ai_advice,
                event.created_at
            )
        return event

db = PostgresDatabase()

