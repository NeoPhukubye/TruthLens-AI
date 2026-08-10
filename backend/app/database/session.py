from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings

settings = get_settings()

# Database is optional - app works without it (AI features only)
_db_url = settings.async_database_url
if _db_url:
    engine = create_async_engine(_db_url, echo=settings.debug)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
else:
    engine = None
    async_session = None


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    if async_session is None:
        yield None
        return
    async with async_session() as session:
        yield session
