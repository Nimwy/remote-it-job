from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    company_name: str

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "name": "Nguyễn Văn A",
                    "email": "hr@example.com",
                    "password": "your-password",
                    "company_name": "Công ty ABC",
                }
            ]
        }
    )


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [{"email": "hr@example.com", "password": "your-password"}]
        }
    )


class UserResponse(BaseModel):
    id: int
    role: str
    name: str
    email: str
    company_name: str | None
    avatar: str | None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UserProfileUpdate(BaseModel):
    name: str | None = None
    company_name: str | None = None
    avatar: str | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [{"current_password": "old-password", "new_password": "new-password"}]
        }
    )
