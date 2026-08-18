from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, require_active_hr
from app.core.config import get_settings
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.hr import HrProfileResponse, HrProfileUpdate
from app.schemas.job import HrJobResponse, JobCreate, JobUpdate
from app.services import hr_service

router = APIRouter(prefix="/hr", tags=["hr"])

settings = get_settings()


@router.get("/profile", response_model=HrProfileResponse)
def get_profile(current_user: User = Depends(require_active_hr)):
    return hr_service.serialize_hr_profile(current_user)


@router.patch("/profile", response_model=HrProfileResponse)
def update_profile(
    data: HrProfileUpdate,
    current_user: User = Depends(require_active_hr),
    db: Session = Depends(get_db),
):
    user = hr_service.update_profile(db, current_user, data)
    return hr_service.serialize_hr_profile(user)


@router.get("/jobs", response_model=PaginatedResponse[HrJobResponse])
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


@router.post("/jobs", response_model=HrJobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    data: JobCreate,
    current_user: User = Depends(require_active_hr),
    db: Session = Depends(get_db),
):
    job = hr_service.create_job(db, current_user, data)
    return hr_service.serialize_hr_job(job)


@router.get("/jobs/{job_id}", response_model=HrJobResponse)
def get_job(
    job_id: int,
    current_user: User = Depends(require_active_hr),
    db: Session = Depends(get_db),
):
    job = hr_service.get_owned_job(db, current_user, job_id)
    return hr_service.serialize_hr_job(job)


@router.patch("/jobs/{job_id}", response_model=HrJobResponse)
def update_job(
    job_id: int,
    data: JobUpdate,
    current_user: User = Depends(require_active_hr),
    db: Session = Depends(get_db),
):
    job = hr_service.update_job(db, current_user, job_id, data)
    return hr_service.serialize_hr_job(job)


@router.delete("/jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: int,
    current_user: User = Depends(require_active_hr),
    db: Session = Depends(get_db),
):
    hr_service.delete_job(db, current_user, job_id)


@router.post("/jobs/{job_id}/submit", response_model=HrJobResponse)
def submit_job(
    job_id: int,
    current_user: User = Depends(require_active_hr),
    db: Session = Depends(get_db),
):
    job = hr_service.submit_job(db, current_user, job_id)
    return hr_service.serialize_hr_job(job)


@router.post("/jobs/{job_id}/close", response_model=HrJobResponse)
def close_job(
    job_id: int,
    current_user: User = Depends(require_active_hr),
    db: Session = Depends(get_db),
):
    job = hr_service.close_job(db, current_user, job_id)
    return hr_service.serialize_hr_job(job)
