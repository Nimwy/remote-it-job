from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class JobTag(Base):
    __tablename__ = "job_tags"

    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id"), primary_key=True)
    tag_id: Mapped[int] = mapped_column(ForeignKey("tags.id"), primary_key=True)

    job = relationship("Job", back_populates="job_tags")
    tag = relationship("Tag", back_populates="job_tags")
