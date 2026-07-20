import json
import logging

from fastapi import HTTPException
from openai import AsyncOpenAI, APIConnectionError, RateLimitError, APIStatusError

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def get_ai_client() -> AsyncOpenAI:
    if not settings.ai_api_key:
        raise HTTPException(status_code=503, detail="AI service not configured")
    return AsyncOpenAI(api_key=settings.ai_api_key, base_url=settings.ai_base_url)


async def ai_json_request(
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.2,
    model: str | None = None,
    messages: list | None = None,
) -> dict:
    client = get_ai_client()
    used_model = model or settings.ai_model

    if messages is None:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

    try:
        response = await client.chat.completions.create(
            model=used_model,
            messages=messages,
            temperature=temperature,
            response_format={"type": "json_object"},
        )
    except APIConnectionError:
        logger.error("Failed to connect to AI provider")
        raise HTTPException(status_code=503, detail="AI service is currently unavailable. Please try again later.")
    except RateLimitError:
        logger.warning("AI provider rate limit exceeded")
        raise HTTPException(status_code=429, detail="Service is busy. Please wait a moment and try again.")
    except APIStatusError as e:
        logger.error(f"AI provider error: {e.status_code} - {e.message}")
        raise HTTPException(status_code=502, detail="AI service returned an error. Please try again.")
    except Exception as e:
        logger.error(f"Unexpected AI error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during analysis.")

    raw_content = response.choices[0].message.content
    if not raw_content:
        raise HTTPException(status_code=502, detail="AI service returned an empty response.")

    try:
        return json.loads(raw_content)
    except json.JSONDecodeError:
        logger.error(f"Failed to parse AI response as JSON: {raw_content[:200]}")
        raise HTTPException(status_code=502, detail="AI service returned an invalid response format.")
