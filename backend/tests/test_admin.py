from app.core.security import hash_password
from app.models.job import Job, JobStatus
from app.models.user import User, UserRole, UserStatus
from tests.factories import create_category, create_job, create_tag, create_user


def create_admin(db, email="admin@example.com"):
    user = User(
        name="Admin",
        email=email,
        password_hash=hash_password("admin123"),
        role=UserRole.admin,
        status=UserStatus.active,
    )
    db.add(user)
    db.flush()
    return user


def login_admin(client, email="admin@example.com"):
    res = client.post("/api/auth/login", json={"email": email, "password": "admin123"})
    assert res.status_code == 200
    return res


def test_admin_endpoints_require_auth(client, db):
    res = client.get("/api/admin/users")
    assert res.status_code == 401


def test_hr_cannot_access_admin(client, db):
    hr = create_user(db, "hr@example.com", status=UserStatus.active)
    hr.password_hash = hash_password("secret123")
    db.commit()

    client.post("/api/auth/login", json={"email": "hr@example.com", "password": "secret123"})
    res = client.get("/api/admin/users")
    assert res.status_code == 403


def test_admin_list_jobs(client, db):
    create_admin(db)
    hr = create_user(db, "hr@example.com")
    category = create_category(db)
    create_job(db, hr, category, title="Approved Job", status=JobStatus.approved)
    create_job(db, hr, category, title="Pending Job", status=JobStatus.pending)
    db.commit()
    login_admin(client)

    res = client.get("/api/admin/jobs")
    assert res.status_code == 200
    assert res.json()["total"] == 2


def test_admin_list_pending_jobs(client, db):
    create_admin(db)
    hr = create_user(db, "hr@example.com")
    category = create_category(db)
    create_job(db, hr, category, title="Pending Job", status=JobStatus.pending)
    create_job(db, hr, category, title="Approved Job", status=JobStatus.approved)
    db.commit()
    login_admin(client)

    res = client.get("/api/admin/jobs/pending")
    assert res.status_code == 200
    assert res.json()["total"] == 1
    assert res.json()["items"][0]["title"] == "Pending Job"


def test_approve_job(client, db):
    create_admin(db)
    hr = create_user(db, "hr@example.com")
    category = create_category(db)
    job = create_job(db, hr, category, status=JobStatus.pending)
    db.commit()
    login_admin(client)

    res = client.post(f"/api/admin/jobs/{job.id}/approve")
    assert res.status_code == 200
    assert res.json()["status"] == "approved"


def test_reject_job_with_reason(client, db):
    create_admin(db)
    hr = create_user(db, "hr@example.com")
    category = create_category(db)
    job = create_job(db, hr, category, status=JobStatus.pending)
    db.commit()
    login_admin(client)

    res = client.post(f"/api/admin/jobs/{job.id}/reject", json={"reason": "Thiếu thông tin"})
    assert res.status_code == 200
    assert res.json()["status"] == "rejected"
    assert res.json()["rejection_reason"] == "Thiếu thông tin"


def test_hide_and_unhide_job(client, db):
    create_admin(db)
    hr = create_user(db, "hr@example.com")
    category = create_category(db)
    job = create_job(db, hr, category, status=JobStatus.approved)
    db.commit()
    login_admin(client)

    hide = client.post(f"/api/admin/jobs/{job.id}/hide")
    assert hide.json()["status"] == "hidden"

    unhide = client.post(f"/api/admin/jobs/{job.id}/unhide")
    assert unhide.json()["status"] == "approved"


def test_admin_delete_job(client, db):
    create_admin(db)
    hr = create_user(db, "hr@example.com")
    category = create_category(db)
    job = create_job(db, hr, category, status=JobStatus.closed)
    db.commit()
    login_admin(client)

    res = client.delete(f"/api/admin/jobs/{job.id}")
    assert res.status_code == 204

    res_get = client.get("/api/admin/jobs")
    assert all(j["id"] != job.id for j in res_get.json()["items"])


def test_approve_job_wrong_status(client, db):
    create_admin(db)
    hr = create_user(db, "hr@example.com")
    category = create_category(db)
    job = create_job(db, hr, category, status=JobStatus.approved)
    db.commit()
    login_admin(client)

    res = client.post(f"/api/admin/jobs/{job.id}/approve")
    assert res.status_code == 400


def test_admin_list_users(client, db):
    create_admin(db)
    create_user(db, "hr1@example.com", status=UserStatus.active)
    create_user(db, "hr2@example.com", status=UserStatus.pending)
    db.commit()
    login_admin(client)

    res = client.get("/api/admin/users")
    assert res.status_code == 200
    assert res.json()["total"] == 2


def test_approve_hr(client, db):
    create_admin(db)
    hr = create_user(db, "hr@example.com", status=UserStatus.pending)
    db.commit()
    login_admin(client)

    res = client.post(f"/api/admin/users/{hr.id}/approve")
    assert res.status_code == 200
    assert res.json()["status"] == "active"


def test_block_and_unblock_hr(client, db):
    create_admin(db)
    hr = create_user(db, "hr@example.com", status=UserStatus.active)
    db.commit()
    login_admin(client)

    block = client.post(f"/api/admin/users/{hr.id}/block")
    assert block.json()["status"] == "blocked"

    unblock = client.post(f"/api/admin/users/{hr.id}/unblock")
    assert unblock.json()["status"] == "active"


def test_blocked_hr_job_not_public(client, db):
    create_admin(db)
    hr = create_user(db, "hr@example.com", status=UserStatus.active)
    category = create_category(db)
    job = create_job(db, hr, category, status=JobStatus.approved)
    db.commit()

    public_before = client.get("/api/jobs")
    assert public_before.json()["total"] == 1

    login_admin(client)
    client.post(f"/api/admin/users/{hr.id}/block")

    public_after = client.get("/api/jobs")
    assert public_after.json()["total"] == 0


def test_create_and_update_category(client, db):
    create_admin(db)
    db.commit()
    login_admin(client)

    created = client.post("/api/admin/categories", json={"name": "Security", "sort_order": 9})
    assert created.status_code == 201
    assert created.json()["slug"] == "security"

    updated = client.patch(f"/api/admin/categories/{created.json()['id']}", json={"name": "Cyber Security"})
    assert updated.json()["name"] == "Cyber Security"


def test_deactivate_category(client, db):
    create_admin(db)
    category = create_category(db)
    db.commit()
    login_admin(client)

    res = client.post(f"/api/admin/categories/{category.id}/deactivate")
    assert res.json()["is_active"] is False


def test_create_and_deactivate_tag(client, db):
    create_admin(db)
    db.commit()
    login_admin(client)

    created = client.post("/api/admin/tags", json={"name": "Rust"})
    assert created.status_code == 201
    assert created.json()["slug"] == "rust"

    deactivated = client.post(f"/api/admin/tags/{created.json()['id']}/deactivate")
    assert deactivated.json()["is_active"] is False
