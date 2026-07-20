import pytest
import json
from unittest.mock import AsyncMock, patch, MagicMock
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_analyze_success(client, mock_ai_response):
    ai_result = json.dumps({
        "claims": [{"claim": "The earth is round", "importance": "high"}],
        "key_facts": ["Earth is spherical"],
        "entities": ["Earth"],
        "statistics": [],
        "summary": "Article discusses Earth's shape."
    })

    with patch("app.services.ai_client.AsyncOpenAI") as mock_openai:
        mock_client = AsyncMock()
        mock_client.chat.completions.create.return_value = mock_ai_response(ai_result)
        mock_openai.return_value = mock_client

        async with client:
            response = await client.post("/api/analyze/", json={
                "content": "The earth is round according to scientists.",
                "content_type": "article"
            })
            assert response.status_code == 200
            data = response.json()
            assert len(data["claims"]) == 1
            assert data["claims"][0]["claim"] == "The earth is round"
            assert data["summary"] == "Article discusses Earth's shape."


@pytest.mark.asyncio
async def test_analyze_empty_content(client):
    async with client:
        response = await client.post("/api/analyze/", json={
            "content": "   ",
            "content_type": "article"
        })
        assert response.status_code == 400
        assert "empty" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_analyze_ai_unavailable(client):
    with patch("app.services.ai_client.AsyncOpenAI") as mock_openai:
        from openai import APIConnectionError
        mock_client = AsyncMock()
        mock_client.chat.completions.create.side_effect = APIConnectionError(request=MagicMock())
        mock_openai.return_value = mock_client

        async with client:
            response = await client.post("/api/analyze/", json={
                "content": "Some content to analyze",
                "content_type": "article"
            })
            assert response.status_code == 503
            assert "unavailable" in response.json()["detail"].lower()
