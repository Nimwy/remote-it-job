from app.models.category import Category
from app.models.tag import Tag
from tests.factories import create_category, create_tag


def test_list_categories_only_active(client, db):
    create_category(db, "Frontend", "frontend")
    create_category(db, "Backend", "backend")
    db.add(Category(name="Hidden", slug="hidden", sort_order=3, is_active=False))
    db.commit()

    res = client.get("/api/categories")
    assert res.status_code == 200
    items = res.json()
    assert len(items) == 2
    assert {"id", "name", "slug", "sort_order", "is_active"} <= set(items[0].keys())
    assert all(c["is_active"] for c in items)


def test_list_tags_only_active(client, db):
    create_tag(db, "React", "react")
    create_tag(db, "Vue", "vue")
    db.add(Tag(name="Hidden", slug="hidden", is_active=False))
    db.commit()

    res = client.get("/api/tags")
    assert res.status_code == 200
    items = res.json()
    assert len(items) == 2
    assert {"id", "name", "slug", "is_active"} <= set(items[0].keys())
    assert all(t["is_active"] for t in items)
