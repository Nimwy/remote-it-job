from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.repositories import category_repository, tag_repository

router = APIRouter(tags=["catalog"])


@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    categories = category_repository.list_active(db)
    return [{"id": c.id, "name": c.name, "slug": c.slug, "sort_order": c.sort_order} for c in categories]


@router.get("/tags")
def list_tags(db: Session = Depends(get_db)):
    tags = tag_repository.list_active(db)
    return [{"id": t.id, "name": t.name, "slug": t.slug} for t in tags]
