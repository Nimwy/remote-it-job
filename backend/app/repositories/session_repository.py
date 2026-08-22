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
