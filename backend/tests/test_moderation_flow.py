from app.core.security import hash_password
from app.models.user import User, UserRole, UserStatus
from tests.factories import create_category


def test_full_moderation_flow(client, db):
    """End-to-end: đăng ký HR → duyệt HR → đăng tin → submit → duyệt job → public → block HR → ẩn."""
    admin = User(
        name="Admin",
        email="admin@example.com",
        password_hash=hash_password("admin123"),
        role=UserRole.admin,
        status=UserStatus.active,
    )
    db.add(admin)
    category = create_category(db)
    db.commit()

    # 1. Đăng ký HR (pending)
    res = client.post(
        "/api/auth/register",
        json={
            "name": "New HR",
            "email": "newhr@example.com",
            "password": "secret123",
            "company_name": "New Corp",
        },
    )
    assert res.status_code == 201
    hr_id = res.json()["id"]
    assert res.json()["status"] == "pending"

    # 2. Admin đăng nhập
    res = client.post("/api/auth/login", json={"email": "admin@example.com", "password": "admin123"})
    assert res.status_code == 200

    # 3. Admin duyệt HR
    res = client.post(f"/api/admin/users/{hr_id}/approve")
    assert res.status_code == 200
    assert res.json()["status"] == "active"

    # 4. HR đăng nhập
    client.cookies.clear()
    res = client.post("/api/auth/login", json={"email": "newhr@example.com", "password": "secret123"})
    assert res.status_code == 200

    # 5. HR đăng tin (draft) + submit (pending)
    created = client.post(
        "/api/hr/jobs",
        json={
            "title": "New Job",
            "category_id": category.id,
            "job_type": "fulltime",
            "description": "d",
            "requirements": "r",
            "tag_ids": [],
        },
    )
    assert created.status_code == 201
    job_id = created.json()["id"]
    assert created.json()["status"] == "draft"

    submitted = client.post(f"/api/hr/jobs/{job_id}/submit")
    assert submitted.json()["status"] == "pending"

    # 6. Admin duyệt job (approved)
    client.cookies.clear()
    client.post("/api/auth/login", json={"email": "admin@example.com", "password": "admin123"})
    approved = client.post(f"/api/admin/jobs/{job_id}/approve")
    assert approved.json()["status"] == "approved"

    # 7. Job hiển thị public
    res = client.get("/api/jobs")
    titles = [j["title"] for j in res.json()["items"]]
    assert "New Job" in titles

    # 8. Block HR → job biến mất khỏi public
    block = client.post(f"/api/admin/users/{hr_id}/block")
    assert block.json()["status"] == "blocked"

    res = client.get("/api/jobs")
    titles = [j["title"] for j in res.json()["items"]]
    assert "New Job" not in titles
