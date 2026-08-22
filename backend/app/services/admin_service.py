import re

from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.job import Job, JobStatus
from app.models.job_view import JobView
from app.models.tag import Tag
from app.models.user import User, UserRole, UserStatus
from app.schemas.admin import CategoryCreate, CategoryUpdate, TagCreate, TagUpdate


def slugify(name: str) -> str:
    slug = name.strip().lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-")


def serialize_admin_job(job: Job) -> dict:
    return {
        "id": job.id,
        "title": job.title,
        "slug": job.slug,
        "company_name": job.hr.company_name or job.hr.name,
        "hr_id": job.hr_id,
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


def list_jobs(
    db: Session,
    status_filter: str | None,
    q: str | None,
    hr_id: int | None,
    category_id: int | None,
    page: int,
    page_size: int,
):
    query = db.query(Job)

    if status_filter:
        query = query.filter(Job.status == status_filter)
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


def list_pending_jobs(db: Session, page: int, page_size: int):
    return list_jobs(db, status_filter=JobStatus.pending.value, q=None, hr_id=None, category_id=None, page=page, page_size=page_size)


def get_job(db: Session, job_id: int) -> Job:
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tin tuyển dụng")
    return job


def approve_job(db: Session, job_id: int) -> Job:
    job = get_job(db, job_id)
    if job.status != JobStatus.pending:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Chỉ job pending mới được duyệt")
    job.status = JobStatus.approved
    job.rejection_reason = None
    db.commit()
    db.refresh(job)
    return job


def reject_job(db: Session, job_id: int, reason: str) -> Job:
    job = get_job(db, job_id)
    if job.status != JobStatus.pending:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Chỉ job pending mới được từ chối")
    job.status = JobStatus.rejected
    job.rejection_reason = reason
    db.commit()
    db.refresh(job)
    return job


def hide_job(db: Session, job_id: int) -> Job:
    job = get_job(db, job_id)
    if job.status != JobStatus.approved:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Chỉ job approved mới được ẩn")
    job.status = JobStatus.hidden
    db.commit()
    db.refresh(job)
    return job


def unhide_job(db: Session, job_id: int) -> Job:
    job = get_job(db, job_id)
    if job.status != JobStatus.hidden:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Chỉ job hidden mới được khôi phục")
    job.status = JobStatus.approved
    db.commit()
    db.refresh(job)
    return job


def delete_job(db: Session, job_id: int) -> None:
    job = get_job(db, job_id)
    db.query(JobView).filter(JobView.job_id == job_id).delete()
    db.delete(job)
    db.commit()


def serialize_admin_user(user: User, job_count: int) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "company_name": user.company_name,
        "status": user.status.value,
        "created_at": user.created_at,
        "job_count": job_count,
    }


def list_users(db: Session, search: str | None, status_filter: str | None, page: int, page_size: int):
    query = db.query(User).filter(User.role == UserRole.hr)

    if search:
        like = f"%{search}%"
        query = query.filter(or_(User.name.ilike(like), User.email.ilike(like)))
    if status_filter:
        query = query.filter(User.status == status_filter)

    query = query.order_by(User.created_at.desc())

    total = query.count()
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0
    users = query.offset((page - 1) * page_size).limit(page_size).all()

    items = [
        serialize_admin_user(user, db.query(Job).filter(Job.hr_id == user.id).count())
        for user in users
    ]

    return items, total, total_pages


def get_hr_user(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id, User.role == UserRole.hr).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tài khoản HR")
    return user


def serialize_hr_user(db: Session, user: User) -> dict:
    job_count = db.query(Job).filter(Job.hr_id == user.id).count()
    return serialize_admin_user(user, job_count)


def approve_user(db: Session, user_id: int) -> User:
    user = get_hr_user(db, user_id)
    if user.status != UserStatus.pending:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Chỉ tài khoản pending mới được duyệt")
    user.status = UserStatus.active
    db.commit()
    db.refresh(user)
    return user


def block_user(db: Session, user_id: int) -> User:
    user = get_hr_user(db, user_id)
    user.status = UserStatus.blocked
    db.commit()
    db.refresh(user)
    return user


def unblock_user(db: Session, user_id: int) -> User:
    user = get_hr_user(db, user_id)
    if user.status != UserStatus.blocked:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Chỉ tài khoản blocked mới được mở khóa")
    user.status = UserStatus.active
    db.commit()
    db.refresh(user)
    return user


def serialize_category(category: Category) -> dict:
    return {
        "id": category.id,
        "name": category.name,
        "slug": category.slug,
        "sort_order": category.sort_order,
        "is_active": category.is_active,
    }


def list_categories(db: Session):
    return [serialize_category(c) for c in db.query(Category).order_by(Category.sort_order).all()]


def create_category(db: Session, data: CategoryCreate) -> Category:
    slug = data.slug or slugify(data.name)
    if db.query(Category).filter(Category.slug == slug).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug category đã tồn tại")
    category = Category(name=data.name, slug=slug, sort_order=data.sort_order)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(db: Session, category_id: int, data: CategoryUpdate) -> Category:
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy category")

    if data.name is not None:
        category.name = data.name
    if data.slug is not None:
        if db.query(Category).filter(Category.slug == data.slug, Category.id != category_id).first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug category đã tồn tại")
        category.slug = data.slug
    if data.sort_order is not None:
        category.sort_order = data.sort_order

    db.commit()
    db.refresh(category)
    return category


def deactivate_category(db: Session, category_id: int) -> Category:
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy category")
    category.is_active = False
    db.commit()
    db.refresh(category)
    return category


def serialize_tag(tag: Tag) -> dict:
    return {"id": tag.id, "name": tag.name, "slug": tag.slug, "is_active": tag.is_active}


def list_tags(db: Session):
    return [serialize_tag(t) for t in db.query(Tag).order_by(Tag.name).all()]


def create_tag(db: Session, data: TagCreate) -> Tag:
    slug = data.slug or slugify(data.name)
    if db.query(Tag).filter(Tag.slug == slug).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug tag đã tồn tại")
    tag = Tag(name=data.name, slug=slug)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def update_tag(db: Session, tag_id: int, data: TagUpdate) -> Tag:
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tag")

    if data.name is not None:
        tag.name = data.name
    if data.slug is not None:
        if db.query(Tag).filter(Tag.slug == data.slug, Tag.id != tag_id).first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug tag đã tồn tại")
        tag.slug = data.slug

    db.commit()
    db.refresh(tag)
    return tag


def deactivate_tag(db: Session, tag_id: int) -> Tag:
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tag")
    tag.is_active = False
    db.commit()
    db.refresh(tag)
    return tag
