from typing import Optional
import logging
import httpx

from app.config import settings
from app.models.schemas import ActionRequest

logger = logging.getLogger(__name__)

GROK_API_URL = "https://api.x.ai/v1/chat/completions"


class AIAdvisor:
    """
    AI Advisory System with Fail-Safe.

    CRITICAL RULES:
    - AI only RECOMMENDS, never DECIDES
    - If AI is unavailable, system CONTINUES (fail-safe)
    - Decision is ALWAYS made by Policy Engine
    """

    def __init__(self):
        self._enabled = settings.AI_ENABLED
        self._api_key = settings.AI_API_KEY

    async def get_recommendation(
        self, request: ActionRequest
    ) -> tuple[Optional[str], bool]:
        """
        Get AI recommendation for an action.

        Returns:
            tuple[Optional[str], bool]: (recommendation, ai_available)

        If AI fails or is disabled, returns (None, False) - system continues!
        """
        if not self._enabled:
            logger.info("AI advisor is disabled")
            return None, False

        if not self._api_key:
            logger.warning("AI API key not configured - continuing without AI")
            return None, False

        try:
            recommendation = await self._call_grok_api(request)
            return recommendation, True
        except Exception as e:
            logger.error(f"AI service error (fail-safe activated): {e}")
            return None, False

    async def _call_grok_api(self, request: ActionRequest) -> str:
        """
        Call Grok API for AI recommendation.

        Uses OpenAI-compatible API format.
        """
        prompt = f"""You are a security advisor for an action decision engine. 
Analyze this action request and provide a brief recommendation (1-2 sentences).

Action Type: {request.action_type}
Resource ID: {request.resource_id}
User ID: {request.user_id}
Metadata: {request.metadata or 'None'}

Respond with either:
- "Recommend approval: [reason]" if the action seems safe
- "Recommend caution: [reason]" if the action needs review
- "Recommend rejection: [reason]" if the action seems risky

Be concise and focus on security implications."""

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                GROK_API_URL,
                headers={
                    "Authorization": f"Bearer {self._api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "grok-beta",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a security advisor. Be concise.",
                        },
                        {"role": "user", "content": prompt},
                    ],
                    "max_tokens": 100,
                    "temperature": 0.3,
                },
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()

    def is_available(self) -> bool:
        """Check if AI service is available"""
        return self._enabled and bool(self._api_key)


ai_advisor = AIAdvisor()
