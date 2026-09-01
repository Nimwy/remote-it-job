from datetime import UTC, datetime, timedelta

from app.models.session import Session as SessionModel
from app.repositories import session_repository
from tests.factories import create_user


def test_session_repository(db):
    user = create_user(db, "hr@example.com")
    db.commit()

    session = SessionModel(user_id=user.id, token_hash="hash123", expires_at=datetime.now(UTC) + timedelta(days=1))
    session_repository.create(db, session)
    db.commit()

    assert session_repository.find_by_token_hash(db, "hash123") is not None
    assert session_repository.find_by_token_hash(db, "nope") is None

    session_repository.delete_by_token_hash(db, "hash123")
    db.commit()
    assert session_repository.find_by_token_hash(db, "hash123") is None
