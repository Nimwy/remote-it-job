from app.core.security import hash_password
from app.models.user import User, UserRole, UserStatus


def make_user(db, email, role=UserRole.hr, status=UserStatus.active, password="secret123"):
    user = User(name=email, email=email, password_hash=hash_password(password), role=role, status=status)
    db.add(user)
    db.commit()
    return user


def test_unauthenticated_get_current_user(client):
    # không có cookie access -> 401
    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_require_admin_rejects_hr(client, db):
    make_user(db, "hr@example.com")
    client.post("/api/auth/login", json={"email": "hr@example.com", "password": "secret123"})
    res = client.get("/api/admin/users")
    assert res.status_code == 403


def test_require_admin_rejects_blocked_admin(client, db):
    make_user(db, "admin@example.com", role=UserRole.admin, status=UserStatus.blocked)
    client.post("/api/auth/login", json={"email": "admin@example.com", "password": "secret123"})
    res = client.get("/api/admin/users")
    assert res.status_code == 403


def test_require_active_hr_rejects_pending(client, db):
    make_user(db, "hr@example.com", status=UserStatus.pending)
    client.post("/api/auth/login", json={"email": "hr@example.com", "password": "secret123"})
    res = client.get("/api/hr/jobs")
    assert res.status_code == 403


def test_require_active_hr_rejects_blocked(client, db):
    make_user(db, "hr@example.com", status=UserStatus.blocked)
    client.post("/api/auth/login", json={"email": "hr@example.com", "password": "secret123"})
    res = client.get("/api/hr/jobs")
    assert res.status_code == 403


def test_require_active_hr_allows_active_hr(client, db):
    make_user(db, "hr@example.com", status=UserStatus.active)
    client.post("/api/auth/login", json={"email": "hr@example.com", "password": "secret123"})
    res = client.get("/api/hr/jobs")
    assert res.status_code == 200


def test_require_admin_allows_active_admin(client, db):
    make_user(db, "admin@example.com", role=UserRole.admin, status=UserStatus.active)
    client.post("/api/auth/login", json={"email": "admin@example.com", "password": "secret123"})
    res = client.get("/api/admin/users")
    assert res.status_code == 200
