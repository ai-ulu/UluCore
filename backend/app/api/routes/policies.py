from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.models.schemas import Policy, PolicyCreate, PolicyUpdate
from app.adapters.memory_db import db
from app.auth.jwt import require_jwt

router = APIRouter(prefix="/policies", tags=["Policies"])


@router.post("", response_model=Policy, status_code=status.HTTP_201_CREATED)
async def create_policy(
    policy_data: PolicyCreate,
    user: dict = Depends(require_jwt),
):
    """
    Create a new policy.
    Requires authentication.
    """
    policy = await db.create_policy(policy_data)
    return policy


@router.get("", response_model=List[Policy])
async def list_policies(
    user: dict = Depends(require_jwt),
):
    """
    List all policies.
    Requires authentication.
    """
    return await db.get_all_policies()


@router.get("/{policy_id}", response_model=Policy)
async def get_policy(
    policy_id: str,
    user: dict = Depends(require_jwt),
):
    """
    Get a specific policy by its ID.
    Requires authentication.
    """
    policy = await db.get_policy(policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy


@router.put("/{policy_id}", response_model=Policy)
async def update_policy(
    policy_id: str,
    policy_data: PolicyUpdate,
    user: dict = Depends(require_jwt),
):
    """
    Update an existing policy.
    Requires authentication.
    """
    policy = await db.update_policy(policy_id, policy_data)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy


@router.delete("/{policy_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_policy(
    policy_id: str,
    user: dict = Depends(require_jwt),
):
    """
    Delete a policy.
    Requires authentication.
    """
    deleted = await db.delete_policy(policy_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Policy not found")
    return
