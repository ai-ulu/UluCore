import os
import secrets
from dotenv import load_dotenv

load_dotenv()


def get_jwt_secret() -> str:
    secret = os.getenv("JWT_SECRET")
    if not secret:
        secret = secrets.token_urlsafe(32)
    return secret


class Settings:
    ENV: str = os.getenv("ENV", "development")
    VERSION: str = "1.0.0"

    JWT_SECRET: str = get_jwt_secret()
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24

    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")

    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_ENABLED: bool = os.getenv("AI_ENABLED", "true").lower() == "true"

    DB_BACKEND: str = os.getenv("DB_BACKEND", "inmemory")

    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

    CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS", "*").split(",")


settings = Settings()
