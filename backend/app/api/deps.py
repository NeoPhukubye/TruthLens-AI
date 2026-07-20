from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.routes.auth import get_current_user
from app.models.models import User


async def get_optional_user(
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """Optional auth - returns None if not authenticated."""
    return None


async def get_required_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Required auth - raises 401 if not authenticated."""
    return current_user
