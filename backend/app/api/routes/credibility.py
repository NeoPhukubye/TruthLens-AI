from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ai_client import ai_json_request

router = APIRouter()


class CredibilityRequest(BaseModel):
    content: str
    source_url: str | None = None


class CredibilityBreakdown(BaseModel):
    source_reliability: float
    evidence_quality: float
    bias_level: float
    manipulation_risk: float


class CredibilityResponse(BaseModel):
    overall_score: float
    breakdown: CredibilityBreakdown
    explanation: str
    confidence: float


@router.post("/", response_model=CredibilityResponse)
async def check_credibility(request: CredibilityRequest):
    prompt = f"""Evaluate the credibility of this content. Score each dimension from 0-100.

Content: {request.content}
Source URL: {request.source_url or "Not provided"}

Respond in JSON:
{{
  "overall_score": 0-100,
  "breakdown": {{
    "source_reliability": 0-100,
    "evidence_quality": 0-100,
    "bias_level": 0-100 (lower is better),
    "manipulation_risk": 0-100 (lower is better)
  }},
  "explanation": "Brief explanation of the score",
  "confidence": 0-1.0 (your confidence in this assessment)
}}"""

    result = await ai_json_request(
        system_prompt="You are a credibility assessment expert. Evaluate content based on source reliability, evidence quality, bias level, and manipulation risk. Be rigorous and explain your reasoning.",
        user_prompt=prompt,
    )
    return CredibilityResponse(**result)
