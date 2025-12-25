from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
import uuid


@dataclass(frozen=True)
class Event:
    """
    Immutable Event entity.
    Events are APPEND-ONLY - never updated or deleted.
    """
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    action_type: str = ""
    resource_id: str = ""
    user_id: str = ""
    decision: str = ""
    reason: str = ""
    ai_recommendation: Optional[str] = None
    ai_available: bool = True
    metadata: Optional[dict] = None
    timestamp: datetime = field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "action_type": self.action_type,
            "resource_id": self.resource_id,
            "user_id": self.user_id,
            "decision": self.decision,
            "reason": self.reason,
            "ai_recommendation": self.ai_recommendation,
            "ai_available": self.ai_available,
            "metadata": self.metadata,
            "timestamp": self.timestamp.isoformat(),
        }
