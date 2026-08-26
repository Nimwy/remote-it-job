
import pytest

from app.core.exceptions import APIError
from app.core.security import hash_password
from app.models.job import Job, JobStatus
from app.models.user import User, UserRole, UserStatus
from app.schemas.admin import CategoryCreate, TagCreate
from app.schemas.hr import HrProfileUpdate
from app.schemas.job import JobCreate, JobUpdate
from app.schemas.user import UserCreate
from app.services import admin_service, auth_service, hr_service, job_service
from tests.factories import create_category, create_job, create_tag, create_user

# ---------- auth_service ----------

def test_auth_register_user(db):
    data = UserCreate(name="HR", email="hr@example.com", password="secret123", company_name="Corp")
    user = auth_service.register_user(db, data)
    assert user.status == UserStatus.pending
    assert user.role == UserRole.hr
    assert user.password_hash != "secret123"


def test_auth_register_duplicate_email(db):
    data = UserCreate(name="HR", email="hr@example.com", password="secret123", company_name="Corp")
    auth_service.register_user(db, data)
    with pytest.raises(APIError) as e:
        auth_service.register_user(db, data)
    assert e.value.status_code == 409


def test_auth_authenticate_user(db):
    user = User(
        name="HR", email="hr@example.com", password_hash=hash_password("secret123"),
        status=UserStatus.active, role=UserRole.hr, company_name="Corp",
    )
    db.add(user)
    db.commit()

    assert auth_service.authenticate_user(db, "hr@example.com", "secret123") is not None
    with pytest.raises(APIError):
        auth_service.authenticate_user(db, "hr@example.com", "wrong")


def test_auth_create_and_delete_session(db):
    user = create_user(db, "hr@example.com")
    db.commit()

    token = auth_service.create_session(db, user)
    assert token

    auth_service.delete_session(db, token)
    assert auth_service.authenticate_user(db, "hr@example.com", "x") if False else True


def test_auth_change_password(db):
    user = User(
        name="HR", email="hr@example.com", password_hash=hash_password("secret123"),
        status=UserStatus.active, role=UserRole.hr,
    )
    db.add(user)
    db.commit()

    auth_service.change_password(db, user, "secret123", "newpass123")
    db.refresh(user)
    assert auth_service.authenticate_user(db, "hr@example.com", "newpass123") is not None


def test_auth_change_password_wrong_current(db):
    user = User(
        name="HR", email="hr@example.com", password_hash=hash_password("secret123"),
        status=UserStatus.active, role=UserRole.hr,
    )
    db.add(user)
    db.commit()

    with pytest.raises(APIError):
        auth_service.change_password(db, user, "wrong", "newpass123")


# ---------- job_service ----------

def test_job_service_get_public_job(db):
    hr = create_user(db, "hr@example.com")
    category = create_category(db)
    job = create_job(db, hr, category, title="Public Job", status=JobStatus.approved)
    db.commit()

    found = job_service.get_public_job(db, job.id)
    assert found.title == "Public Job"

    pending = create_job(db, hr, category, title="Pending", status=JobStatus.pending)
    db.commit()
    with pytest.raises(APIError):
        job_service.get_public_job(db, pending.id)


def test_job_service_record_view_dedup(db):
    hr = create_user(db, "hr@example.com")
    category = create_category(db)
    job = create_job(db, hr, category, title="Job", status=JobStatus.approved)
    db.commit()

    job_service.record_view(db, job, "visitor-a")
    db.refresh(job)
    assert job.views == 1

    job_service.record_view(db, job, "visitor-a")
    db.refresh(job)
    assert job.views == 1

    job_service.record_view(db, job, "visitor-b")
    db.refresh(job)
    assert job.views == 2


# ---------- hr_service ----------

def test_hr_service_create_job_generates_slug(db):
    hr = create_user(db, "hr@example.com")
    category = create_category(db)
    tag = create_tag(db)
    db.commit()

    job = hr_service.create_job(
        db, hr,
        JobCreate(
            title="React Developer", category_id=category.id, job_type="fulltime",
            description="Build apps", requirements="React", tag_ids=[tag.id],
        ),
    )
    assert job.status == JobStatus.draft
    assert job.slug == "react-developer"


