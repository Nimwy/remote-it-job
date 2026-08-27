from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.models.session import Session as SessionModel


def create(db: Session, session: SessionModel) -> SessionModel:
    db.add(session)
    db.flush()
    return session


def find_by_token_hash(db: Session, token_hash: str) -> SessionModel | None:
    return db.query(SessionModel).filter(SessionModel.token_hash == token_hash).first()


def delete_by_token_hash(db: Session, token_hash: str) -> None:
    db.query(SessionModel).filter(SessionModel.token_hash == token_hash).delete()


def delete_for_user(db: Session, user_id: int) -> None:
    """Xoá toàn bộ session của user (dùng khi login lại để chỉ giữ 1 session)."""
    db.query(SessionModel).filter(SessionModel.user_id == user_id).delete()


def delete_expired(db: Session) -> int:
    """Dọn các session đã hết hạn. Trả số lượng đã xoá."""
    now = datetime.now(UTC)
    deleted = db.query(SessionModel).filter(SessionModel.expires_at <= now).delete()
    return deleted
