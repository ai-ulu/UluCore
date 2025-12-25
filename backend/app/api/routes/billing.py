from fastapi import APIRouter, Depends, HTTPException, status

from app.models.schemas import PricingPlan, BillingWebhookPayload
from app.auth.jwt import get_current_user
from app.config import settings

router = APIRouter(prefix="/billing", tags=["Billing"])

PRICING_PLANS = [
    PricingPlan(
        id="free",
        name="Free",
        price_monthly=0,
        price_yearly=0,
        features=[
            "100 actions/month",
            "Basic policy engine",
            "Community support",
        ],
        actions_limit=100,
    ),
    PricingPlan(
        id="pro",
        name="Pro",
        price_monthly=29,
        price_yearly=290,
        features=[
            "10,000 actions/month",
            "Advanced policy engine",
            "AI recommendations",
            "Priority support",
            "Custom policies",
        ],
        actions_limit=10000,
    ),
    PricingPlan(
        id="enterprise",
        name="Enterprise",
        price_monthly=199,
        price_yearly=1990,
        features=[
            "Unlimited actions",
            "Full policy engine",
            "AI recommendations",
            "Dedicated support",
            "Custom policies",
            "SLA guarantee",
            "Self-hosted option",
        ],
        actions_limit=-1,
    ),
]


@router.get("/plans", response_model=list[PricingPlan])
async def get_pricing_plans():
    """
    Get available pricing plans.
    
    Public endpoint - no authentication required.
    """
    return PRICING_PLANS


@router.post("/webhook")
async def stripe_webhook(payload: BillingWebhookPayload):
    """
    Stripe webhook endpoint.
    
    Handles subscription events from Stripe.
    In production, verify webhook signature with STRIPE_WEBHOOK_SECRET.
    """
    if not settings.STRIPE_WEBHOOK_SECRET:
        pass
    
    event_type = payload.event_type
    
    if event_type == "checkout.session.completed":
        pass
    elif event_type == "customer.subscription.updated":
        pass
    elif event_type == "customer.subscription.deleted":
        pass
    
    return {"status": "received"}


@router.get("/subscription")
async def get_subscription(
    current_user: dict = Depends(get_current_user),
):
    """
    Get current user's subscription status.
    
    Requires JWT authentication.
    """
    return {
        "plan": "free",
        "status": "active",
        "actions_used": 0,
        "actions_limit": 100,
    }
