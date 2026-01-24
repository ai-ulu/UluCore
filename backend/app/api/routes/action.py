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
    """
    This is the core endpoint of UluCore.
    It performs a check, makes a decision, and creates an immutable event log.
    """
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID not found in token")

    # Adım 1: Policy Engine'i Çalıştır (v1 - Şimdilik basit mantık)
    # Kural: Eğer context içinde 'allow' anahtarı varsa ve değeri true ise onayla.
    is_allowed = request.context.get("allow", False)
    decision = ActionDecision.APPROVE if is_allowed else ActionDecision.REJECT
    
    # Adım 2: Değiştirilemez Event'i Oluştur
    event_context = request.context
    event_context['user_id'] = user_id # user_id'yi context'e ekleyelim

    event = Event(
        event_id=uuid.uuid4(),
        action_type=request.action_type,
        context=event_context,
        decision=decision.value,
        created_at=datetime.utcnow()
    )
    
    # Adım 3: Event'i Veritabanına Kaydet
    await db.create_event(event)
    
    # Adım 4: Cevabı Döndür
    # ActionResponse'un beklediği alanları doldurmamız gerekiyor.
    # Şimdilik trace gibi alanları boş/sahte verilerle dolduralım.
    return ActionResponse(
        decision_id=str(event.event_id),
        decision=event.decision,
        trace={"triggered_policy": None, "ai_recommendation_summary": None},
        ai_available=False, # AI henüz bağlı değil
        timestamp=event.created_at
    )
