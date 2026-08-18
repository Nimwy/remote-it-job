from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

JobTypeStr = Literal["fulltime", "parttime", "freelance", "contract"]


class CategoryInfo(BaseModel):
    id: int
    name: str
    slug: str

    model_config = {"from_attributes": True}


class ContactInfo(BaseModel):
    channel: str
    value: str

    model_config = {"from_attributes": True}


class JobListItem(BaseModel):
    id: int
    title: str
    company_name: str
    category: CategoryInfo
    job_type: str
    location: str | None
    timezone: str | None
    salary_min: float | None
    salary_max: float | None
    currency: str | None
    tags: list[str]
    created_at: datetime


class JobDetailResponse(JobListItem):
    description: str
    requirements: str
    views: int
    expires_at: datetime | None
    contacts: list[ContactInfo]


class JobCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    category_id: int
    job_type: JobTypeStr
    location: str | None = None
    timezone: str | None = None
    salary_min: float | None = None
    salary_max: float | None = None
    currency: str | None = None
    description: str = Field(min_length=1)
    requirements: str = Field(min_length=1)
    expires_at: datetime | None = None
    tag_ids: list[int] = []


class JobUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    category_id: int | None = None
    job_type: JobTypeStr | None = None
    location: str | None = None
    timezone: str | None = None
    salary_min: float | None = None
    salary_max: float | None = None
    currency: str | None = None
    description: str | None = None
    requirements: str | None = None
    expires_at: datetime | None = None
    tag_ids: list[int] | None = None


class HrJobResponse(BaseModel):
    id: int
    title: str
    category: CategoryInfo
    job_type: str
    location: str | None
    timezone: str | None
    salary_min: float | None
    salary_max: float | None
    currency: str | None
    description: str
    requirements: str
    status: str
    rejection_reason: str | None
    views: int
    expires_at: datetime | None
    tags: list[str]
    created_at: datetime
    updated_at: datetime