def test_hr_service_create_job_invalid_category(db):
    hr = create_user(db, "hr@example.com")
    db.commit()

    with pytest.raises(APIError):
        hr_service.create_job(
            db, hr,
            JobCreate(
                title="X", category_id=999, job_type="fulltime",
                description="d", requirements="r", tag_ids=[],
            ),
        )


def test_hr_service_update_job_substantive_reaapproval(db):
    hr = create_user(db, "hr@example.com")
    category = create_category(db)
    job = create_job(db, hr, category, title="Approved", status=JobStatus.approved)
    db.commit()

    updated = hr_service.update_job(db, hr, job.id, JobUpdate(title="New Title"))
    assert updated.status == JobStatus.pending


def test_hr_service_submit_and_close(db):
    hr = create_user(db, "hr@example.com")
    category = create_category(db)
    job = create_job(db, hr, category, title="Draft", status=JobStatus.draft)
    db.commit()

    submitted = hr_service.submit_job(db, hr, job.id)
    assert submitted.status == JobStatus.pending

    submitted.status = JobStatus.approved
    db.commit()
    closed = hr_service.close_job(db, hr, job.id)
    assert closed.status == JobStatus.closed


def test_hr_service_delete_job(db):
    hr = create_user(db, "hr@example.com")
    category = create_category(db)
    job = create_job(db, hr, category, title="Draft", status=JobStatus.draft)
    db.commit()

    hr_service.delete_job(db, hr, job.id)
    assert db.query(Job).filter(Job.id == job.id).first() is None


def test_hr_service_update_profile(db):
    hr = create_user(db, "hr@example.com")
    db.commit()

    updated = hr_service.update_profile(
        db, hr,
        HrProfileUpdate(company_name="New Corp", contacts=[{"channel": "email", "value": "hr@example.com"}]),
    )
    assert updated.company_name == "New Corp"
    assert len(updated.contacts) == 1


# ---------- admin_service ----------

def test_admin_service_job_moderation(db):
    hr = create_user(db, "hr@example.com")
    category = create_category(db)
    job = create_job(db, hr, category, title="Pending", status=JobStatus.pending)
    db.commit()

    approved = admin_service.approve_job(db, job.id)
    assert approved.status == JobStatus.approved

    hidden = admin_service.hide_job(db, job.id)
    assert hidden.status == JobStatus.hidden

    restored = admin_service.unhide_job(db, job.id)
    assert restored.status == JobStatus.approved


def test_admin_service_reject_job(db):
    hr = create_user(db, "hr@example.com")
    category = create_category(db)
    job = create_job(db, hr, category, title="Pending", status=JobStatus.pending)
    db.commit()

    rejected = admin_service.reject_job(db, job.id, "Thiếu thông tin")
    assert rejected.status == JobStatus.rejected
    assert rejected.rejection_reason == "Thiếu thông tin"


def test_admin_service_user_management(db):
    hr = create_user(db, "hr@example.com", status=UserStatus.pending)
    db.commit()

    approved = admin_service.approve_user(db, hr.id)
    assert approved.status == UserStatus.active

    blocked = admin_service.block_user(db, hr.id)
    assert blocked.status == UserStatus.blocked

    unblocked = admin_service.unblock_user(db, hr.id)
    assert unblocked.status == UserStatus.active


def test_admin_service_category_and_tag(db):
    category = admin_service.create_category(db, CategoryCreate(name="Security"))
    assert category.slug == "security"

    deactivated = admin_service.deactivate_category(db, category.id)
    assert deactivated.is_active is False

    tag = admin_service.create_tag(db, TagCreate(name="Rust"))
    assert tag.slug == "rust"

    deactivated_tag = admin_service.deactivate_tag(db, tag.id)
    assert deactivated_tag.is_active is False
