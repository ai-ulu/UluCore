from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
import uuid

from app.models.schemas import DecisionTrace


@dataclass(frozen=True)
class Event:
    event_id: uuid.UUID = field(default_factory=uuid.uuid4)
    action_type: str
    context: dict
    decision: str
    policy_version: Optional[int] = None
    policy_id: Optional[str] = None
    ai_advice: Optional[dict] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
