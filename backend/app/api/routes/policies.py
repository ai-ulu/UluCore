from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.schemas import PolicyCreateRequest, PolicyUpdateRequest, PolicyResponse
from app.adapters import db
from app.auth.jwt import get_current_user

router = APIRouter(prefix="/policies", tags=["Policies"])

@router.post("", response_model=PolicyResponse, status_code=status.HTTP_201_CREATED)
async def create_policy(request: PolicyCreateRequest, user: dict = Depends(get_current_user)):
    """
    Creates the first version of a new policy.
    """
    # TODO: Implement db.create_new_policy
    policy = await db.create_new_policy(
        policy_id=request.policy_id,
        policy_data=request.policy_data
    )
    return policy

@router.put("/{policy_id}", response_model=PolicyResponse)
async def update_policy(policy_id: str, request: PolicyUpdateRequest, user: dict = Depends(get_current_user)):
    """
    Creates a new version of an existing policy, deactivating the previous one.
    """
    # TODO: Implement db.create_new_version_of_policy
    policy = await db.create_new_version_of_policy(
        policy_id=policy_id,
        policy_data=request.policy_data
    )
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy

@router.get("/{policy_id}", response_model=List[PolicyResponse])
async def get_policy_history(policy_id: str, user: dict = Depends(get_current_user)):
    """
    Returns the complete version history of a policy.
    """
    # TODO: Implement db.get_policy_history
    history = await db.get_policy_history(policy_id=policy_id)
    if not history:
        raise HTTPException(status_code=404, detail="Policy not found")
    return history
