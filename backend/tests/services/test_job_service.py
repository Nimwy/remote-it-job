import pytest

from app.core.exceptions import APIError
from app.models.job import JobStatus
from app.services import job_service
from tests.factories import create_category, create_job, create_user


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


def test_job_service_record_view_24h_window(db):
    """Sau hơn 24h cùng visitor, view được đếm lại (T-02)."""
    from datetime import UTC, datetime, timedelta

    from app.models.job_view import JobView
    from app.repositories import job_view_repository

    hr = create_user(db, "hr@example.com")
    category = create_category(db)
    job = create_job(db, hr, category, title="Job", status=JobStatus.approved)
    db.commit()

    # ghi view cũ hơn 24h
    old = JobView(
        job_id=job.id,
        visitor_key="visitor-1",
        viewed_at=datetime.now(UTC) - timedelta(hours=25),
    )
    job_view_repository.create(db, old)
    db.commit()

    job_service.record_view(db, job, "visitor-1")
    db.refresh(job)
    assert job.views == 1
