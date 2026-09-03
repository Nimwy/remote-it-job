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


def test_validation_error_format(client):
    # S-02: lỗi validation phải về dạng {error:{code,message}}
    res = client.post("/api/auth/login", json={"email": "bad", "password": ""})
    assert res.status_code == 422
    body = res.json()
    assert body["error"]["code"] == "validation_error"
    assert body["error"]["message"]


def test_router_error_format(client):
    # S-02: 404/405 cũng về dạng {error:{code,message}}
    res = client.get("/api/nope")
    assert res.status_code == 404
    assert res.json()["error"]["code"] == "http_404"


def test_register_duplicate_email(client):
    client.post("/api/auth/register", json=register_payload())
    res = client.post("/api/auth/register", json=register_payload())
    assert res.status_code == 409


def test_login_success(client):
    client.post("/api/auth/register", json=register_payload())
    res = client.post("/api/auth/login", json={"email": "hr@example.com", "password": "secret123"})
    assert res.status_code == 200
    assert res.json()["email"] == "hr@example.com"
    assert res.cookies.get("access_token") is not None
    assert res.cookies.get("refresh_token") is not None


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


def test_refresh_rotates_tokens(client):
    client.post("/api/auth/register", json=register_payload())
    login = client.post("/api/auth/login", json={"email": "hr@example.com", "password": "secret123"})
    old_refresh = login.cookies.get("refresh_token")

    refresh = client.post("/api/auth/refresh", cookies=login.cookies)
    assert refresh.status_code == 200
    new_access = refresh.cookies.get("access_token")
    new_refresh = refresh.cookies.get("refresh_token")
    assert new_access is not None
    assert new_refresh is not None and new_refresh != old_refresh

    # access token mới dùng được
    res = client.get("/api/auth/me", cookies={"access_token": new_access})
    assert res.status_code == 200
    assert res.json()["email"] == "hr@example.com"


def test_logout_invalidates_refresh(client):
    client.post("/api/auth/register", json=register_payload())
    login = client.post("/api/auth/login", json={"email": "hr@example.com", "password": "secret123"})
    logout = client.post("/api/auth/logout", cookies=login.cookies)
    assert logout.status_code == 200

    # refresh token cũ không dùng lại được
    res = client.post("/api/auth/refresh", cookies=login.cookies)
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
