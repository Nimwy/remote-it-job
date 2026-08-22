import enum
from datetime import datetime

from sqlalchemy import String, Enum, ForeignKey, Text, Integer, DateTime, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class JobType(str, enum.Enum):
    fulltime = "fulltime"
    parttime = "parttime"
    freelance = "freelance"
    contract = "contract"


class JobStatus(str, enum.Enum):
    draft = "draft"
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    closed = "closed"
    hidden = "hidden"
    expired = "expired"


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(primary_key=True)
    hr_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))
    title: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    job_type: Mapped[JobType] = mapped_column(Enum(JobType))
    location: Mapped[str | None] = mapped_column(String(150))
    timezone: Mapped[str | None] = mapped_column(String(50))
    salary_min: Mapped[float | None] = mapped_column(Numeric(12, 2))
    salary_max: Mapped[float | None] = mapped_column(Numeric(12, 2))
    currency: Mapped[str | None] = mapped_column(String(10))
    description: Mapped[str] = mapped_column(Text)
    requirements: Mapped[str] = mapped_column(Text)
    status: Mapped[JobStatus] = mapped_column(Enum(JobStatus), default=JobStatus.draft)
    rejection_reason: Mapped[str | None] = mapped_column(Text)
    views: Mapped[int] = mapped_column(Integer, default=0)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    hr = relationship("User", back_populates="jobs")
    category = relationship("Category", back_populates="jobs")
    job_tags = relationship("JobTag", back_populates="job", cascade="all, delete-orphan")
