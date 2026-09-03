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
from app.schemas.common import PaginatedResponse, paginated
from app.services import admin_service

router = APIRouter(prefix="/admin", tags=["admin"])

settings = get_settings()


@router.get(
    "/jobs",
    response_model=PaginatedResponse[AdminJobResponse],
    summary="Danh sách job (toàn hệ thống)",
    description="Liệt kê tất cả job, lọc theo trạng thái, từ khoá, HR hoặc category, có phân trang. Yêu cầu Admin.",
)
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
    return paginated([admin_service.serialize_admin_job(job) for job in jobs], page, page_size, total, total_pages)


@router.get(
    "/jobs/pending",
    response_model=PaginatedResponse[AdminJobResponse],
    summary="Hàng đợi duyệt tin",
    description="Liệt kê các job đang chờ duyệt (`pending`), có phân trang. Yêu cầu Admin.",
)
def list_pending_jobs(
    page: int = Query(1, ge=1),
    page_size: int = Query(settings.page_size_default, ge=1, le=settings.page_size_max),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    jobs, total, total_pages = admin_service.list_pending_jobs(db, page, page_size)
    return paginated([admin_service.serialize_admin_job(job) for job in jobs], page, page_size, total, total_pages)


@router.post(
    "/jobs/{job_id}/approve",
    response_model=AdminJobResponse,
    summary="Duyệt job",
    description="Chuyển job sang `approved` để xuất hiện công khai. Yêu cầu Admin.",
)
def approve_job(job_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    job = admin_service.approve_job(db, job_id)
    return admin_service.serialize_admin_job(job)


@router.post(
    "/jobs/{job_id}/reject",
    response_model=AdminJobResponse,
    summary="Từ chối job",
    description="Chuyển job sang `rejected` với lý do từ chối (gửi cho HR). Yêu cầu Admin.",
)
def reject_job(
    job_id: int,
    data: RejectRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    job = admin_service.reject_job(db, job_id, data.reason)
    return admin_service.serialize_admin_job(job)


@router.post(
    "/jobs/{job_id}/hide",
    response_model=AdminJobResponse,
    summary="Ẩn job",
    description="Chuyển job sang `hidden`, không hiển thị công khai. Yêu cầu Admin.",
)
def hide_job(job_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    job = admin_service.hide_job(db, job_id)
    return admin_service.serialize_admin_job(job)


@router.post(
    "/jobs/{job_id}/unhide",
    response_model=AdminJobResponse,
    summary="Bỏ ẩn job",
    description="Đưa job từ `hidden` về `approved` để hiển thị lại. Yêu cầu Admin.",
)
def unhide_job(job_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    job = admin_service.unhide_job(db, job_id)
    return admin_service.serialize_admin_job(job)


@router.delete(
    "/jobs/{job_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Xoá job",
    description="Xoá vĩnh viễn một job. Yêu cầu Admin.",
)
def delete_job(job_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    admin_service.delete_job(db, job_id)


@router.get(
    "/users",
    response_model=PaginatedResponse[AdminUserResponse],
    summary="Danh sách HR",
    description="Liệt kê tài khoản HR, lọc theo từ khoá/trạng thái, có phân trang. Yêu cầu Admin.",
)
def list_users(
    search: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(settings.page_size_default, ge=1, le=settings.page_size_max),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    items, total, total_pages = admin_service.list_users(db, search, status_filter, page, page_size)
    return paginated(items, page, page_size, total, total_pages)


@router.post(
    "/users/{user_id}/approve",
    response_model=AdminUserResponse,
    summary="Duyệt HR",
    description="Chuyển HR từ `pending` sang `active` để dùng được chức năng đăng tin. Yêu cầu Admin.",
)
def approve_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = admin_service.approve_user(db, user_id)
    return admin_service.serialize_hr_user(db, user)


@router.post(
    "/users/{user_id}/block",
    response_model=AdminUserResponse,
    summary="Khoá HR",
    description="Chuyển HR sang `blocked`; job của HR không hiển thị công khai. Yêu cầu Admin.",
)
def block_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = admin_service.block_user(db, user_id)
    return admin_service.serialize_hr_user(db, user)


@router.post(
    "/users/{user_id}/unblock",
    response_model=AdminUserResponse,
    summary="Mở khoá HR",
    description="Đưa HR từ `blocked` về `active`. Yêu cầu Admin.",
)
def unblock_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = admin_service.unblock_user(db, user_id)
    return admin_service.serialize_hr_user(db, user)


@router.get(
    "/categories",
    response_model=list[CategoryResponse],
    summary="Danh sách danh mục (Admin)",
    description="Liệt kê toàn bộ danh mục kể cả đã tắt. Yêu cầu Admin.",
)
def list_categories(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return admin_service.list_categories(db)


@router.post(
    "/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Tạo danh mục",
    description="Tạo danh mục mới; `slug` tự sinh nếu không cung cấp. Yêu cầu Admin.",
)
def create_category(data: CategoryCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return admin_service.serialize_category(admin_service.create_category(db, data))


@router.patch(
    "/categories/{category_id}",
    response_model=CategoryResponse,
    summary="Cập nhật danh mục",
    description="Cập nhật tên/slug danh mục. Yêu cầu Admin.",
)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return admin_service.serialize_category(admin_service.update_category(db, category_id, data))


@router.post(
    "/categories/{category_id}/deactivate",
    response_model=CategoryResponse,
    summary="Tắt danh mục",
    description="Đặt `is_active=false` để ẩn danh mục. Yêu cầu Admin.",
)
def deactivate_category(category_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return admin_service.serialize_category(admin_service.deactivate_category(db, category_id))


@router.get(
    "/tags",
    response_model=list[TagResponse],
    summary="Danh sách thẻ (Admin)",
    description="Liệt kê toàn bộ thẻ kể cả đã tắt. Yêu cầu Admin.",
)
def list_tags(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return admin_service.list_tags(db)


@router.post(
    "/tags",
    response_model=TagResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Tạo thẻ",
    description="Tạo thẻ mới; `slug` tự sinh nếu không cung cấp. Yêu cầu Admin.",
)
def create_tag(data: TagCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return admin_service.serialize_tag(admin_service.create_tag(db, data))


@router.patch(
    "/tags/{tag_id}",
    response_model=TagResponse,
    summary="Cập nhật thẻ",
    description="Cập nhật tên/slug thẻ. Yêu cầu Admin.",
)
def update_tag(
    tag_id: int,
    data: TagUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return admin_service.serialize_tag(admin_service.update_tag(db, tag_id, data))


@router.post(
    "/tags/{tag_id}/deactivate",
    response_model=TagResponse,
    summary="Tắt thẻ",
    description="Đặt `is_active=false` để ẩn thẻ. Yêu cầu Admin.",
)
def deactivate_tag(tag_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return admin_service.serialize_tag(admin_service.deactivate_tag(db, tag_id))
