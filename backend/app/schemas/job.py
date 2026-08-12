from datetime import datetime

from pydantic import BaseModel


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
