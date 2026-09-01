from datetime import UTC, datetime

from app.models.job_view import JobView
from app.repositories import job_view_repository
from tests.factories import create_category, create_job, create_user


def test_job_view_repository(db):
    hr = create_user(db, "hr@example.com")
    category = create_category(db)
    job = create_job(db, hr, category, title="Job")
    db.commit()

    assert job_view_repository.find(db, job.id, "visitor-1") is None
    job_view_repository.create(db, JobView(job_id=job.id, visitor_key="visitor-1", viewed_at=datetime.now(UTC)))
    db.commit()
    assert job_view_repository.find(db, job.id, "visitor-1") is not None

    job_view_repository.delete_for_job(db, job.id)
    db.commit()
    assert job_view_repository.find(db, job.id, "visitor-1") is None
