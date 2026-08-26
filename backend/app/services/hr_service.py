from fastapi import status
from sqlalchemy.orm import Session

from app.core.exceptions import APIError
from app.core.logging import logger
from app.core.slug import slugify, unique_slug
from app.models.contact import ContactChannel, UserContact
from app.models.job import Job, JobStatus, JobType
from app.models.job_tag import JobTag
from app.models.user import User
from app.repositories import category_repository, contact_repository, job_repository, tag_repository
from app.schemas.hr import HrProfileUpdate
from app.schemas.job import JobCreate, JobUpdate

SUBSTANTIVE_FIELDS = {
    "title",
    "description",
    "requirements",
    "salary_min",
    "salary_max",
    "location",
    "job_type",
    "category_id",
    "tag_ids",
}


def serialize_hr_profile(user: User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "company_name": user.company_name,
        "avatar": user.avatar,
        "status": user.status.value,
        "contacts": [{"channel": c.channel.value, "value": c.value} for c in user.contacts],
    }


def update_profile(db: Session, user: User, data: HrProfileUpdate) -> User:
    if data.name is not None:
        user.name = data.name
    if data.company_name is not None:
        user.company_name = data.company_name
    if data.avatar is not None:
        user.avatar = data.avatar

    if data.contacts is not None:
        contact_repository.delete_for_user(db, user.id)
        for c in data.contacts:
            contact_repository.create(
                db,
                UserContact(user_id=user.id, channel=ContactChannel(c.channel), value=c.value),
            )

    db.commit()
    db.refresh(user)
    return user


def serialize_hr_job(job: Job) -> dict:
    return {
        "id": job.id,
        "title": job.title,
        "slug": job.slug,
        "category": {"id": job.category.id, "name": job.category.name, "slug": job.category.slug},
        "job_type": job.job_type.value,
        "location": job.location,
        "timezone": job.timezone,
        "salary_min": float(job.salary_min) if job.salary_min is not None else None,
        "salary_max": float(job.salary_max) if job.salary_max is not None else None,
        "currency": job.currency,
        "description": job.description,
        "requirements": job.requirements,
        "status": job.status.value,
        "rejection_reason": job.rejection_reason,
        "views": job.views,
        "expires_at": job.expires_at,
        "tags": [jt.tag.name for jt in job.job_tags],
        "created_at": job.created_at,
        "updated_at": job.updated_at,
    }


def list_hr_jobs(db: Session, user: User, status_filter: str | None, page: int, page_size: int):
    return job_repository.list_by_hr(db, user.id, status_filter, page, page_size)


def _validate_category(db: Session, category_id: int) -> None:
    if not category_repository.get_active_by_id(db, category_id):
        raise APIError(status.HTTP_400_BAD_REQUEST, "job.category_invalid", "Category không hợp lệ")


def _validate_tags(db: Session, tag_ids: list[int]) -> None:
    if not tag_ids:
        return
    tags = tag_repository.get_active_by_ids(db, tag_ids)
    if len(tags) != len(set(tag_ids)):
        raise APIError(status.HTTP_400_BAD_REQUEST, "job.tag_invalid", "Tag không hợp lệ")


def _validate_salary(salary_min: float | None, salary_max: float | None) -> None:
    if salary_min is not None and salary_max is not None and salary_min > salary_max:
        raise APIError(
            status.HTTP_400_BAD_REQUEST, "job.salary_invalid", "salary_min phải nhỏ hơn hoặc bằng salary_max"
        )


def _generate_slug(db: Session, title: str, exclude_id: int | None = None) -> str:
    base = slugify(title) or "job"
    return unique_slug(base, job_repository.existing_slugs(db, exclude_id))


def create_job(db: Session, user: User, data: JobCreate) -> Job:
    _validate_category(db, data.category_id)
    _validate_tags(db, data.tag_ids)
    _validate_salary(data.salary_min, data.salary_max)

    job = Job(
        hr_id=user.id,
        category_id=data.category_id,
        title=data.title,
        slug=_generate_slug(db, data.title),
        job_type=JobType(data.job_type),
        location=data.location,
        timezone=data.timezone,
        salary_min=data.salary_min,
        salary_max=data.salary_max,
        currency=data.currency,
        description=data.description,
        requirements=data.requirements,
        expires_at=data.expires_at,
        status=JobStatus.draft,
    )
    job_repository.create(db, job)

    for tag_id in data.tag_ids:
        db.add(JobTag(job_id=job.id, tag_id=tag_id))

    db.commit()
    db.refresh(job)
    return job


def get_owned_job(db: Session, user: User, job_id: int) -> Job:
    job = job_repository.get_owned(db, user.id, job_id)
    if not job:
        raise APIError(status.HTTP_404_NOT_FOUND, "job.not_found", "Không tìm thấy tin tuyển dụng")
    return job


def update_job(db: Session, user: User, job_id: int, data: JobUpdate) -> Job:
    job = get_owned_job(db, user, job_id)

    data_dict = data.model_dump(exclude_unset=True)
    changed_substantive = bool(SUBSTANTIVE_FIELDS & set(data_dict.keys()))

    if "category_id" in data_dict:
        _validate_category(db, data_dict["category_id"])

    if "tag_ids" in data_dict:
        _validate_tags(db, data_dict["tag_ids"])
        job.job_tags.clear()
        for tag_id in data_dict["tag_ids"]:
            db.add(JobTag(job_id=job.id, tag_id=tag_id))
        data_dict.pop("tag_ids")

    if "job_type" in data_dict:
        data_dict["job_type"] = JobType(data_dict["job_type"])

    for field, value in data_dict.items():
        setattr(job, field, value)

    if "title" in data_dict:
        job.slug = _generate_slug(db, data_dict["title"], exclude_id=job.id)

    _validate_salary(job.salary_min, job.salary_max)

    if job.status == JobStatus.approved and changed_substantive:
        job.status = JobStatus.pending
        job.rejection_reason = None

    db.commit()
    db.refresh(job)
    return job


def submit_job(db: Session, user: User, job_id: int) -> Job:
    job = get_owned_job(db, user, job_id)
    if job.status not in (JobStatus.draft, JobStatus.rejected):
        raise APIError(
            status.HTTP_400_BAD_REQUEST,
            "job.only_draft_or_rejected_can_submit",
            "Chỉ job ở trạng thái draft hoặc rejected mới được gửi duyệt",
        )
    job.status = JobStatus.pending
    job.rejection_reason = None
    db.commit()
    logger.info("HR submitted job id=%s by user=%s", job.id, user.id)
    db.refresh(job)
    return job


def close_job(db: Session, user: User, job_id: int) -> Job:
    job = get_owned_job(db, user, job_id)
    if job.status != JobStatus.approved:
        raise APIError(status.HTTP_400_BAD_REQUEST, "job.only_approved_can_close", "Chỉ job đã approved mới được đóng")
    job.status = JobStatus.closed
    db.commit()
    db.refresh(job)
    return job


def delete_job(db: Session, user: User, job_id: int) -> None:
    job = get_owned_job(db, user, job_id)
    allowed = (JobStatus.draft, JobStatus.rejected, JobStatus.closed, JobStatus.expired)
    if job.status not in allowed:
        raise APIError(
            status.HTTP_400_BAD_REQUEST, "job.cannot_delete_status", "Không thể xóa job ở trạng thái hiện tại"
        )
    job_repository.delete(db, job)
    db.commit()
