from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, require_active_hr
from app.core.config import get_settings
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.hr import HrProfileResponse, HrProfileUpdate, HrStatsResponse
from app.schemas.job import HrJobResponse, JobCreate, JobUpdate
from app.services import hr_service

router = APIRouter(prefix="/hr", tags=["hr"])

settings = get_settings()


@router.get(
    "/profile",
    response_model=HrProfileResponse,
    summary="Hồ sơ HR hiện tại",
    description="Trả về hồ sơ và các kênh liên hệ của HR. Yêu cầu HR active.",
)
def get_profile(current_user: User = Depends(require_active_hr)):
    return hr_service.serialize_hr_profile(current_user)


@router.patch(
    "/profile",
    response_model=HrProfileResponse,
    summary="Cập nhật hồ sơ HR",
    description="Cập nhật tên/công ty và các kênh liên hệ (email, phone, telegram, ...). Yêu cầu HR active.",
)
def update_profile(
    data: HrProfileUpdate,
    current_user: User = Depends(require_active_hr),
    db: Session = Depends(get_db),
):
    user = hr_service.update_profile(db, current_user, data)
    return hr_service.serialize_hr_profile(user)


@router.get(
    "/jobs",
    response_model=PaginatedResponse[HrJobResponse],
    summary="Danh sách job của HR",
    description="Liệt kê job thuộc HR hiện tại, lọc theo trạng thái và phân trang.",
)
def list_jobs(
    status_filter: str | None = Query(default=None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(settings.page_size_default, ge=1, le=settings.page_size_max),
    current_user: User = Depends(require_active_hr),
    db: Session = Depends(get_db),
):
    jobs, total, total_pages = hr_service.list_hr_jobs(db, current_user, status_filter, page, page_size)
    return {
        "items": [hr_service.serialize_hr_job(job) for job in jobs],
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
    }


@router.get(
    "/jobs/stats",
    response_model=HrStatsResponse,
    summary="Thống kê job của HR",
    description="Số lượng job theo trạng thái (tổng, đang mở, chờ duyệt, đã đóng) của HR hiện tại.",
)
def job_stats(current_user: User = Depends(require_active_hr), db: Session = Depends(get_db)):
    return hr_service.job_stats(db, current_user)


@router.post(
    "/jobs",
    response_model=HrJobResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Đăng tin mới (draft)",
    description=(
        "Tạo một job với trạng thái `draft`. Slug tự sinh từ tiêu đề, thêm hậu tố số nếu trùng. "
        "Gửi duyệt bằng `POST /hr/jobs/{id}/submit`."
    ),
)
def create_job(
    data: JobCreate,
    current_user: User = Depends(require_active_hr),
    db: Session = Depends(get_db),
):
    job = hr_service.create_job(db, current_user, data)
    return hr_service.serialize_hr_job(job)


@router.get(
    "/jobs/{job_id}",
    response_model=HrJobResponse,
    summary="Chi tiết job của HR",
    description="Trả về một job thuộc HR hiện tại theo id. Trả về `404` nếu không sở hữu.",
)
def get_job(
    job_id: int,
    current_user: User = Depends(require_active_hr),
    db: Session = Depends(get_db),
):
    job = hr_service.get_owned_job(db, current_user, job_id)
    return hr_service.serialize_hr_job(job)


@router.patch(
    "/jobs/{job_id}",
    response_model=HrJobResponse,
    summary="Cập nhật job",
    description=(
        "Cập nhật job (chỉ gửi các field muốn đổi). Nếu job đang `approved` mà sửa nội dung "
        "quan trọng (tiêu đề, mô tả, mức lương, ...) sẽ quay về `pending` để duyệt lại."
    ),
)
def update_job(
    job_id: int,
    data: JobUpdate,
    current_user: User = Depends(require_active_hr),
    db: Session = Depends(get_db),
):
    job = hr_service.update_job(db, current_user, job_id, data)
    return hr_service.serialize_hr_job(job)


@router.delete(
    "/jobs/{job_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Xoá job",
    description="Xoá job thuộc HR hiện tại (chỉ cho `draft`, `rejected`, `closed`, `expired`).",
)
def delete_job(
    job_id: int,
    current_user: User = Depends(require_active_hr),
    db: Session = Depends(get_db),
):
    hr_service.delete_job(db, current_user, job_id)


@router.post(
    "/jobs/{job_id}/submit",
    response_model=HrJobResponse,
    summary="Gửi duyệt job",
    description="Chuyển job sang trạng thái `pending` để Admin duyệt.",
)
def submit_job(
    job_id: int,
    current_user: User = Depends(require_active_hr),
    db: Session = Depends(get_db),
):
    job = hr_service.submit_job(db, current_user, job_id)
    return hr_service.serialize_hr_job(job)


@router.post(
    "/jobs/{job_id}/close",
    response_model=HrJobResponse,
    summary="Đóng job",
    description="Chuyển job đang `approved` sang trạng thái `closed` (ngừng nhận ứng tuyển).",
)
def close_job(
    job_id: int,
    current_user: User = Depends(require_active_hr),
    db: Session = Depends(get_db),
):
    job = hr_service.close_job(db, current_user, job_id)
    return hr_service.serialize_hr_job(job)
