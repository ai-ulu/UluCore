from typing import Optional
from app.models.schemas import ActionRequest, ActionDecision


class PolicyEngine:
    """
    Deterministic Policy Engine.
    Makes the final decision - AI only advises, never decides.
    """
    
    def __init__(self):
        self._policies: list[dict] = [
            {
                "name": "block_delete_production",
                "condition": lambda req: req.action_type == "delete" and "production" in req.resource_id.lower(),
                "decision": ActionDecision.REJECT,
                "reason": "Delete operations on production resources are blocked by policy",
            },
            {
                "name": "block_admin_without_approval",
                "condition": lambda req: req.action_type == "admin_access" and not (req.metadata or {}).get("approved"),
                "decision": ActionDecision.REJECT,
                "reason": "Admin access requires prior approval",
            },
            {
                "name": "rate_limit_exceeded",
                "condition": lambda req: (req.metadata or {}).get("rate_limit_exceeded", False),
                "decision": ActionDecision.REJECT,
                "reason": "Rate limit exceeded for this resource",
            },
        ]
    
    def evaluate(self, request: ActionRequest, ai_recommendation: Optional[str] = None) -> tuple[ActionDecision, str, Optional[str]]:
        """
        Evaluate request against policies.
        Returns (decision, reason, policy_id).
        
        Policy Engine is the DECISION MAKER.
        AI recommendation is considered but not binding.
        """
        for policy in self._policies:
            if policy["condition"](request):
                return policy["decision"], policy["reason"], policy["name"]
        
        if ai_recommendation:
            if "reject" in ai_recommendation.lower() or "deny" in ai_recommendation.lower():
                reason = f"Rejected based on AI recommendation: {ai_recommendation}"
                return ActionDecision.REJECT, reason, "ai_recommendation"
        
        return ActionDecision.APPROVE, "Action approved by policy engine", None
    
    def add_policy(self, name: str, condition: callable, decision: ActionDecision, reason: str):
        """Add a new policy rule"""
        self._policies.append({
            "name": name,
            "condition": condition,
            "decision": decision,
            "reason": reason,
        })


policy_engine = PolicyEngine()
