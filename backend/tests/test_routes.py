import pytest
import json
from unittest.mock import AsyncMock, patch, MagicMock
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_credibility_success(client, mock_ai_response):
    ai_result = json.dumps({
        "overall_score": 75.0,
        "breakdown": {
            "source_reliability": 80.0,
            "evidence_quality": 70.0,
            "bias_level": 30.0,
            "manipulation_risk": 20.0
        },
        "explanation": "Content has moderate credibility.",
        "confidence": 0.8
    })

    with patch("app.services.ai_client.AsyncOpenAI") as mock_openai:
        mock_client = AsyncMock()
        mock_client.chat.completions.create.return_value = mock_ai_response(ai_result)
        mock_openai.return_value = mock_client

        async with client:
            response = await client.post("/api/credibility/", json={
                "content": "Breaking news article here."
            })
            assert response.status_code == 200
            data = response.json()
            assert data["overall_score"] == 75.0
            assert data["breakdown"]["source_reliability"] == 80.0


@pytest.mark.asyncio
async def test_bias_success(client, mock_ai_response):
    ai_result = json.dumps({
        "overall_bias_score": 45.0,
        "indicators": [{"type": "emotional", "severity": "medium", "evidence": "uses charged language"}],
        "political_leaning": "center-left",
        "emotional_tone": "slightly agitated",
        "recommendations": ["Seek opposing viewpoints"]
    })

    with patch("app.services.ai_client.AsyncOpenAI") as mock_openai:
        mock_client = AsyncMock()
        mock_client.chat.completions.create.return_value = mock_ai_response(ai_result)
        mock_openai.return_value = mock_client

        async with client:
            response = await client.post("/api/bias/", json={
                "content": "This outrageous policy will destroy our economy!"
            })
            assert response.status_code == 200
            data = response.json()
            assert data["overall_bias_score"] == 45.0
            assert len(data["indicators"]) == 1
            assert data["political_leaning"] == "center-left"


@pytest.mark.asyncio
async def test_factcheck_success(client, mock_ai_response):
    ai_result = json.dumps({
        "results": [{
            "claim": "Water boils at 100C",
            "verdict": "supported",
            "confidence": 0.95,
            "reasoning": "Standard physics fact",
            "sources": ["physics textbooks"],
            "learn_more": "Check temperature scales"
        }]
    })

    with patch("app.services.ai_client.AsyncOpenAI") as mock_openai:
        mock_client = AsyncMock()
        mock_client.chat.completions.create.return_value = mock_ai_response(ai_result)
        mock_openai.return_value = mock_client

        async with client:
            response = await client.post("/api/factcheck/", json={
                "claims": ["Water boils at 100C"]
            })
            assert response.status_code == 200
            data = response.json()
            assert len(data["results"]) == 1
            assert data["results"][0]["verdict"] == "supported"
