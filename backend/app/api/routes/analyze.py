from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import AsyncOpenAI

from app.config import get_settings

router = APIRouter()
settings = get_settings()


class AnalyzeRequest(BaseModel):
    content: str
    content_type: str = "article"  # article, tweet, post, message, blog
    url: str | None = None


class ClaimItem(BaseModel):
    claim: str
    importance: str  # high, medium, low


class AnalyzeResponse(BaseModel):
    claims: list[ClaimItem]
    key_facts: list[str]
    entities: list[str]
    statistics: list[str]
    summary: str


@router.post("/", response_model=AnalyzeResponse)
async def analyze_content(request: AnalyzeRequest):
    if not request.content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty")

    client = AsyncOpenAI(api_key=settings.ai_api_key, base_url=settings.ai_base_url)

    prompt = f"""Analyze the following {request.content_type} and extract:
1. Main claims (with importance: high/medium/low)
2. Key facts stated
3. Important entities (people, organizations, places)
4. Statistics or numbers mentioned
5. A brief summary

Content:
{request.content}

Respond in JSON format:
{{
  "claims": [{{"claim": "...", "importance": "high|medium|low"}}],
  "key_facts": ["..."],
  "entities": ["..."],
  "statistics": ["..."],
  "summary": "..."
}}"""

    response = await client.chat.completions.create(
        model=settings.ai_model,
        messages=[
            {"role": "system", "content": "You are a media literacy analyst. Extract factual claims and key information from content. Always respond in valid JSON."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
        response_format={"type": "json_object"},
    )

    import json
    result = json.loads(response.choices[0].message.content)
    return AnalyzeResponse(**result)
