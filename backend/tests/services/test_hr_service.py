import pytest

from app.core.exceptions import APIError
from app.models.job import Job, JobStatus
from app.schemas.hr import HrProfileUpdate
from app.schemas.job import JobCreate, JobUpdate
from app.services import hr_service
from tests.factories import create_category, create_job, create_tag, create_user


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


def test_hr_service_generate_slug_unique(db):
    hr = create_user(db, "hr@example.com")
    category = create_category(db)
    create_job(db, hr, category, title="React Developer", slug="react-developer")
    db.commit()

    second = hr_service.create_job(
        db, hr,
        JobCreate(
            title="React Developer", category_id=category.id, job_type="fulltime",
            description="d", requirements="r", tag_ids=[],
        ),
    )
    assert second.slug != "react-developer"


def test_hr_service_update_profile(db):
    hr = create_user(db, "hr@example.com")
    db.commit()

    updated = hr_service.update_profile(
        db, hr,
        HrProfileUpdate(company_name="New Corp", contacts=[{"channel": "email", "value": "hr@example.com"}]),
    )
    assert updated.company_name == "New Corp"
    assert len(updated.contacts) == 1
