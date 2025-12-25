from fastapi import APIRouter

from app.api.routes import (
    action_router,
    events_router,
    metrics_router,
    api_keys_router,
    auth_router,
    billing_router,
)

api_router = APIRouter()

api_router.include_router(action_router)
api_router.include_router(events_router)
api_router.include_router(metrics_router)
api_router.include_router(api_keys_router)
api_router.include_router(auth_router)
api_router.include_router(billing_router)
