from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from enum import Enum


class ActionDecision(str, Enum):
    APPROVE = "approve"
    REJECT = "reject"


class ActionRequest(BaseModel):
    action_type: str = Field(..., description="Type of action being requested")
    resource_id: str = Field(..., description="ID of the resource being acted upon")
    user_id: str = Field(..., description="ID of the user requesting the action")
    metadata: Optional[dict] = Field(default=None, description="Additional context for the action")


class ActionResponse(BaseModel):
    event_id: str
    decision: ActionDecision
    reason: str
    ai_recommendation: Optional[str] = None
    ai_available: bool
    timestamp: datetime


class EventResponse(BaseModel):
    id: str
    action_type: str
    resource_id: str
    user_id: str
    decision: ActionDecision
    reason: str
    ai_recommendation: Optional[str]
    ai_available: bool
    metadata: Optional[dict]
    timestamp: datetime


class MetricsResponse(BaseModel):
    total_actions: int
    approved_count: int
    rejected_count: int
    reject_rate: float
    ai_unavailable_count: int


class UserCreate(BaseModel):
    email: str
    password: str
    name: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str]
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class APIKeyCreate(BaseModel):
    name: str = Field(..., description="Name/description for this API key")


class APIKeyResponse(BaseModel):
    id: str
    name: str
    key_prefix: str
    created_at: datetime


class APIKeyCreatedResponse(APIKeyResponse):
    key: str


class PricingPlan(BaseModel):
    id: str
    name: str
    price_monthly: float
    price_yearly: float
    features: list[str]
    actions_limit: int


class BillingWebhookPayload(BaseModel):
    event_type: str
    data: dict
