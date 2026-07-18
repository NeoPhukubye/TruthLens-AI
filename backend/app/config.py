from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "TruthLens AI"
    debug: bool = False
    version: str = "0.1.0"

    # Database
    database_url: str = "postgresql+asyncpg://truthlens:truthlens@localhost:5432/truthlens"

    # JWT
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # AI Provider
    ai_api_key: str = ""
    ai_base_url: str = "https://api.fireworks.ai/inference/v1"
    ai_model: str = "accounts/fireworks/models/llama-v3p1-70b-instruct"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
