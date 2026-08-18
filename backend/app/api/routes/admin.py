from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, require_admin
from app.core.config import get_settings
from app.models.user import User
from app.schemas.admin import (
    AdminJobResponse,
    AdminUserResponse,
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
    RejectRequest,
    TagCreate,
    TagResponse,
    TagUpdate,
)
from app.schemas.common import PaginatedResponse
from app.services import admin_service

router = APIRouter(prefix="/admin", tags=["admin"])

settings = get_settings()


@router.get("/jobs", response_model=PaginatedResponse[AdminJobResponse])
def list_jobs(
    status_filter: str | None = Query(default=None, alias="status"),
    q: str | None = None,
    hr_id: int | None = None,
    category_id: int | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(settings.page_size_default, ge=1, le=settings.page_size_max),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    jobs, total, total_pages = admin_service.list_jobs(
        db, status_filter, q, hr_id, category_id, page, page_size
    )
    return {
        "items": [admin_service.serialize_admin_job(job) for job in jobs],
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
    }


@router.get("/jobs/pending", response_model=PaginatedResponse[AdminJobResponse])
def list_pending_jobs(
    page: int = Query(1, ge=1),
    page_size: int = Query(settings.page_size_default, ge=1, le=settings.page_size_max),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    jobs, total, total_pages = admin_service.list_pending_jobs(db, page, page_size)
    return {
        "items": [admin_service.serialize_admin_job(job) for job in jobs],
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
    }


@router.post("/jobs/{job_id}/approve", response_model=AdminJobResponse)
def approve_job(job_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    job = admin_service.approve_job(db, job_id)
    return admin_service.serialize_admin_job(job)


@router.post("/jobs/{job_id}/reject", response_model=AdminJobResponse)
def reject_job(
    job_id: int,
    data: RejectRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    job = admin_service.reject_job(db, job_id, data.reason)
    return admin_service.serialize_admin_job(job)


@router.post("/jobs/{job_id}/hide", response_model=AdminJobResponse)
def hide_job(job_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    job = admin_service.hide_job(db, job_id)
    return admin_service.serialize_admin_job(job)


@router.post("/jobs/{job_id}/unhide", response_model=AdminJobResponse)
def unhide_job(job_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    job = admin_service.unhide_job(db, job_id)
    return admin_service.serialize_admin_job(job)


@router.get("/users", response_model=PaginatedResponse[AdminUserResponse])
def list_users(
    search: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(settings.page_size_default, ge=1, le=settings.page_size_max),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    items, total, total_pages = admin_service.list_users(db, search, status_filter, page, page_size)
    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
    }


@router.post("/users/{user_id}/approve", response_model=AdminUserResponse)
def approve_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = admin_service.approve_user(db, user_id)
    return admin_service.serialize_hr_user(db, user)


@router.post("/users/{user_id}/block", response_model=AdminUserResponse)
def block_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = admin_service.block_user(db, user_id)
    return admin_service.serialize_hr_user(db, user)


@router.post("/users/{user_id}/unblock", response_model=AdminUserResponse)
def unblock_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = admin_service.unblock_user(db, user_id)
    return admin_service.serialize_hr_user(db, user)


@router.get("/categories", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return admin_service.list_categories(db)


@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(data: CategoryCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return admin_service.serialize_category(admin_service.create_category(db, data))


@router.patch("/categories/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return admin_service.serialize_category(admin_service.update_category(db, category_id, data))


@router.post("/categories/{category_id}/deactivate", response_model=CategoryResponse)
def deactivate_category(category_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return admin_service.serialize_category(admin_service.deactivate_category(db, category_id))


@router.get("/tags", response_model=list[TagResponse])
def list_tags(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return admin_service.list_tags(db)


@router.post("/tags", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
def create_tag(data: TagCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return admin_service.serialize_tag(admin_service.create_tag(db, data))


@router.patch("/tags/{tag_id}", response_model=TagResponse)
def update_tag(
    tag_id: int,
    data: TagUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return admin_service.serialize_tag(admin_service.update_tag(db, tag_id, data))


@router.post("/tags/{tag_id}/deactivate", response_model=TagResponse)
def deactivate_tag(tag_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return admin_service.serialize_tag(admin_service.deactivate_tag(db, tag_id))
