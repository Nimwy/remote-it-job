from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    company_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [{"email": "demo.hr@remoteit.vn", "password": "demo123"}]
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
