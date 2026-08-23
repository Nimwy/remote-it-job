from datetime import datetime, timedelta, timezone

from app.models.category import Category
from app.models.contact import ContactChannel, UserContact
from app.models.job import Job, JobStatus
from app.models.job_view import JobView
from app.models.session import Session as SessionModel
from app.models.tag import Tag
from app.models.user import User, UserRole, UserStatus
from app.repositories import (
    category_repository,
    contact_repository,
    job_repository,
    job_view_repository,
    session_repository,
    tag_repository,
    user_repository,
)
from tests.factories import create_category, create_job, create_tag, create_user


# ---------- user_repository ----------

def test_user_repository_find_by_email(db):
    create_user(db, "hr@example.com")
    db.commit()
    assert user_repository.find_by_email(db, "hr@example.com") is not None
    assert user_repository.find_by_email(db, "nope@example.com") is None


def test_user_repository_find_by_google_id(db):
    user = User(name="G", email="g@example.com", google_id="google-123", status=UserStatus.pending, role=UserRole.hr)
    db.add(user)
    db.commit()
    assert user_repository.find_by_google_id(db, "google-123") is not None
    assert user_repository.find_by_google_id(db, "nope") is None


def test_user_repository_find_hr_by_id(db):
    hr = create_user(db, "hr@example.com")
    admin = User(name="A", email="admin@example.com", status=UserStatus.active, role=UserRole.admin)
    db.add(admin)
    db.commit()
    assert user_repository.find_hr_by_id(db, hr.id).role == UserRole.hr
    assert user_repository.find_hr_by_id(db, admin.id) is None


def test_user_repository_list_hr_users(db):
    create_user(db, "hr1@example.com", status=UserStatus.active)
    create_user(db, "hr2@example.com", status=UserStatus.pending)
    admin = User(name="A", email="admin@example.com", status=UserStatus.active, role=UserRole.admin)
    db.add(admin)
    db.commit()

    users, total = user_repository.list_hr_users(db)
    assert total == 2

    pending, total = user_repository.list_hr_users(db, status=UserStatus.pending.value)
    assert total == 1
    assert pending[0].email == "hr2@example.com"

    found, total = user_repository.list_hr_users(db, search="hr1")
    assert total == 1
    assert found[0].email == "hr1@example.com"


# ---------- session_repository ----------

def test_session_repository(db):
    user = create_user(db, "hr@example.com")
    db.commit()

    session = SessionModel(user_id=user.id, token_hash="hash123", expires_at=datetime.now(timezone.utc) + timedelta(days=1))
    session_repository.create(db, session)
    db.commit()

    assert session_repository.find_by_token_hash(db, "hash123") is not None
    assert session_repository.find_by_token_hash(db, "nope") is None

    session_repository.delete_by_token_hash(db, "hash123")
    db.commit()
    assert session_repository.find_by_token_hash(db, "hash123") is None


# ---------- contact_repository ----------

def test_contact_repository(db):
    user = create_user(db, "hr@example.com")
    db.commit()

    contact_repository.create(db, UserContact(user_id=user.id, channel=ContactChannel.email, value="hr@example.com"))
    db.commit()
    assert db.query(UserContact).count() == 1

    contact_repository.delete_for_user(db, user.id)
    db.commit()
    assert db.query(UserContact).count() == 0


# ---------- category_repository ----------

def test_category_repository(db):
    active = create_category(db, "Frontend", "frontend")
    inactive = Category(name="Hidden", slug="hidden", sort_order=2, is_active=False)
    db.add(inactive)
    db.commit()

    assert category_repository.get_by_id(db, active.id).slug == "frontend"
    assert category_repository.get_by_slug(db, "frontend").id == active.id
    assert category_repository.get_active_by_id(db, active.id) is not None
    assert category_repository.get_active_by_id(db, inactive.id) is None
    assert len(category_repository.list_active(db)) == 1
    assert len(category_repository.list_all(db)) == 2


# ---------- tag_repository ----------

