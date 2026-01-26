from fastapi import APIRouter, status

from app.models.schemas import (
    SimulationRequest,
    SimulationResponse,
    ActionDecision,
    DecisionTrace,
    TriggeredPolicyInfo,
)
from app.core.policies import policy_engine
from app.auth.jwt import require_jwt

router = APIRouter(prefix="/simulate", tags=["Simulation"])


@router.post("", response_model=SimulationResponse, status_code=status.HTTP_200_OK)
async def simulate_policy(
    sim_request: SimulationRequest,
    user: dict = require_jwt,
):
    """
    Simulate a policy against an action request without creating an event.

    This endpoint allows you to test a policy's behavior in a safe,
    read-only environment. The decision will not be logged.

    Requires authentication.
    """
    policy = sim_request.policy
    request = sim_request.request

    # Use the existing condition checking logic from the policy engine
    # We are re-implementing the core logic here for a single policy
    # to avoid database interaction and event logging.

    is_triggered = all(
        policy_engine._check_condition(request, cond) for cond in policy.conditions
    )

    if is_triggered:
        decision = policy.decision
        trace = DecisionTrace(
            triggered_policy=TriggeredPolicyInfo(
                id=policy.id,
                reason=policy.reason,
            )
        )
    else:
        # If the policy doesn't trigger, the default outcome is APPROVE
        decision = ActionDecision.APPROVE
        trace = DecisionTrace(triggered_policy=None)

    return SimulationResponse(decision=decision, trace=trace)
