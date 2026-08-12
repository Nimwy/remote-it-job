from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.models.category import Category
from app.models.tag import Tag

router = APIRouter(tags=["catalog"])


@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    categories = (
        db.query(Category)
        .filter(Category.is_active.is_(True))
        .order_by(Category.sort_order)
        .all()
    )
    return [{"id": c.id, "name": c.name, "slug": c.slug, "sort_order": c.sort_order} for c in categories]


@router.get("/tags")
def list_tags(db: Session = Depends(get_db)):
    tags = db.query(Tag).filter(Tag.is_active.is_(True)).order_by(Tag.name).all()
    return [{"id": t.id, "name": t.name, "slug": t.slug} for t in tags]
