"""
Tests for authentication endpoints.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    """Test user registration with valid data."""
    response = await client.post("/api/v1/auth/register", json={
        "full_name": "Test User",
        "email": "test@example.com",
        "phone": "+919999999999",
        "password": "StrongPassword123!",
        "user_type": "user",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    """Test that registering with the same email twice fails."""
    user_data = {
        "full_name": "Test User",
        "email": "duplicate@example.com",
        "phone": "+919999999998",
        "password": "StrongPassword123!",
        "user_type": "user",
    }
    # First registration should succeed
    response = await client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200

    # Second registration should fail
    response = await client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    """Test login with invalid credentials returns 401."""
    response = await client.post("/api/v1/auth/login-json", json={
        "username": "nonexistent@example.com",
        "password": "wrongpassword",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_after_register(client: AsyncClient):
    """Test login succeeds after registration."""
    # Register first
    await client.post("/api/v1/auth/register", json={
        "full_name": "Login Test User",
        "email": "logintest@example.com",
        "phone": "+919888888888",
        "password": "TestPassword123!",
        "user_type": "user",
    })

    # Then login
    response = await client.post("/api/v1/auth/login-json", json={
        "username": "logintest@example.com",
        "password": "TestPassword123!",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


@pytest.mark.asyncio
async def test_logout_clears_cookies(client: AsyncClient):
    """Test that logout returns success."""
    response = await client.post("/api/v1/auth/logout")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Logged out successfully"
