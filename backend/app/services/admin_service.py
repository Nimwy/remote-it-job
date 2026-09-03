from fastapi import status
from sqlalchemy.orm import Session

from app.core.exceptions import APIError
from app.core.logging import logger
from app.core.slug import slugify
from app.models.category import Category
from app.models.job import Job, JobStatus
from app.models.tag import Tag
from app.models.user import User, UserStatus
from app.repositories import category_repository, job_repository, job_view_repository, tag_repository, user_repository
from app.schemas.admin import (
    AdminJobResponse,
    AdminUserResponse,
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
    TagCreate,
    TagResponse,
    TagUpdate,
)
from app.schemas.job import CategoryInfo


def serialize_admin_job(job: Job) -> AdminJobResponse:
    return AdminJobResponse(
        id=job.id,
        title=job.title,
        slug=job.slug,
        company_name=job.hr.company_name or job.hr.name,
        hr_id=job.hr_id,
        category=CategoryInfo(id=job.category.id, name=job.category.name, slug=job.category.slug),
        job_type=job.job_type.value,
        location=job.location,
        timezone=job.timezone,
        salary_min=float(job.salary_min) if job.salary_min is not None else None,
        salary_max=float(job.salary_max) if job.salary_max is not None else None,
        currency=job.currency,
        description=job.description,
        requirements=job.requirements,
        status=job.status.value,
        rejection_reason=job.rejection_reason,
        views=job.views,
        expires_at=job.expires_at,
        tags=[jt.tag.name for jt in job.job_tags],
        created_at=job.created_at,
        updated_at=job.updated_at,
    )


def list_jobs(
    db: Session,
    status_filter: str | None,
    q: str | None,
    hr_id: int | None,
    category_id: int | None,
    page: int,
    page_size: int,
):
    return job_repository.list_all(db, status_filter, q, hr_id, category_id, page, page_size)


def list_pending_jobs(db: Session, page: int, page_size: int):
    return job_repository.list_all(
        db, status=JobStatus.pending.value, q=None, hr_id=None, category_id=None, page=page, page_size=page_size
    )


def get_job(db: Session, job_id: int) -> Job:
    job = job_repository.get_by_id(db, job_id)
    if not job:
        raise APIError(status.HTTP_404_NOT_FOUND, "job.not_found", "Không tìm thấy tin tuyển dụng")
    return job


def approve_job(db: Session, job_id: int) -> Job:
    job = get_job(db, job_id)
    if job.status != JobStatus.pending:
        raise APIError(status.HTTP_400_BAD_REQUEST, "job.only_pending_can_approve", "Chỉ job pending mới được duyệt")
    job.status = JobStatus.approved
    job.rejection_reason = None
    db.commit()
    logger.info("Admin approved job id=%s", job.id)
    db.refresh(job)
    return job


def reject_job(db: Session, job_id: int, reason: str) -> Job:
    job = get_job(db, job_id)
    if job.status != JobStatus.pending:
        raise APIError(status.HTTP_400_BAD_REQUEST, "job.only_pending_can_reject", "Chỉ job pending mới được từ chối")
    job.status = JobStatus.rejected
    job.rejection_reason = reason
    db.commit()
    logger.info("Admin rejected job id=%s reason=%s", job.id, reason)
    db.refresh(job)
    return job


def hide_job(db: Session, job_id: int) -> Job:
    job = get_job(db, job_id)
    if job.status != JobStatus.approved:
        raise APIError(status.HTTP_400_BAD_REQUEST, "job.only_approved_can_hide", "Chỉ job approved mới được ẩn")
    job.status = JobStatus.hidden
    db.commit()
    db.refresh(job)
    return job


def unhide_job(db: Session, job_id: int) -> Job:
    job = get_job(db, job_id)
    if job.status != JobStatus.hidden:
        raise APIError(status.HTTP_400_BAD_REQUEST, "job.only_hidden_can_unhide", "Chỉ job hidden mới được khôi phục")
    job.status = JobStatus.approved
    db.commit()
    db.refresh(job)
    return job


def delete_job(db: Session, job_id: int) -> None:
    job = get_job(db, job_id)
    job_view_repository.delete_for_job(db, job_id)
    job_repository.delete(db, job)
    db.commit()


def serialize_admin_user(user: User, job_count: int) -> AdminUserResponse:
    return AdminUserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        company_name=user.company_name,
        status=user.status.value,
        created_at=user.created_at,
        job_count=job_count,
    )


def list_users(db: Session, search: str | None, status_filter: str | None, page: int, page_size: int):
    users, total = user_repository.list_hr_users(db, search, status_filter, page, page_size)
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0
    items = [
        serialize_admin_user(user, job_repository.count_by_hr(db, user.id))
        for user in users
    ]
    return items, total, total_pages


