from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.job import Job, JobStatus, JobType
from app.models.job_view import JobView
from app.models.tag import Tag
from app.models.user import User, UserStatus

JOB_TYPES = [t.value for t in JobType]


def _public_filter(query):
    now = datetime.now(timezone.utc)
    query = query.join(User, Job.hr_id == User.id)
    query = query.filter(Job.status == JobStatus.approved)
    query = query.filter(or_(Job.expires_at.is_(None), Job.expires_at > now))
    query = query.filter(User.status != UserStatus.blocked)
    return query


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
    query = _public_filter(db.query(Job))

    if q:
        like = f"%{q}%"
        query = query.filter(or_(Job.title.ilike(like), Job.description.ilike(like)))

    if category:
        query = query.join(Category, Job.category_id == Category.id).filter(Category.slug == category)

    if tags:
        tag_slugs = [t.strip() for t in tags.split(",") if t.strip()]
        query = query.join(Job.job_tags).join(Tag).filter(Tag.slug.in_(tag_slugs))
        query = query.distinct()

    if job_type:
        query = query.filter(Job.job_type == job_type)

    if salary_min is not None:
        query = query.filter(
            or_(
                Job.salary_max >= salary_min,
                and_(Job.salary_max.is_(None), Job.salary_min >= salary_min),
            )
        )

    if salary_max is not None:
        query = query.filter(Job.salary_min <= salary_max)

    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))

    if timezone:
        query = query.filter(Job.timezone == timezone)

    query = query.order_by(Job.created_at.desc())

    total = query.count()
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0
    jobs = query.offset((page - 1) * page_size).limit(page_size).all()

    return jobs, total, total_pages


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
    now = datetime.now(timezone.utc)
    job = (
        db.query(Job)
        .join(User, Job.hr_id == User.id)
        .filter(Job.id == job_id)
        .filter(Job.status == JobStatus.approved)
        .filter(or_(Job.expires_at.is_(None), Job.expires_at > now))
        .filter(User.status != UserStatus.blocked)
        .first()
    )
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
    now = datetime.now(timezone.utc)
    existing = (
        db.query(JobView)
        .filter(JobView.job_id == job.id, JobView.visitor_key == visitor_key)
        .first()
    )

    if existing:
        if existing.viewed_at < now - timedelta(hours=24):
            existing.viewed_at = now
            job.views += 1
            db.commit()
    else:
        db.add(JobView(job_id=job.id, visitor_key=visitor_key, viewed_at=now))
        job.views += 1
        db.commit()
