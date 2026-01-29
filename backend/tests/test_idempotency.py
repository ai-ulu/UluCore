import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.adapters.memory_db import db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    # Clear DB before each test
    db._events = []
    db._idempotency_keys = {}
    db._users = {}
    db._api_keys = {}
    db._policies = {}

def test_idempotency_works():
    # 1. Create a user and API key
    user_data = client.post("/auth/signup", json={"email": "test@example.com", "password": "password123"}).json()
    user_id = user_data["user"]["id"]

    # Login to get token (optional, but we need API key for /action)
    login_res = client.post("/auth/login", json={"email": "test@example.com", "password": "password123"})
    token = login_res.json()["access_token"]

    # Create API key
    key_res = client.post("/api-keys", json={"name": "test-key"}, headers={"Authorization": f"Bearer {token}"})
    api_key = key_res.json()["key"]

    # 2. Submit an action with Idempotency Key
    action_payload = {
        "action_type": "test_action",
        "resource_id": "res_1",
        "user_id": "user_1",
        "metadata": {"foo": "bar"}
    }
    headers = {
        "X-API-Key": api_key,
        "X-Idempotency-Key": "unique-key-1"
    }

    response1 = client.post("/action", json=action_payload, headers=headers)
    assert response1.status_code == 200
    data1 = response1.json()
    decision_id1 = data1["decision_id"]

    # 3. Submit the SAME action with SAME Idempotency Key
    response2 = client.post("/action", json=action_payload, headers=headers)
    assert response2.status_code == 200
    assert response2.headers["X-Idempotency-Hit"] == "true"
    data2 = response2.json()

    # Decision ID and all other fields should be identical
    assert data2["decision_id"] == decision_id1

    # 4. Check events count - should only be 1
    events_res = client.get("/events", headers={"Authorization": f"Bearer {token}"})
    assert len(events_res.json()) == 1
