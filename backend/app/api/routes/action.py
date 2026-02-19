from typing import Optional
from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.responses import JSONResponse

from app.models.schemas import ActionRequest, ActionResponse, ActionDecision
from app.domain.event import Event
from app.adapters import db
from app.auth.jwt import get_current_user
from app.auth.api_key import require_api_key
import uuid
from datetime import datetime

router = APIRouter(prefix="/action", tags=["Action"])

@router.post("/check", response_model=ActionResponse)
async def check_action(request: ActionRequest, current_user: dict = Depends(get_current_user)):
    """
    This is the core endpoint of UluCore.
    It performs a check, makes a decision, and creates an immutable event log.
    """
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

@router.post("", response_model=ActionResponse)
async def process_action(
    request: ActionRequest,
    user: dict = Depends(require_api_key),
    x_idempotency_key: Optional[str] = Header(None),
):
    """
    Process an action request.
    Returns approve/reject decision with immutable audit log.
    Requires API key authentication.
    Supports X-Idempotency-Key for exactly-once processing.
    """
    user_id = user["id"]

    if x_idempotency_key:
        existing_record = await db.get_idempotency_record(x_idempotency_key, user_id)
        if existing_record:
            return JSONResponse(
                content=existing_record["response_body"],
                status_code=existing_record["status_code"],
                headers={"X-Idempotency-Hit": "true"},
            )

    # Process using action engine
    active_policy = await db.get_active_policy_for_action(request.action_type)
    
    decision = ActionDecision.REJECT
    policy_id = None
    policy_version = None

    if active_policy:
        policy_id = active_policy['policy_id']
        policy_version = active_policy['version']
        policy_rules = active_policy['policy_data'].get('rules', [])
        
        all_conditions_met = True
        for rule in policy_rules:
            context_value = request.context.get(rule['field'])
            if not context_value or context_value != rule['value']:
                all_conditions_met = False
                break
        
        if all_conditions_met:
            decision = ActionDecision.APPROVE

    event = Event(
        event_id=uuid.uuid4(),
        action_type=request.action_type,
        context=request.context,
        decision=decision.value,
        policy_id=policy_id,
        policy_version=policy_version,
        created_at=datetime.utcnow()
    )
    
    await db.create_event(event)
    
    result = ActionResponse(
        decision_id=str(event.event_id),
        decision=event.decision,
        trace={"triggered_policy": {"id": policy_id, "version": policy_version} if policy_id else None},
        ai_available=False,
        timestamp=event.created_at
    )

    if x_idempotency_key:
        response_body = result.model_dump()
        response_body["timestamp"] = response_body["timestamp"].isoformat()

        await db.create_idempotency_record(
            key=x_idempotency_key,
            user_id=user_id,
            response_body=response_body,
            status_code=200,
        )

    return result