def test_tag_repository(db):
    active = create_tag(db, "React", "react")
    inactive = Tag(name="Hidden", slug="hidden", is_active=False)
    db.add(inactive)
    db.commit()

    assert tag_repository.get_by_id(db, active.id).slug == "react"
    assert tag_repository.get_by_slug(db, "react").id == active.id
    assert len(tag_repository.get_by_ids(db, [active.id, inactive.id])) == 2
    assert len(tag_repository.get_active_by_ids(db, [active.id, inactive.id])) == 1
    assert len(tag_repository.list_active(db)) == 1
    assert len(tag_repository.list_all(db)) == 2


# ---------- job_repository ----------

def test_job_repository_get_owned(db):
    hr = create_user(db, "hr@example.com")
    other = create_user(db, "other@example.com")
    category = create_category(db)
    job = create_job(db, hr, category, title="My Job")
    db.commit()

    assert job_repository.get_owned(db, hr.id, job.id) is not None
    assert job_repository.get_owned(db, other.id, job.id) is None


def test_job_repository_get_public_filters(db):
    hr = create_user(db, "hr@example.com")
    blocked = create_user(db, "blocked@example.com", status=UserStatus.blocked)
    category = create_category(db)

    approved = create_job(db, hr, category, title="Approved", status=JobStatus.approved)
    pending = create_job(db, hr, category, title="Pending", status=JobStatus.pending)
    expired = create_job(
        db, hr, category, title="Expired",
        expires_at=datetime.now(timezone.utc) - timedelta(days=1),
    )
    blocked_owner = create_job(db, blocked, category, title="Blocked")
    db.commit()

    assert job_repository.get_public(db, approved.id) is not None
    assert job_repository.get_public(db, pending.id) is None
    assert job_repository.get_public(db, expired.id) is None
    assert job_repository.get_public(db, blocked_owner.id) is None


def test_job_repository_search_public(db):
    hr = create_user(db, "hr@example.com")
    category = create_category(db)
    tag = create_tag(db, "React", "react")
    create_job(db, hr, category, title="React Developer", tags=[tag], status=JobStatus.approved)
    create_job(db, hr, category, title="Backend Developer", status=JobStatus.pending)
    db.commit()

    jobs, total, _ = job_repository.search_public(
        db, q=None, category=None, tags=None, job_type=None,
        salary_min=None, salary_max=None, location=None, timezone=None,
        page=1, page_size=20,
    )
    assert total == 1
    assert jobs[0].title == "React Developer"

    jobs, total, _ = job_repository.search_public(
        db, q="Backend", category=None, tags=None, job_type=None,
        salary_min=None, salary_max=None, location=None, timezone=None,
        page=1, page_size=20,
    )
    assert total == 0


def test_job_repository_list_all(db):
    hr = create_user(db, "hr@example.com")
    category = create_category(db)
    create_job(db, hr, category, title="Job A", status=JobStatus.draft)
    create_job(db, hr, category, title="Job B", status=JobStatus.approved)
    db.commit()

    jobs, total, _ = job_repository.list_all(db)
    assert total == 2

    jobs, total, _ = job_repository.list_all(db, status=JobStatus.draft.value)
    assert total == 1
    assert jobs[0].title == "Job A"


def test_job_repository_existing_slugs_and_count(db):
    hr = create_user(db, "hr@example.com")
    category = create_category(db)
    create_job(db, hr, category, title="React Developer", slug="react-developer")
    db.commit()

    assert "react-developer" in job_repository.existing_slugs(db)
    assert job_repository.count_by_hr(db, hr.id) == 1


# ---------- job_view_repository ----------

def test_job_view_repository(db):
    hr = create_user(db, "hr@example.com")
    category = create_category(db)
    job = create_job(db, hr, category, title="Job")
    db.commit()

    assert job_view_repository.find(db, job.id, "visitor-1") is None
    job_view_repository.create(db, JobView(job_id=job.id, visitor_key="visitor-1", viewed_at=datetime.now(timezone.utc)))
    db.commit()
    assert job_view_repository.find(db, job.id, "visitor-1") is not None

    job_view_repository.delete_for_job(db, job.id)
    db.commit()
    assert job_view_repository.find(db, job.id, "visitor-1") is None
