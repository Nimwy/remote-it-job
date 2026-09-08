from sqlalchemy.orm import Session

from app.models.tag import Tag


def get_by_id(db: Session, tag_id: int) -> Tag | None:
    return db.query(Tag).filter(Tag.id == tag_id).first()


def get_by_ids(db: Session, tag_ids: list[int]) -> list[Tag]:
    if not tag_ids:
        return []
    return db.query(Tag).filter(Tag.id.in_(tag_ids)).all()


def get_active_by_ids(db: Session, tag_ids: list[int]) -> list[Tag]:
    if not tag_ids:
        return []
    return db.query(Tag).filter(Tag.id.in_(tag_ids), Tag.is_active.is_(True)).all()


def get_by_slug(db: Session, slug: str) -> Tag | None:
    return db.query(Tag).filter(Tag.slug == slug).first()


def list_active(db: Session) -> list[Tag]:
    return db.query(Tag).filter(Tag.is_active.is_(True)).order_by(Tag.name).all()


def list_all(db: Session) -> list[Tag]:
    return db.query(Tag).order_by(Tag.name).all()


def existing_slugs(db: Session) -> set[str]:
    """R-17: chỉ lấy các slug đang tồn tại (không load cả ORM)."""
    return {slug for (slug,) in db.query(Tag.slug).all()}


def create(db: Session, tag: Tag) -> Tag:
    db.add(tag)
    db.flush()
    return tag
