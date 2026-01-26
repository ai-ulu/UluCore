from .base_db import BaseDatabase
from .memory_db import InMemoryDatabase
from app.config import settings


def get_database() -> BaseDatabase:
    """Get the appropriate database based on DB_BACKEND setting."""
    if settings.DB_BACKEND == "supabase":
        from .supabase_db import SupabaseDatabase

        return SupabaseDatabase()
    else:
        return InMemoryDatabase()


db = get_database()

__all__ = ["BaseDatabase", "InMemoryDatabase", "db", "get_database"]
