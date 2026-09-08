from sqlalchemy.orm import Session

from app.models.category import Category


def get_by_id(db: Session, category_id: int) -> Category | None:
    return db.query(Category).filter(Category.id == category_id).first()


def get_active_by_id(db: Session, category_id: int) -> Category | None:
    return db.query(Category).filter(Category.id == category_id, Category.is_active.is_(True)).first()


def get_by_slug(db: Session, slug: str) -> Category | None:
    return db.query(Category).filter(Category.slug == slug).first()


def list_active(db: Session) -> list[Category]:
    return db.query(Category).filter(Category.is_active.is_(True)).order_by(Category.sort_order).all()


def list_all(db: Session) -> list[Category]:
    return db.query(Category).order_by(Category.sort_order).all()


def existing_slugs(db: Session) -> set[str]:
    """R-17: chỉ lấy các slug đang tồn tại (không load cả ORM)."""
    return {slug for (slug,) in db.query(Category.slug).all()}


def create(db: Session, category: Category) -> Category:
    db.add(category)
    db.flush()
    return category
