import uuid
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from enum import Enum


class ActionDecision(str, Enum):
    APPROVE = "approve"
    REJECT = "reject"


class ActionRequest(BaseModel):
    action_type: str = Field(..., description="Type of action being requested, e.g., 'users.delete'")
    context: dict = Field(..., description="A JSON object containing all relevant context for the decision")


class TriggeredPolicyInfo(BaseModel):
    """Details of the policy that made the final decision."""
    id: str = Field(..., description="Name or ID of the triggered policy")
    reason: str = Field(..., description="The reason provided by the policy")


class DecisionTrace(BaseModel):
    """
    Provides a detailed trace of the decision-making process for audit purposes.
    """
    triggered_policy: Optional[TriggeredPolicyInfo] = Field(default=None, description="The deterministic policy that was triggered to make the decision")
    ai_recommendation_summary: Optional[str] = Field(default=None, description="A summary of the AI's recommendation, if available")


class ActionResponse(BaseModel):
    decision_id: str = Field(..., description="Unique ID for this decision event")
    decision: ActionDecision
    trace: DecisionTrace = Field(..., description="Detailed trace of the decision process")
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


# --- Policy Definition Models (v2 - Versioned) ---

class PolicyCreateRequest(BaseModel):
    """Schema for creating the first version of a policy."""
    policy_id: str = Field(default_factory=lambda: f"pol_{uuid.uuid4().hex[:12]}", description="Unique identifier for a policy group.")
    policy_data: dict = Field(..., description="The JSON object representing the policy rules. Must contain an 'action_type' key.")

class PolicyUpdateRequest(BaseModel):
    """Schema for updating a policy (which creates a new version)."""
    policy_data: dict = Field(..., description="The new JSON object representing the policy rules.")

class PolicyResponse(BaseModel):
    """Response schema for a single policy version."""
    policy_id: str
    version: int
    is_active: bool
    policy_data: dict
    created_at: datetime



# --- Simulation Models ---

class SimulationRequest(BaseModel):
    """Schema for a policy simulation request."""
    policy: Policy
    request: ActionRequest


class SimulationResponse(BaseModel):
    """Schema for a policy simulation response."""
    decision: ActionDecision
    trace: DecisionTrace
    timestamp: datetime = Field(default_factory=datetime.utcnow)
