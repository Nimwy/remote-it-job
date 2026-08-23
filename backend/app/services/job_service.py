from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.job import Job, JobType
from app.models.job_view import JobView
from app.repositories import job_repository, job_view_repository

JOB_TYPES = [t.value for t in JobType]


def search_jobs(
    db: Session,
    q: str | None,
    category: str | None,
    tags: str | None,
    job_type: str | None,
    salary_min: float | None,
    salary_max: float | None,
    location: str | None,
    timezone: str | None,
    page: int,
    page_size: int,
):
    return job_repository.search_public(
        db=db,
        q=q,
        category=category,
        tags=tags,
        job_type=job_type,
        salary_min=salary_min,
        salary_max=salary_max,
        location=location,
        timezone=timezone,
        page=page,
        page_size=page_size,
    )


def serialize_job_list_item(job: Job) -> dict:
    return {
        "id": job.id,
        "title": job.title,
        "slug": job.slug,
        "company_name": job.hr.company_name or job.hr.name,
        "category": {"id": job.category.id, "name": job.category.name, "slug": job.category.slug},
        "job_type": job.job_type.value,
        "location": job.location,
        "timezone": job.timezone,
        "salary_min": float(job.salary_min) if job.salary_min is not None else None,
        "salary_max": float(job.salary_max) if job.salary_max is not None else None,
        "currency": job.currency,
        "tags": [jt.tag.name for jt in job.job_tags],
        "tag_slugs": [jt.tag.slug for jt in job.job_tags],
        "created_at": job.created_at,
    }


def get_public_job(db: Session, job_id: int) -> Job:
    job = job_repository.get_public(db, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tin tuyển dụng")
    return job


def serialize_job_detail(job: Job) -> dict:
    item = serialize_job_list_item(job)
    item["description"] = job.description
    item["requirements"] = job.requirements
    item["views"] = job.views
    item["expires_at"] = job.expires_at
    item["contacts"] = [{"channel": c.channel.value, "value": c.value} for c in job.hr.contacts]
    return item


def record_view(db: Session, job: Job, visitor_key: str) -> None:
    now = datetime.now(UTC)
    existing = job_view_repository.find(db, job.id, visitor_key)

    if existing:
        if existing.viewed_at < now - timedelta(hours=24):
            existing.viewed_at = now
            job.views += 1
            db.commit()
    else:
        job_view_repository.create(db, JobView(job_id=job.id, visitor_key=visitor_key, viewed_at=now))
        job.views += 1
        db.commit()
