from fastapi import APIRouter, Depends

from app.models.schemas import MetricsResponse
from app.adapters import db
from app.auth.jwt import get_current_user

router = APIRouter(prefix="/metrics", tags=["Metrics"])


@router.get("", response_model=MetricsResponse)
async def get_metrics(
    current_user: dict = Depends(get_current_user),
):
    """
    Get aggregated metrics.
    
    Returns:
    - total_actions
    - approved_count
    - rejected_count
    - reject_rate
    - ai_unavailable_count
    
    Calculated via aggregation, no cache required.
    Requires JWT authentication.
    """
    metrics = await db.get_metrics()
    return MetricsResponse(**metrics)
