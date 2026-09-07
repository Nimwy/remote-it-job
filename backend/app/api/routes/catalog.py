from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.repositories import category_repository, tag_repository
from app.schemas.admin import CategoryResponse, TagResponse
from app.services import admin_service

router = APIRouter(tags=["catalog"])


@router.get(
    "/categories",
    response_model=list[CategoryResponse],
    summary="Danh sách danh mục",
    description="Liệt kê các category đang active (dùng cho bộ lọc và trang danh mục).",
)
def list_categories(db: Session = Depends(get_db)):
    categories = category_repository.list_active(db)
    return [admin_service.serialize_category(c) for c in categories]


@router.get(
    "/tags",
    response_model=list[TagResponse],
    summary="Danh sách thẻ",
    description="Liệt kê các tag đang active (dùng cho bộ lọc và chọn tag khi đăng tin).",
)
def list_tags(db: Session = Depends(get_db)):
    tags = tag_repository.list_active(db)
    return [admin_service.serialize_tag(t) for t in tags]
