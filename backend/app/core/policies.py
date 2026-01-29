from typing import Optional, Any
from app.models.schemas import (
    ActionRequest,
    ActionDecision,
    PolicyCondition,
    PolicyConditionOperator,
)
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

    def _check_condition(
        self, request: ActionRequest, condition: PolicyCondition
    ) -> bool:
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

    async def evaluate(
        self, request: ActionRequest
    ) -> tuple[ActionDecision, str, Optional[str], Optional[int]]:
        """
        Evaluate request against dynamically loaded policies from the database.
        Returns (decision, reason, policy_id, version).

        AI is removed from the decision path to ensure determinism and performance.
        AI recommendations are now handled asynchronously as advisory only.
        """
        policies = await db.get_all_policies()
        # Only evaluate active policies
        active_policies = [p for p in policies if p.is_active]

        for policy in active_policies:
            # All conditions must be met for a policy to trigger (AND logic)
            if all(self._check_condition(request, cond) for cond in policy.conditions):
                return policy.decision, policy.reason, policy.id, policy.version

        return ActionDecision.APPROVE, "Action approved by default", None, None


policy_engine = PolicyEngine()
