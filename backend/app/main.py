from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database.session import engine, Base
from app.models.models import User, Analysis, QuizResult, UserProgress, Debate, DebateArgument  # noqa: F401
from app.api.routes import auth, analyze, credibility, bias, factcheck, images, sources, learn, quiz, debates, dashboard, gamification

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables if DB is configured
    if engine:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Empowering youth to verify, understand, and critically evaluate digital information.",
    lifespan=lifespan,
)

import os

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        os.getenv("FRONTEND_URL", ""),
        # Allow any Render subdomain
        "https://*.onrender.com",
    ],
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.middleware.rate_limit import RateLimitMiddleware
app.add_middleware(RateLimitMiddleware, requests_per_minute=30)

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
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(gamification.router, prefix="/api/gamification", tags=["Gamification"])


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": settings.version}
