from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.job import ContactInfo

ContactChannelStr = Literal["zalo", "telegram", "linkedin", "phone", "email"]


class ContactInput(BaseModel):
    channel: ContactChannelStr
    value: str = Field(min_length=1, max_length=255)


class HrProfileUpdate(BaseModel):
    name: str | None = None
    company_name: str | None = None
    avatar: str | None = None
    contacts: list[ContactInput] | None = None

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "name": "Nguyễn Văn A",
                    "company_name": "Công ty ABC",
                    "contacts": [
                        {"channel": "email", "value": "hr@example.com"},
                        {"channel": "telegram", "value": "@abc_hr"},
                    ],
                }
            ]
        }
    )


class HrProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    company_name: str | None
    avatar: str | None
    status: str
    contacts: list[ContactInfo]


class HrStatsResponse(BaseModel):
    total: int
    open: int
    pending: int
    closed: int
    rejected: int
    draft: int
    expired: int
    hidden: int
