from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ai_client import ai_json_request

router = APIRouter()


class AnalyzeRequest(BaseModel):
    content: str
    content_type: str = "article"
    url: str | None = None


class ClaimItem(BaseModel):
    claim: str
    importance: str


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

    result = await ai_json_request(
        system_prompt="You are a media literacy analyst. Extract factual claims and key information from content. Always respond in valid JSON.",
        user_prompt=prompt,
    )
    return AnalyzeResponse(**result)
