import uuid
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class ActionDecision(str, Enum):
    APPROVE = "approve"
    REJECT = "reject"


class ActionRequest(BaseModel):
    action_type: str = Field(..., description="Type of action being requested")
    resource_id: str = Field(..., description="ID of the resource being acted upon")
    user_id: str = Field(..., description="ID of the user requesting the action")
    metadata: Optional[dict] = Field(
        default=None, description="Additional context for the action"
    )


class TriggeredPolicyInfo(BaseModel):
    """Details of the policy that made the final decision."""

    id: str = Field(..., description="Name or ID of the triggered policy")
    reason: str = Field(..., description="The reason provided by the policy")


class DecisionTrace(BaseModel):
    """
    Provides a detailed trace of the decision-making process for audit purposes.
    """

    triggered_policy: Optional[TriggeredPolicyInfo] = Field(
        default=None,
        description="The deterministic policy that was triggered to make the decision",
    )
    ai_recommendation_summary: Optional[str] = Field(
        default=None, description="A summary of the AI's recommendation, if available"
    )


class ActionResponse(BaseModel):
    decision_id: str = Field(..., description="Unique ID for this decision event")
    decision: ActionDecision
    trace: DecisionTrace = Field(
        ..., description="Detailed trace of the decision process"
    )
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


# --- Policy Definition Models (DSL) ---


class PolicyConditionOperator(str, Enum):
    EQUALS = "equals"
    NOT_EQUALS = "not_equals"
    CONTAINS = "contains"
    NOT_CONTAINS = "not_contains"
    STARTS_WITH = "starts_with"
    ENDS_WITH = "ends_with"


class PolicyCondition(BaseModel):
    """A single condition within a policy."""

    field: str = Field(
        ...,
        description="Field from the ActionRequest to evaluate (e.g., 'action_type', 'resource_id', 'metadata.team')",
    )
    operator: PolicyConditionOperator
    value: str = Field(..., description="The value to compare against")


class PolicyCreate(BaseModel):
    """Schema for creating a new policy."""

    id: str = Field(
        default_factory=lambda: f"pol_{uuid.uuid4().hex[:12]}",
        description="Unique identifier for the policy",
    )
    name: str = Field(..., description="Human-readable name for the policy")
    description: Optional[str] = None
    conditions: list[PolicyCondition] = Field(
        ...,
        description="A list of conditions. All must be true for the policy to trigger (AND logic).",
    )
    decision: ActionDecision = Field(
        ..., description="The decision to make if the policy is triggered"
    )
    reason: str = Field(
        ..., description="The reason to return if the policy is triggered"
    )


class PolicyUpdate(BaseModel):
    """Schema for updating an existing policy."""

    name: Optional[str] = None
    description: Optional[str] = None
    conditions: Optional[list[PolicyCondition]] = None
    decision: Optional[ActionDecision] = None
    reason: Optional[str] = None


class Policy(PolicyCreate):
    """Full policy schema including metadata."""

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


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
