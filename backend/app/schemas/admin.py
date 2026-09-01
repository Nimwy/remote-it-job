from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.job import CategoryInfo


class RejectRequest(BaseModel):
    reason: str = Field(min_length=1)


class AdminJobResponse(BaseModel):
    id: int
    title: str
    slug: str
    company_name: str
    hr_id: int
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


class AdminUserResponse(BaseModel):
    id: int
    name: str
    email: str
    company_name: str | None
    status: str
    created_at: datetime
    job_count: int


class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    sort_order: int
    is_active: bool


class TagResponse(BaseModel):
    id: int
    name: str
    slug: str
    is_active: bool


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    slug: str | None = Field(default=None, max_length=120)
    sort_order: int = 0


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    slug: str | None = Field(default=None, max_length=120)
    sort_order: int | None = None


class TagCreate(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    slug: str | None = Field(default=None, max_length=60)


class TagUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=50)
    slug: str | None = Field(default=None, max_length=60)
