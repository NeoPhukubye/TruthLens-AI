from fastapi import APIRouter
from pydantic import BaseModel
from openai import AsyncOpenAI

from app.config import get_settings

router = APIRouter()
settings = get_settings()


class BiasRequest(BaseModel):
    content: str


class BiasIndicator(BaseModel):
    type: str  # political, emotional, sensationalism, propaganda, clickbait
    severity: str  # high, medium, low
    evidence: str


class BiasResponse(BaseModel):
    overall_bias_score: float
    indicators: list[BiasIndicator]
    political_leaning: str  # left, center-left, center, center-right, right, unknown
    emotional_tone: str
    recommendations: list[str]


@router.post("/", response_model=BiasResponse)
async def detect_bias(request: BiasRequest):
    client = AsyncOpenAI(api_key=settings.ai_api_key, base_url=settings.ai_base_url)

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

    response = await client.chat.completions.create(
        model=settings.ai_model,
        messages=[
            {"role": "system", "content": "You are a media bias detection expert. Identify bias, emotional manipulation, and framing techniques in content. Be specific with evidence."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
        response_format={"type": "json_object"},
    )

    import json
    result = json.loads(response.choices[0].message.content)
    return BiasResponse(**result)
