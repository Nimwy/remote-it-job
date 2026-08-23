from app.core.security import hash_password
from app.models.job import Job, JobStatus
from app.models.user import User, UserRole, UserStatus
from tests.factories import create_category, create_tag


def create_hr(db, email="hr@example.com", status=UserStatus.active):
    user = User(
        name="HR Test",
        email=email,
        password_hash=hash_password("secret123"),
        status=status,
        role=UserRole.hr,
        company_name="Test Corp",
    )
    db.add(user)
    db.flush()
    return user


def login(client, email="hr@example.com"):
    res = client.post("/api/auth/login", json={"email": email, "password": "secret123"})
    assert res.status_code == 200
    return res


def job_payload(category_id, tag_ids=None, **kwargs):
    payload = {
        "title": "React Developer",
        "category_id": category_id,
        "job_type": "fulltime",
        "description": "Build web apps",
        "requirements": "2+ years React",
    }
    if tag_ids:
        payload["tag_ids"] = tag_ids
    payload.update(kwargs)
    return payload


def test_get_profile(client, db):
    create_hr(db)
    db.commit()
    login(client)
    res = client.get("/api/hr/profile")
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "hr@example.com"
    assert data["status"] == "active"


def test_update_profile_with_contacts(client, db):
    create_hr(db)
    db.commit()
    login(client)
    res = client.patch(
        "/api/hr/profile",
        json={
            "company_name": "New Corp",
            "contacts": [
                {"channel": "email", "value": "hr@example.com"},
                {"channel": "telegram", "value": "@hr"},
            ],
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["company_name"] == "New Corp"
    assert len(data["contacts"]) == 2
    channels = {c["channel"] for c in data["contacts"]}
    assert channels == {"email", "telegram"}


def test_create_job(client, db):
    create_hr(db)
    category = create_category(db)
    tag = create_tag(db)
    db.commit()
    login(client)

    res = client.post("/api/hr/jobs", json=job_payload(category.id, [tag.id]))
    assert res.status_code == 201
    data = res.json()
    assert data["status"] == "draft"
    assert data["tags"] == ["React"]


def test_list_hr_jobs(client, db):
    create_hr(db)
    category = create_category(db)
    db.commit()
    login(client)

    client.post("/api/hr/jobs", json=job_payload(category.id, title="Job A"))
    client.post("/api/hr/jobs", json=job_payload(category.id, title="Job B"))

    res = client.get("/api/hr/jobs")
    assert res.status_code == 200
    assert res.json()["total"] == 2


def test_update_job_substantive_reapproval(client, db):
    create_hr(db)
    category = create_category(db)
    db.commit()
    login(client)

    created = client.post("/api/hr/jobs", json=job_payload(category.id)).json()
    job_id = created["id"]

    # force approve
    job = db.query(Job).filter(Job.id == job_id).first()
    job.status = JobStatus.approved
    db.commit()

    res = client.patch(f"/api/hr/jobs/{job_id}", json={"title": "Updated Title"})
    assert res.status_code == 200
    assert res.json()["status"] == "pending"


def test_update_job_non_substantive(client, db):
    create_hr(db)
    category = create_category(db)
    db.commit()
    login(client)

    created = client.post("/api/hr/jobs", json=job_payload(category.id)).json()
    job_id = created["id"]

    job = db.query(Job).filter(Job.id == job_id).first()
    job.status = JobStatus.approved
    db.commit()

    res = client.patch(f"/api/hr/jobs/{job_id}", json={"expires_at": "2026-12-31T00:00:00Z"})
    assert res.status_code == 200
    assert res.json()["status"] == "approved"


def test_submit_job(client, db):
    create_hr(db)
    category = create_category(db)
    db.commit()
    login(client)

    created = client.post("/api/hr/jobs", json=job_payload(category.id)).json()
    job_id = created["id"]

    res = client.post(f"/api/hr/jobs/{job_id}/submit")
    assert res.status_code == 200
    assert res.json()["status"] == "pending"


def test_close_job(client, db):
    create_hr(db)
    category = create_category(db)
    db.commit()
    login(client)

    created = client.post("/api/hr/jobs", json=job_payload(category.id)).json()
    job_id = created["id"]

    job = db.query(Job).filter(Job.id == job_id).first()
    job.status = JobStatus.approved
    db.commit()

    res = client.post(f"/api/hr/jobs/{job_id}/close")
    assert res.status_code == 200
    assert res.json()["status"] == "closed"


def test_delete_draft_job(client, db):
    create_hr(db)
    category = create_category(db)
    db.commit()
    login(client)

    created = client.post("/api/hr/jobs", json=job_payload(category.id)).json()
    job_id = created["id"]

    res = client.delete(f"/api/hr/jobs/{job_id}")
    assert res.status_code == 204

    res_get = client.get(f"/api/hr/jobs/{job_id}")
    assert res_get.status_code == 404


def test_pending_hr_cannot_create_job(client, db):
    create_hr(db, status=UserStatus.pending)
    category = create_category(db)
    db.commit()
    login(client)

    res = client.post("/api/hr/jobs", json=job_payload(category.id))
    assert res.status_code == 403


def test_hr_cannot_access_other_hr_job(client, db):
    create_hr(db, email="hr1@example.com")
    create_hr(db, email="hr2@example.com")
    category = create_category(db)
    db.commit()

    login(client, "hr1@example.com")
    created = client.post("/api/hr/jobs", json=job_payload(category.id)).json()
    job_id = created["id"]

    client.cookies.clear()
    login(client, "hr2@example.com")
    res = client.get(f"/api/hr/jobs/{job_id}")
    assert res.status_code == 404
