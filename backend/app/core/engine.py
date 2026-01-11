from datetime import datetime
import uuid

from app.models.schemas import (
    ActionRequest,
    ActionResponse,
    ActionDecision,
    DecisionTrace,
    TriggeredPolicyInfo,
)
from app.domain.event import Event
from app.adapters import db
from app.core.policies import policy_engine
from app.core.ai_advisor import ai_advisor


class ActionEngine:
    """
    Main Action Engine.
    
    Flow:
    1. Receive action request
    2. Get AI recommendation (fail-safe if unavailable)
    3. Policy Engine makes decision
    4. Log immutable event
    5. Return response
    """
    
    async def process_action(self, request: ActionRequest) -> ActionResponse:
        """Process an action request and return decision"""
        
        ai_recommendation, ai_available = await ai_advisor.get_recommendation(request)
        
        decision, reason, policy_id = policy_engine.evaluate(request, ai_recommendation)
        
        # Create the decision trace
        trace = DecisionTrace(
            ai_recommendation_summary=ai_recommendation
        )
        if policy_id:
            trace.triggered_policy = TriggeredPolicyInfo(id=policy_id, reason=reason)

        # Log the immutable event
        event = Event(
            id=str(uuid.uuid4()),
            action_type=request.action_type,
            resource_id=request.resource_id,
            user_id=request.user_id,
            decision=decision.value,
            reason=reason, # Keep original reason for detailed logging
            ai_recommendation=ai_recommendation,
            ai_available=ai_available,
            metadata=request.metadata,
            timestamp=datetime.utcnow(),
            trace=trace,
        )
        
        await db.create_event(event)
        
        # Return the structured response
        return ActionResponse(
            decision_id=event.id,
            decision=decision,
            trace=trace,
            ai_available=ai_available,
            timestamp=event.timestamp,
        )


action_engine = ActionEngine()
