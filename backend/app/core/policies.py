from typing import Optional, Any
from app.models.schemas import ActionRequest, ActionDecision, Policy, PolicyCondition, PolicyConditionOperator
from app.adapters.memory_db import db


class PolicyEngine:
    """
    Deterministic Policy Engine.
    Makes the final decision - AI only advises, never decides.
    """
    
    def _get_field_value(self, request: ActionRequest, field: str) -> Optional[Any]:
        """Dynamically get a value from the request, including nested metadata."""
        if field.startswith("metadata."):
            key = field.split("metadata.")[1]
            return (request.metadata or {}).get(key)
        return getattr(request, field, None)

    def _check_condition(self, request: ActionRequest, condition: PolicyCondition) -> bool:
        """Evaluate a single policy condition against the request."""
        request_value = self._get_field_value(request, condition.field)
        if request_value is None:
            return False

        # Ensure we're comparing strings
        request_value_str = str(request_value).lower()
        condition_value_str = condition.value.lower()

        op = condition.operator
        if op == PolicyConditionOperator.EQUALS:
            return request_value_str == condition_value_str
        if op == PolicyConditionOperator.NOT_EQUALS:
            return request_value_str != condition_value_str
        if op == PolicyConditionOperator.CONTAINS:
            return condition_value_str in request_value_str
        if op == PolicyConditionOperator.NOT_CONTAINS:
            return condition_value_str not in request_value_str
        if op == PolicyConditionOperator.STARTS_WITH:
            return request_value_str.startswith(condition_value_str)
        if op == PolicyConditionOperator.ENDS_WITH:
            return request_value_str.endswith(condition_value_str)
        return False

    async def evaluate(self, request: ActionRequest, ai_recommendation: Optional[str] = None) -> tuple[ActionDecision, str, Optional[str]]:
        """
        Evaluate request against dynamically loaded policies from the database.
        Returns (decision, reason, policy_id).
        """
        policies = await db.get_all_policies()
        
        # Sort by priority, descending. Higher priority policies are checked first.
        policies.sort(key=lambda p: p.priority, reverse=True)

        for policy in policies:
            if not policy.enabled:
                continue

            # All conditions must be met for a policy to trigger (AND logic)
            if all(self._check_condition(request, cond) for cond in policy.conditions):
                return policy.decision, policy.reason, policy.id

        # Fallback to AI recommendation if no deterministic policy matched
        if ai_recommendation:
            if "reject" in ai_recommendation.lower() or "deny" in ai_recommendation.lower():
                reason = f"Rejected based on AI recommendation: {ai_recommendation}"
                return ActionDecision.REJECT, reason, "ai_recommendation"
        
        return ActionDecision.APPROVE, "Action approved by default", None


policy_engine = PolicyEngine()
