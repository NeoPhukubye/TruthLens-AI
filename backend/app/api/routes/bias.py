from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ai_client import ai_json_request

router = APIRouter()


class BiasRequest(BaseModel):
    content: str


class BiasIndicator(BaseModel):
    type: str
    severity: str
    evidence: str


class BiasResponse(BaseModel):
    overall_bias_score: float
    indicators: list[BiasIndicator]
    political_leaning: str
    emotional_tone: str
    recommendations: list[str]


@router.post("/", response_model=BiasResponse)
async def detect_bias(request: BiasRequest):
    prompt = f"""Analyze this content for bias, emotional manipulation, and framing techniques.

Content: {request.content}

Detect:
- Political bias
- Emotional language
- Sensationalism
- Propaganda techniques
- Clickbait patterns

Respond in JSON:
{{
  "overall_bias_score": 0-100 (0=unbiased, 100=extremely biased),
  "indicators": [{{"type": "emotional|political|sensationalism|propaganda|clickbait", "severity": "high|medium|low", "evidence": "quote or example"}}],
  "political_leaning": "left|center-left|center|center-right|right|unknown",
  "emotional_tone": "description of dominant emotional tone",
  "recommendations": ["suggestion for more balanced perspective"]
}}"""

    result = await ai_json_request(
        system_prompt="You are a media bias detection expert. Identify bias, emotional manipulation, and framing techniques in content. Be specific with evidence.",
        user_prompt=prompt,
    )
    return BiasResponse(**result)
