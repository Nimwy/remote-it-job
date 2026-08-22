from datetime import datetime, timedelta, timezone

from app.core.slug import slugify
from app.models.category import Category
from app.models.contact import ContactChannel, UserContact
from app.models.job import Job, JobStatus, JobType
from app.models.job_tag import JobTag
from app.models.tag import Tag
from app.models.user import User, UserRole, UserStatus


def create_user(db, email, status=UserStatus.active, role=UserRole.hr):
    user = User(name=email, email=email, status=status, role=role, company_name="Corp")
    db.add(user)
    db.flush()
    return user


def create_category(db, name="Frontend", slug="frontend"):
    category = Category(name=name, slug=slug, sort_order=1)
    db.add(category)
    db.flush()
    return category


def create_tag(db, name="React", slug="react"):
    tag = Tag(name=name, slug=slug)
    db.add(tag)
    db.flush()
    return tag


def create_job(db, hr, category, title="React Developer", status=JobStatus.approved, tags=None, **kwargs):
    job = Job(
        hr_id=hr.id,
        category_id=category.id,
        title=title,
        slug=kwargs.get("slug") or slugify(title),
        job_type=kwargs.get("job_type", JobType.fulltime),
        location=kwargs.get("location"),
        timezone=kwargs.get("timezone"),
        salary_min=kwargs.get("salary_min"),
        salary_max=kwargs.get("salary_max"),
        currency=kwargs.get("currency"),
        description=kwargs.get("description", "Build web apps"),
        requirements=kwargs.get("requirements", "2+ years React"),
        status=status,
        expires_at=kwargs.get("expires_at"),
    )
    db.add(job)
    db.flush()

    if tags:
        for tag in tags:
            db.add(JobTag(job_id=job.id, tag_id=tag.id))

    db.flush()
    return job


def setup_seed(db):
    hr = create_user(db, "hr@example.com")
    blocked_hr = create_user(db, "blocked@example.com", status=UserStatus.blocked)
    category = create_category(db)
    tag = create_tag(db)
    db.add(UserContact(user_id=hr.id, channel=ContactChannel.email, value="hr@example.com"))

    approved_job = create_job(
        db,
        hr,
        category,
        title="React Developer",
        tags=[tag],
        salary_min=1000,
        salary_max=2000,
        currency="USD",
        location="Vietnam",
    )

    expired_job = create_job(
        db,
        hr,
        category,
        title="Expired Job",
        expires_at=datetime.now(timezone.utc) - timedelta(days=1),
    )

    pending_job = create_job(db, hr, category, title="Pending Job", status=JobStatus.pending)

    blocked_owner_job = create_job(db, blocked_hr, category, title="Blocked HR Job")

    db.commit()
    return {
        "approved_job": approved_job,
        "expired_job": expired_job,
        "pending_job": pending_job,
        "blocked_owner_job": blocked_owner_job,
    }
