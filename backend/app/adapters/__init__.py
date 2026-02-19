from .db_postgres import db
from .base_db import BaseDatabase
from .memory_db import InMemoryDatabase

def get_database() -> BaseDatabase:
    """Get the appropriate database based on DB_BACKEND setting."""
    from .config import settings
    
    if settings.DB_BACKEND == "supabase":
        from .supabase_db import SupabaseDatabase
        return SupabaseDatabase()
    elif settings.DB_BACKEND == "postgres":
        return db
    else:
        return InMemoryDatabase()


db = get_database()

__all__ = ["BaseDatabase", "InMemoryDatabase", "db", "get_database"]
