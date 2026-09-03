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


def paginated(items: list, page: int, page_size: int, total: int, total_pages: int) -> PaginatedResponse:
    """Dựng response phân trang chuẩn (A-05)."""
    return PaginatedResponse(
        items=items,
        page=page,
        page_size=page_size,
        total=total,
        total_pages=total_pages,
    )
