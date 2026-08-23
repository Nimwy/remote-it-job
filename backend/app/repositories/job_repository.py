from datetime import UTC, datetime

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.job import Job, JobStatus
from app.models.tag import Tag
from app.models.user import User, UserStatus


def get_by_id(db: Session, job_id: int) -> Job | None:
    return db.query(Job).filter(Job.id == job_id).first()


def get_owned(db: Session, user_id: int, job_id: int) -> Job | None:
    return db.query(Job).filter(Job.id == job_id, Job.hr_id == user_id).first()


def get_public(db: Session, job_id: int) -> Job | None:
    now = datetime.now(UTC)
    return (
        db.query(Job)
        .join(User, Job.hr_id == User.id)
        .filter(Job.id == job_id)
        .filter(Job.status == JobStatus.approved)
        .filter(or_(Job.expires_at.is_(None), Job.expires_at > now))
        .filter(User.status != UserStatus.blocked)
        .first()
    )


def create(db: Session, job: Job) -> Job:
    db.add(job)
    db.flush()
    return job


def search_public(
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
) -> tuple[list[Job], int, int]:
    now = datetime.now(UTC)
    query = db.query(Job).join(User, Job.hr_id == User.id)
    query = query.filter(Job.status == JobStatus.approved)
    query = query.filter(or_(Job.expires_at.is_(None), Job.expires_at > now))
    query = query.filter(User.status != UserStatus.blocked)

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


def list_by_hr(
    db: Session,
    user_id: int,
    status: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[Job], int, int]:
    query = db.query(Job).filter(Job.hr_id == user_id)
    if status:
        query = query.filter(Job.status == status)
    query = query.order_by(Job.created_at.desc())

    total = query.count()
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0
    jobs = query.offset((page - 1) * page_size).limit(page_size).all()
    return jobs, total, total_pages


def list_all(
    db: Session,
    status: str | None = None,
    q: str | None = None,
    hr_id: int | None = None,
    category_id: int | None = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[Job], int, int]:
    query = db.query(Job)
    if status:
        query = query.filter(Job.status == status)
    if q:
        like = f"%{q}%"
        query = query.filter(or_(Job.title.ilike(like), Job.description.ilike(like)))
    if hr_id:
        query = query.filter(Job.hr_id == hr_id)
    if category_id:
        query = query.filter(Job.category_id == category_id)
    query = query.order_by(Job.created_at.desc())

    total = query.count()
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0
    jobs = query.offset((page - 1) * page_size).limit(page_size).all()
    return jobs, total, total_pages


def existing_slugs(db: Session, exclude_id: int | None = None) -> set[str]:
    query = db.query(Job.slug)
    if exclude_id is not None:
        query = query.filter(Job.id != exclude_id)
    return {slug for (slug,) in query.all()}


def count_by_hr(db: Session, user_id: int) -> int:
    return db.query(Job).filter(Job.hr_id == user_id).count()


def delete(db: Session, job: Job) -> None:
    db.delete(job)
