from pydantic import BaseModel


class PaginationParams(BaseModel):
    page: int = 1
    page_size: int = 20


class PaginatedResponse[T](BaseModel):
    items: list[T]
    page: int
    page_size: int
    total: int
    total_pages: int


class ErrorResponse(BaseModel):
    code: str
    message: str
    request_id: str | None = None


class MessageResponse(BaseModel):
    detail: str
