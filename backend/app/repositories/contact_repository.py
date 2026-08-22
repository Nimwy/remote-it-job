from sqlalchemy.orm import Session

from app.models.contact import UserContact


def delete_for_user(db: Session, user_id: int) -> None:
    db.query(UserContact).filter(UserContact.user_id == user_id).delete()


def create(db: Session, contact: UserContact) -> UserContact:
    db.add(contact)
    return contact
