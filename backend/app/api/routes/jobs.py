import secrets

from fastapi import APIRouter, Depends, Query, Request, Response
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.core.config import get_settings
from app.schemas.common import PaginatedResponse
from app.schemas.job import JobDetailResponse, JobListItem
from app.services import job_service

router = APIRouter(tags=["jobs"])

settings = get_settings()


@router.get("/jobs", response_model=PaginatedResponse[JobListItem])
def list_jobs(
    q: str | None = None,
    category: str | None = None,
    tags: str | None = None,
    job_type: str | None = None,
    salary_min: float | None = None,
    salary_max: float | None = None,
    location: str | None = None,
    timezone: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(settings.page_size_default, ge=1, le=settings.page_size_max),
    db: Session = Depends(get_db),
):
    jobs, total, total_pages = job_service.search_jobs(
        db=db,
        q=q,
        category=category,
        tags=tags,
        job_type=job_type,
        salary_min=salary_min,
        salary_max=salary_max,
        location=location,
        timezone=timezone,
        page=page,
        page_size=page_size,
    )

    items = [job_service.serialize_job_list_item(job) for job in jobs]
    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
    }


@router.get("/jobs/{job_id}", response_model=JobDetailResponse)
def get_job(
    job_id: int,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    job = job_service.get_public_job(db, job_id)

    visitor_key = request.cookies.get(settings.visitor_cookie_name)
    if not visitor_key:
        visitor_key = secrets.token_urlsafe(32)
        response.set_cookie(
            key=settings.visitor_cookie_name,
            value=visitor_key,
            max_age=60 * 60 * 24 * 365,
            httponly=True,
            secure=False,
            samesite="lax",
        )

    job_service.record_view(db, job, visitor_key)
    db.refresh(job)
    return job_service.serialize_job_detail(job)
