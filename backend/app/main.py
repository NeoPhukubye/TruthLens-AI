from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.api.routes import auth, analyze, credibility, bias, factcheck, images, sources, learn, quiz, debates

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Empowering youth to verify, understand, and critically evaluate digital information.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(analyze.router, prefix="/api/analyze", tags=["Claim Analyzer"])
app.include_router(credibility.router, prefix="/api/credibility", tags=["Credibility Score"])
app.include_router(bias.router, prefix="/api/bias", tags=["Bias Detection"])
app.include_router(factcheck.router, prefix="/api/factcheck", tags=["Fact Checking"])
app.include_router(images.router, prefix="/api/images", tags=["Image Analysis"])
app.include_router(sources.router, prefix="/api/sources", tags=["Source Quality"])
app.include_router(learn.router, prefix="/api/learn", tags=["Learn Mode"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["Quiz Mode"])
app.include_router(debates.router, prefix="/api/debates", tags=["Live Debates"])


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": settings.version}
