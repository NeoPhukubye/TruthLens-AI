import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import get_db


async def _override_get_db():
    yield None


app.dependency_overrides[get_db] = _override_get_db


@pytest.fixture
def mock_ai_response():
    """Create a mock OpenAI response."""
    def _make_response(content: str):
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = content
        return mock_response
    return _make_response


@pytest.fixture
def client():
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")
