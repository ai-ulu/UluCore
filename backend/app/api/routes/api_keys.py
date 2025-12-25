from fastapi import APIRouter, Depends, HTTPException, status

from app.models.schemas import APIKeyCreate, APIKeyResponse, APIKeyCreatedResponse
from app.adapters import db
from app.auth.jwt import get_current_user
from app.auth.api_key import generate_api_key

router = APIRouter(prefix="/api-keys", tags=["API Keys"])


@router.post("", response_model=APIKeyCreatedResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    request: APIKeyCreate,
    current_user: dict = Depends(get_current_user),
):
    """
    Create a new API key.
    
    The full key is only returned once - store it securely!
    Requires JWT authentication.
    """
    key, key_hash, key_prefix = generate_api_key()
    
    api_key = await db.create_api_key(
        user_id=current_user["id"],
        name=request.name,
        key_hash=key_hash,
        key_prefix=key_prefix,
    )
    
    return APIKeyCreatedResponse(
        id=api_key["id"],
        name=api_key["name"],
        key_prefix=api_key["key_prefix"],
        created_at=api_key["created_at"],
        key=key,
    )


@router.get("", response_model=list[APIKeyResponse])
async def list_api_keys(
    current_user: dict = Depends(get_current_user),
):
    """
    List all API keys for the current user.
    
    Note: Full keys are not returned - only prefixes.
    Requires JWT authentication.
    """
    keys = await db.get_api_keys_by_user(current_user["id"])
    return [
        APIKeyResponse(
            id=k["id"],
            name=k["name"],
            key_prefix=k["key_prefix"],
            created_at=k["created_at"],
        )
        for k in keys
    ]


@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_api_key(
    key_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Delete an API key.
    
    Requires JWT authentication.
    """
    deleted = await db.delete_api_key(key_id, current_user["id"])
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found",
        )
