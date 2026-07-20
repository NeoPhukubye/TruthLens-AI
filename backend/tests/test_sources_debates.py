import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_source_check_known(client):
    async with client:
        response = await client.post("/api/sources/check", json={"url": "https://www.bbc.com/news/article"})
        assert response.status_code == 200
        data = response.json()
        assert data["domain"] == "bbc.com"
        assert data["is_known"] is True
        assert data["score"] == 98
        assert data["category"] == "Public Broadcasting"


@pytest.mark.asyncio
async def test_source_check_unknown(client):
    async with client:
        response = await client.post("/api/sources/check", json={"url": "https://unknownsite.xyz/article"})
        assert response.status_code == 200
        data = response.json()
        assert data["domain"] == "unknownsite.xyz"
        assert data["is_known"] is False
        assert data["score"] == 50


@pytest.mark.asyncio
async def test_source_check_infowars(client):
    async with client:
        response = await client.post("/api/sources/check", json={"url": "https://www.infowars.com/post"})
        assert response.status_code == 200
        data = response.json()
        assert data["score"] == 10
        assert data["category"] == "Conspiracy"


@pytest.mark.asyncio
async def test_debates_create_and_list(client):
    async with client:
        # Create a debate
        response = await client.post("/api/debates/create", json={
            "topic": "Test debate",
            "description": "A test",
            "side_a_label": "Yes",
            "side_b_label": "No"
        })
        assert response.status_code == 200
        debate = response.json()
        assert debate["topic"] == "Test debate"
        assert debate["status"] == "active"
        debate_id = debate["id"]

        # List debates
        response = await client.get("/api/debates/list")
        assert response.status_code == 200
        debates = response.json()
        assert any(d["id"] == debate_id for d in debates)

        # Join debate
        response = await client.post(f"/api/debates/{debate_id}/join", json={
            "username": "testuser",
            "side": "a"
        })
        assert response.status_code == 200
        assert "testuser" in response.json()["participants"]["a"]

        # Close debate
        response = await client.post(f"/api/debates/{debate_id}/close")
        assert response.status_code == 200
        assert response.json()["status"] == "closed"


@pytest.mark.asyncio
async def test_debates_not_found(client):
    async with client:
        response = await client.get("/api/debates/nonexistent")
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_trending_topics(client):
    async with client:
        response = await client.get("/api/debates/trending/topics")
        assert response.status_code == 200
        data = response.json()
        assert "topics" in data
        assert len(data["topics"]) > 0


@pytest.mark.asyncio
async def test_health_check(client):
    async with client:
        response = await client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
