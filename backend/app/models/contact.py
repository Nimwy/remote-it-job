import enum
from datetime import datetime

from sqlalchemy import String, Enum, ForeignKey, DateTime, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class ContactChannel(str, enum.Enum):
    zalo = "zalo"
    telegram = "telegram"
    linkedin = "linkedin"
    phone = "phone"
    email = "email"


class UserContact(Base):
    __tablename__ = "user_contacts"
    __table_args__ = (UniqueConstraint("user_id", "channel"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    channel: Mapped[ContactChannel] = mapped_column(Enum(ContactChannel))
    value: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="contacts")
