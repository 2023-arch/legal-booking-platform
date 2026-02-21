"""
Tests for lawyer and location endpoints.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_search_lawyers_empty(client: AsyncClient):
    """Test search returns empty list when no lawyers exist."""
    response = await client.get("/api/v1/lawyers/search")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["lawyers"] == []


@pytest.mark.asyncio
async def test_featured_lawyers_empty(client: AsyncClient):
    """Test featured returns empty list when no lawyers exist."""
    response = await client.get("/api/v1/lawyers/featured?limit=3")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["lawyers"] == []


@pytest.mark.asyncio
async def test_get_states(client: AsyncClient):
    """Test states endpoint returns a list."""
    response = await client.get("/api/v1/locations/states")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_get_specializations(client: AsyncClient):
    """Test specializations endpoint returns a list."""
    response = await client.get("/api/v1/locations/specializations")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
