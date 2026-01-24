from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import ActionRequest, ActionResponse, ActionDecision
from app.domain.event import Event
from app.adapters import db
from app.auth.jwt import get_current_user
import uuid
from datetime import datetime

router = APIRouter(prefix="/action", tags=["Action"])

@router.post("/check", response_model=ActionResponse)
async def check_action(request: ActionRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID not found in token")

    # Adım 1: Aktif Politikayı Bul
    active_policy = await db.get_active_policy_for_action(request.action_type)
    
    decision = ActionDecision.REJECT # Fail-closed: Kural yoksa reddet
    policy_id = None
    policy_version = None

    if active_policy:
        policy_id = active_policy['policy_id']
        policy_version = active_policy['version']
        policy_rules = active_policy['policy_data'].get('rules', [])
        
        # Adım 2: Policy Engine v1.1 - Basit Değerlendirme
        # Kural: Tüm 'rules' koşulları sağlanıyorsa onayla (AND mantığı)
        all_conditions_met = True
        for rule in policy_rules:
            context_value = request.context.get(rule['field'])
            if not context_value or context_value != rule['value']:
                all_conditions_met = False
                break
        
        if all_conditions_met:
            decision = ActionDecision.APPROVE

    # Adım 3: Değiştirilemez Event'i Oluştur
    event_context = request.context
    event_context['user_id'] = user_id

    event = Event(
        event_id=uuid.uuid4(),
        action_type=request.action_type,
        context=event_context,
        decision=decision.value,
        policy_id=policy_id,
        policy_version=policy_version,
        created_at=datetime.utcnow()
    )
    
    # Adım 4: Event'i Veritabanına Kaydet
    await db.create_event(event)
    
    # Adım 5: Cevabı Döndür
    return ActionResponse(
        decision_id=str(event.event_id),
        decision=event.decision,
        trace={"triggered_policy": {"id": policy_id, "version": policy_version} if policy_id else None},
        ai_available=False,
        timestamp=event.created_at
    )
