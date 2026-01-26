from typing import Optional
from fastapi import APIRouter, Depends, Query

from app.models.schemas import EventResponse
from app.adapters import db
from app.auth.jwt import get_current_user

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("", response_model=list[EventResponse])
async def get_events(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user),
):
    """
    Get audit log events.

    Events are immutable - append only, never updated or deleted.
    Requires JWT authentication.
    """
    events = await db.get_events(user_id=user_id, limit=limit, offset=offset)
    return [
        EventResponse(
            id=e.id,
            action_type=e.action_type,
            resource_id=e.resource_id,
            user_id=e.user_id,
            decision=e.decision,
            reason=e.reason,
            ai_recommendation=e.ai_recommendation,
            ai_available=e.ai_available,
            metadata=e.metadata,
            timestamp=e.timestamp,
        )
        for e in events
    ]