def get_hr_user(db: Session, user_id: int) -> User:
    user = user_repository.find_hr_by_id(db, user_id)
    if not user:
        raise APIError(status.HTTP_404_NOT_FOUND, "user.hr_not_found", "Không tìm thấy tài khoản HR")
    return user


def serialize_hr_user(db: Session, user: User) -> AdminUserResponse:
    return serialize_admin_user(user, job_repository.count_by_hr(db, user.id))


def approve_user(db: Session, user_id: int) -> User:
    user = get_hr_user(db, user_id)
    if user.status != UserStatus.pending:
        raise APIError(
            status.HTTP_400_BAD_REQUEST, "user.only_pending_can_approve", "Chỉ tài khoản pending mới được duyệt"
        )
    user.status = UserStatus.active
    db.commit()
    db.refresh(user)
    return user


def block_user(db: Session, user_id: int) -> User:
    user = get_hr_user(db, user_id)
    user.status = UserStatus.blocked
    db.commit()
    logger.info("Admin blocked user id=%s", user.id)
    db.refresh(user)
    return user


def unblock_user(db: Session, user_id: int) -> User:
    user = get_hr_user(db, user_id)
    if user.status != UserStatus.blocked:
        raise APIError(
            status.HTTP_400_BAD_REQUEST, "user.only_blocked_can_unblock", "Chỉ tài khoản blocked mới được mở khóa"
        )
    user.status = UserStatus.active
    db.commit()
    db.refresh(user)
    return user


def serialize_category(category: Category) -> CategoryResponse:
    return CategoryResponse(
        id=category.id,
        name=category.name,
        slug=category.slug,
        sort_order=category.sort_order,
        is_active=category.is_active,
    )


def list_categories(db: Session):
    return [serialize_category(c) for c in category_repository.list_all(db)]


def create_category(db: Session, data: CategoryCreate) -> Category:
    slug = data.slug or slugify(data.name)
    if category_repository.get_by_slug(db, slug):
        raise APIError(status.HTTP_409_CONFLICT, "catalog.category_slug_exists", "Slug category đã tồn tại")
    category = Category(name=data.name, slug=slug, sort_order=data.sort_order)
    category_repository.create(db, category)
    db.commit()
    db.refresh(category)
    return category


def update_category(db: Session, category_id: int, data: CategoryUpdate) -> Category:
    category = category_repository.get_by_id(db, category_id)
    if not category:
        raise APIError(status.HTTP_404_NOT_FOUND, "catalog.category_not_found", "Không tìm thấy category")

    if data.name is not None:
        category.name = data.name
    if data.slug is not None:
        if category_repository.get_by_slug(db, data.slug) and category.slug != data.slug:
            raise APIError(status.HTTP_409_CONFLICT, "catalog.category_slug_exists", "Slug category đã tồn tại")
        category.slug = data.slug
    if data.sort_order is not None:
        category.sort_order = data.sort_order

    db.commit()
    db.refresh(category)
    return category


def deactivate_category(db: Session, category_id: int) -> Category:
    category = category_repository.get_by_id(db, category_id)
    if not category:
        raise APIError(status.HTTP_404_NOT_FOUND, "catalog.category_not_found", "Không tìm thấy category")
    category.is_active = False
    db.commit()
    db.refresh(category)
    return category


def serialize_tag(tag: Tag) -> TagResponse:
    return TagResponse(id=tag.id, name=tag.name, slug=tag.slug, is_active=tag.is_active)


def list_tags(db: Session):
    return [serialize_tag(t) for t in tag_repository.list_all(db)]


def create_tag(db: Session, data: TagCreate) -> Tag:
    slug = data.slug or slugify(data.name)
    if tag_repository.get_by_slug(db, slug):
        raise APIError(status.HTTP_409_CONFLICT, "catalog.tag_slug_exists", "Slug tag đã tồn tại")
    tag = Tag(name=data.name, slug=slug)
    tag_repository.create(db, tag)
    db.commit()
    db.refresh(tag)
    return tag


def update_tag(db: Session, tag_id: int, data: TagUpdate) -> Tag:
    tag = tag_repository.get_by_id(db, tag_id)
    if not tag:
        raise APIError(status.HTTP_404_NOT_FOUND, "catalog.tag_not_found", "Không tìm thấy tag")

    if data.name is not None:
        tag.name = data.name
    if data.slug is not None:
        if tag_repository.get_by_slug(db, data.slug) and tag.slug != data.slug:
            raise APIError(status.HTTP_409_CONFLICT, "catalog.tag_slug_exists", "Slug tag đã tồn tại")
        tag.slug = data.slug

    db.commit()
    db.refresh(tag)
    return tag


def deactivate_tag(db: Session, tag_id: int) -> Tag:
    tag = tag_repository.get_by_id(db, tag_id)
    if not tag:
        raise APIError(status.HTTP_404_NOT_FOUND, "catalog.tag_not_found", "Không tìm thấy tag")
    tag.is_active = False
    db.commit()
    db.refresh(tag)
    return tag
