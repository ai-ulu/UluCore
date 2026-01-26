from fastapi import APIRouter, Depends

from app.models.schemas import ActionRequest, ActionResponse
from app.core.engine import action_engine
from app.auth.api_key import require_api_key

router = APIRouter(prefix="/action", tags=["Action"])


@router.post("", response_model=ActionResponse)
async def process_action(
    request: ActionRequest,
    user: dict = Depends(require_api_key),
):
    """
    Process an action request.

    Returns approve/reject decision with immutable audit log.
    Requires API key authentication.
    """
    return await action_engine.process_action(request)
