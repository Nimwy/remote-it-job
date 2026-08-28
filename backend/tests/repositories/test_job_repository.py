from datetime import UTC, datetime, timedelta

from app.models.job import JobStatus
from app.models.user import UserStatus
from app.repositories import job_repository
from tests.factories import create_category, create_job, create_tag, create_user


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
        expires_at=datetime.now(UTC) - timedelta(days=1),
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
