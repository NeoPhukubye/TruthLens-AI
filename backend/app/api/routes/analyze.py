from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import json

from app.services.ai_client import ai_json_request
from app.database import get_db
from app.models.models import Analysis, User, UserProgress
from app.api.routes.auth import get_current_user

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
    mil_competency: str = ""
    mil_competency_description: str = ""


MIL_COMPETENCIES = {
    "article": ("Source Evaluation", "UNESCO MIL Competency 3: Ability to evaluate information sources for credibility and reliability"),
    "tweet": ("Digital Citizenship", "UNESCO MIL Competency 7: Understanding how social media shapes information"),
    "post": ("Content Verification", "UNESCO MIL Competency 4: Cross-referencing claims against multiple sources"),
    "message": ("Communication Analysis", "UNESCO MIL Competency 5: Understanding persuasive communication techniques"),
    "blog": ("Critical Reading", "UNESCO MIL Competency 2: Applying critical thinking to digital content"),
}


@router.post("/", response_model=AnalyzeResponse)
async def analyze_content(request: AnalyzeRequest, db: AsyncSession = Depends(get_db), authorization: str | None = Header(None)):
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

    # Add MIL competency info
    competency = MIL_COMPETENCIES.get(request.content_type, MIL_COMPETENCIES["article"])
    result["mil_competency"] = competency[0]
    result["mil_competency_description"] = competency[1]

    # Try to persist if user is authenticated
    if authorization and authorization.startswith("Bearer "):
        try:
            from jose import jwt
            from app.config import get_settings
            settings = get_settings()
            token = authorization.split(" ")[1]
            payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
            user_id = payload.get("sub")
            if user_id:
                analysis = Analysis(
                    user_id=user_id,
                    content_type=request.content_type,
                    original_content=request.content[:5000],
                    source_url=request.url,
                    claims_json=json.dumps(result.get("claims", [])),
                )
                db.add(analysis)
                
                # Update progress
                progress_result = await db.execute(select(UserProgress).where(UserProgress.user_id == user_id))
                progress = progress_result.scalar_one_or_none()
                if progress:
                    progress.analyses_count += 1
                    progress.total_xp += 15
                else:
                    progress = UserProgress(user_id=user_id, analyses_count=1, total_xp=15)
                    db.add(progress)
                
                await db.commit()
        except Exception:
            pass  # Don't fail the analysis if persistence fails

    return AnalyzeResponse(**result)
