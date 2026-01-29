from typing import Optional
from fastapi import APIRouter, Depends, Header, Response
from fastapi.responses import JSONResponse

from app.models.schemas import ActionRequest, ActionResponse
from app.core.engine import action_engine
from app.auth.api_key import require_api_key
from app.adapters import db

router = APIRouter(prefix="/action", tags=["Action"])


@router.post("", response_model=ActionResponse)
async def process_action(
    request: ActionRequest,
    user: dict = Depends(require_api_key),
    x_idempotency_key: Optional[str] = Header(None),
):
    """
    Process an action request.

    Returns approve/reject decision with immutable audit log.
    Requires API key authentication.
    Supports X-Idempotency-Key for exactly-once processing.
    """
    user_id = user["id"]

    if x_idempotency_key:
        existing_record = await db.get_idempotency_record(x_idempotency_key, user_id)
        if existing_record:
            return JSONResponse(
                content=existing_record["response_body"],
                status_code=existing_record["status_code"],
                headers={"X-Idempotency-Hit": "true"},
            )

    result = await action_engine.process_action(request)

    if x_idempotency_key:
        # Convert Pydantic model to dict for storage
        response_body = result.model_dump()
        # Handle datetime serialization for JSON storage
        response_body["timestamp"] = response_body["timestamp"].isoformat()

        await db.create_idempotency_record(
            key=x_idempotency_key,
            user_id=user_id,
            response_body=response_body,
            status_code=200,
        )

    return result
