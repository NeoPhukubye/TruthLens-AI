from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

SOURCE_RATINGS = {
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


@router.post("/check", response_model=SourceCheckResponse)
async def check_source(request: SourceCheckRequest):
    from urllib.parse import urlparse

    parsed = urlparse(request.url)
    domain = parsed.netloc.replace("www.", "")

    if domain in SOURCE_RATINGS:
        info = SOURCE_RATINGS[domain]
        recommendation = "Highly trusted source" if info["score"] >= 85 else "Use with caution - verify claims independently"
        return SourceCheckResponse(
            domain=domain,
            name=info["name"],
            score=info["score"],
            category=info["category"],
            is_known=True,
            recommendation=recommendation,
        )

    return SourceCheckResponse(
        domain=domain,
        name=domain,
        score=50,
        category="Unknown",
        is_known=False,
        recommendation="Unknown source - verify all claims independently and check for other credible sources.",
    )
