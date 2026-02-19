import asyncpg
from typing import Optional, List, Dict
from app.domain.event import Event
from app.config import settings
from datetime import datetime

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

    async def create_new_policy(self, policy_id: str, policy_data: dict) -> Dict:
        async with self._pool.acquire() as conn:
            async with conn.transaction():
                # Önce bu policy_id ile başka bir politika var mı diye kontrol et
                exists = await conn.fetchval("SELECT 1 FROM policies WHERE policy_id = $1", policy_id)
                if exists:
                    raise ValueError("Policy with this ID already exists.")
                
                new_policy = {
                    "policy_id": policy_id,
                    "version": 1,
                    "is_active": True,
                    "policy_data": policy_data,
                    "created_at": datetime.utcnow(),
                }
                
                query = "INSERT INTO policies (policy_id, version, is_active, policy_data, created_at) VALUES ($1, $2, $3, $4, $5);"
                await conn.execute(query, new_policy['policy_id'], new_policy['version'], new_policy['is_active'], new_policy['policy_data'], new_policy['created_at'])
                return new_policy

    async def create_new_version_of_policy(self, policy_id: str, policy_data: dict) -> Optional[Dict]:
        async with self._pool.acquire() as conn:
            async with conn.transaction():
                # Mevcut aktif sürümü bul ve deaktif et
                deactivate_query = "UPDATE policies SET is_active = false WHERE policy_id = $1 AND is_active = true RETURNING version;"
                last_version = await conn.fetchval(deactivate_query, policy_id)
                
                if last_version is None:
                    return None # Politika bulunamadı

                new_version = last_version + 1
                new_policy = {
                    "policy_id": policy_id,
                    "version": new_version,
                    "is_active": True,
                    "policy_data": policy_data,
                    "created_at": datetime.utcnow(),
                }
                
                insert_query = "INSERT INTO policies (policy_id, version, is_active, policy_data, created_at) VALUES ($1, $2, $3, $4, $5);"
                await conn.execute(insert_query, new_policy['policy_id'], new_policy['version'], new_policy['is_active'], new_policy['policy_data'], new_policy['created_at'])
                return new_policy

    async def get_policy_history(self, policy_id: str) -> List[Dict]:
        query = "SELECT * FROM policies WHERE policy_id = $1 ORDER BY version DESC;"
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(query, policy_id)
            return [dict(row) for row in rows]
            
    async def get_active_policy_for_action(self, action_type: str) -> Optional[Dict]:
        query = """
            SELECT * FROM policies 
            WHERE policy_data->>'action_type' = $1 AND is_active = true;
        """
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(query, action_type)
            return dict(row) if row else None

db = PostgresDatabase()

