from urllib.parse import urlparse

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.models import SourceRating

router = APIRouter()

# Fallback data for when DB is unavailable or table is empty
FALLBACK_RATINGS = {
    "bbc.com": {"name": "BBC", "score": 98, "category": "Public Broadcasting"},
    "reuters.com": {"name": "Reuters", "score": 99, "category": "Wire Service"},
    "apnews.com": {"name": "Associated Press", "score": 99, "category": "Wire Service"},
    "nytimes.com": {"name": "New York Times", "score": 90, "category": "Newspaper"},
    "theguardian.com": {"name": "The Guardian", "score": 88, "category": "Newspaper"},
    "wikipedia.org": {"name": "Wikipedia", "score": 85, "category": "Encyclopedia"},
    "foxnews.com": {"name": "Fox News", "score": 65, "category": "Cable News"},
    "cnn.com": {"name": "CNN", "score": 75, "category": "Cable News"},
    "infowars.com": {"name": "InfoWars", "score": 10, "category": "Conspiracy"},
}


class SourceCheckRequest(BaseModel):
    url: str


class SourceCheckResponse(BaseModel):
    domain: str
    name: str
    score: int
    category: str
    is_known: bool
    recommendation: str


def _get_recommendation(score: int) -> str:
    if score >= 85:
        return "Highly trusted source"
    if score >= 60:
        return "Generally reliable, but verify important claims independently"
    if score >= 40:
        return "Use with caution - verify claims independently"
    return "Low credibility source - cross-reference with trusted sources"


@router.post("/check", response_model=SourceCheckResponse)
async def check_source(request: SourceCheckRequest, db: AsyncSession = Depends(get_db)):
    parsed = urlparse(request.url)
    domain = parsed.netloc.replace("www.", "")

    # Try database first
    try:
        result = await db.execute(select(SourceRating).where(SourceRating.domain == domain))
        source = result.scalar_one_or_none()
        if source:
            return SourceCheckResponse(
                domain=domain,
                name=source.name,
                score=source.score,
                category=source.category,
                is_known=True,
                recommendation=_get_recommendation(source.score),
            )
    except Exception:
        # DB unavailable, fall through to hardcoded lookup
        pass

    # Fallback to hardcoded ratings
    if domain in FALLBACK_RATINGS:
        info = FALLBACK_RATINGS[domain]
        return SourceCheckResponse(
            domain=domain,
            name=info["name"],
            score=info["score"],
            category=info["category"],
            is_known=True,
            recommendation=_get_recommendation(info["score"]),
        )

    return SourceCheckResponse(
        domain=domain,
        name=domain,
        score=50,
        category="Unknown",
        is_known=False,
        recommendation="Unknown source - verify all claims independently and check for other credible sources.",
    )
