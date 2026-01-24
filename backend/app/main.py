from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.config import settings
from app.adapters import db

app = FastAPI(
    title="UluCore",
    description="Action decision engine with AI advisory and immutable audit logging",
    version=settings.VERSION,
)

@app.on_event("startup")
async def startup():
    await db.connect()

@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()

# CORS configuration - configurable via CORS_ORIGINS env var
# In production, set CORS_ORIGINS to your specific domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "ulucore",
        "version": settings.VERSION,
        "env": settings.ENV,
    }


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}
