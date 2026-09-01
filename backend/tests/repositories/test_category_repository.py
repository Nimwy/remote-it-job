from app.models.category import Category
from app.repositories import category_repository
from tests.factories import create_category


def test_category_repository(db):
    active = create_category(db, "Frontend", "frontend")
    inactive = Category(name="Hidden", slug="hidden", sort_order=2, is_active=False)
    db.add(inactive)
    db.commit()

    assert category_repository.get_by_id(db, active.id).slug == "frontend"
    assert category_repository.get_by_slug(db, "frontend").id == active.id
    assert category_repository.get_active_by_id(db, active.id) is not None
    assert category_repository.get_active_by_id(db, inactive.id) is None
    assert len(category_repository.list_active(db)) == 1
    assert len(category_repository.list_all(db)) == 2
