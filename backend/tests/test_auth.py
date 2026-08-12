def register_payload(email: str = "hr@example.com"):
    return {
        "name": "HR Test",
        "email": email,
        "password": "secret123",
        "company_name": "Test Corp",
    }


def test_register_success(client):
    res = client.post("/api/auth/register", json=register_payload())
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "hr@example.com"
    assert data["status"] == "pending"
    assert data["role"] == "hr"
    assert "password_hash" not in data


def test_register_duplicate_email(client):
    client.post("/api/auth/register", json=register_payload())
    res = client.post("/api/auth/register", json=register_payload())
    assert res.status_code == 409


def test_login_success(client):
    client.post("/api/auth/register", json=register_payload())
    res = client.post("/api/auth/login", json={"email": "hr@example.com", "password": "secret123"})
    assert res.status_code == 200
    assert res.json()["email"] == "hr@example.com"
    assert res.cookies.get("session") is not None


def test_login_wrong_password(client):
    client.post("/api/auth/register", json=register_payload())
    res = client.post("/api/auth/login", json={"email": "hr@example.com", "password": "wrong"})
    assert res.status_code == 401


def test_me_with_cookie(client):
    client.post("/api/auth/register", json=register_payload())
    login = client.post("/api/auth/login", json={"email": "hr@example.com", "password": "secret123"})
    res = client.get("/api/auth/me", cookies=login.cookies)
    assert res.status_code == 200
    assert res.json()["email"] == "hr@example.com"


def test_me_without_cookie(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_logout_invalidates_session(client):
    client.post("/api/auth/register", json=register_payload())
    login = client.post("/api/auth/login", json={"email": "hr@example.com", "password": "secret123"})
    logout = client.post("/api/auth/logout", cookies=login.cookies)
    assert logout.status_code == 200
    res = client.get("/api/auth/me", cookies=login.cookies)
    assert res.status_code == 401


def test_change_password_wrong_current(client):
    client.post("/api/auth/register", json=register_payload())
    login = client.post("/api/auth/login", json={"email": "hr@example.com", "password": "secret123"})
    res = client.post(
        "/api/auth/change-password",
        json={"current_password": "wrong", "new_password": "newpass123"},
        cookies=login.cookies,
    )
    assert res.status_code == 400


def test_change_password_success(client):
    client.post("/api/auth/register", json=register_payload())
    login = client.post("/api/auth/login", json={"email": "hr@example.com", "password": "secret123"})
    res = client.post(
        "/api/auth/change-password",
        json={"current_password": "secret123", "new_password": "newpass123"},
        cookies=login.cookies,
    )
    assert res.status_code == 200

    relogin = client.post("/api/auth/login", json={"email": "hr@example.com", "password": "newpass123"})
    assert relogin.status_code == 200
