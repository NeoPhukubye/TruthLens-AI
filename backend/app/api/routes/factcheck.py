from fastapi import APIRouter
from pydantic import BaseModel
from openai import AsyncOpenAI

from app.config import get_settings

router = APIRouter()
settings = get_settings()


class FactCheckRequest(BaseModel):
    claims: list[str]


class FactCheckResult(BaseModel):
    claim: str
    verdict: str  # supported, unsupported, partially_supported, unverifiable
    confidence: float
    reasoning: str
    sources: list[str]
    learn_more: str  # educational explanation


class FactCheckResponse(BaseModel):
    results: list[FactCheckResult]


@router.post("/", response_model=FactCheckResponse)
async def fact_check(request: FactCheckRequest):
    client = AsyncOpenAI(api_key=settings.ai_api_key, base_url=settings.ai_base_url)

    claims_text = "\n".join(f"- {c}" for c in request.claims)
    prompt = f"""Fact-check each of the following claims. For each claim:
1. Determine if it's supported, unsupported, partially supported, or unverifiable
2. Explain your reasoning
3. List credible sources that support or contradict the claim
4. Provide an educational explanation (Learn Mode) teaching users HOW to verify this type of claim themselves

Claims:
{claims_text}

Respond in JSON:
{{
  "results": [
    {{
      "claim": "the claim text",
      "verdict": "supported|unsupported|partially_supported|unverifiable",
      "confidence": 0-1.0,
      "reasoning": "explanation of why this verdict",
      "sources": ["source 1", "source 2"],
      "learn_more": "educational explanation of how to verify this type of claim"
    }}
  ]
}}"""

    response = await client.chat.completions.create(
        model=settings.ai_model,
        messages=[
            {"role": "system", "content": "You are a fact-checking expert and educator. Verify claims against established knowledge and teach users how to verify information themselves. Always indicate your confidence level."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
        response_format={"type": "json_object"},
    )

    import json
    result = json.loads(response.choices[0].message.content)
    return FactCheckResponse(**result)
