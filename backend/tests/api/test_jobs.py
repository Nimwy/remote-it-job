from tests.factories import setup_seed


def test_list_jobs_returns_only_public(client, db):
    setup_seed(db)
    res = client.get("/api/jobs")
    assert res.status_code == 200
    data = res.json()
    titles = [item["title"] for item in data["items"]]
    assert "React Developer" in titles
    assert "Expired Job" not in titles
    assert "Pending Job" not in titles
    assert "Blocked HR Job" not in titles
    assert data["total"] == 1


def test_list_jobs_search_q(client, db):
    setup_seed(db)
    res = client.get("/api/jobs", params={"q": "React"})
    assert res.status_code == 200
    assert res.json()["total"] == 1


def test_list_jobs_filter_category(client, db):
    setup_seed(db)
    res = client.get("/api/jobs", params={"category": "frontend"})
    assert res.json()["total"] == 1

    res_none = client.get("/api/jobs", params={"category": "backend"})
    assert res_none.json()["total"] == 0


def test_list_jobs_filter_tags(client, db):
    setup_seed(db)
    res = client.get("/api/jobs", params={"tags": "react"})
    assert res.json()["total"] == 1


def test_list_jobs_filter_salary(client, db):
    setup_seed(db)
    res = client.get("/api/jobs", params={"salary_min": 1500})
    assert res.json()["total"] == 1

    res_none = client.get("/api/jobs", params={"salary_min": 3000})
    assert res_none.json()["total"] == 0


def test_list_jobs_pagination(client, db):
    setup_seed(db)
    res = client.get("/api/jobs", params={"page": 1, "page_size": 1})
    data = res.json()
    assert data["page"] == 1
    assert data["page_size"] == 1
    assert data["total"] == 1
    assert data["total_pages"] == 1


def test_job_detail_with_contacts(client, db):
    seed = setup_seed(db)
    job_id = seed["approved_job"].id
    res = client.get(f"/api/jobs/{job_id}")
    assert res.status_code == 200
    data = res.json()
    assert data["title"] == "React Developer"
    assert data["contacts"][0]["channel"] == "email"
    assert data["contacts"][0]["value"] == "hr@example.com"
    assert data["views"] == 1


def test_job_detail_not_found_for_pending(client, db):
    seed = setup_seed(db)
    job_id = seed["pending_job"].id
    res = client.get(f"/api/jobs/{job_id}")
    assert res.status_code == 404


def test_view_count_dedup_same_visitor(client, db):
    seed = setup_seed(db)
    job_id = seed["approved_job"].id

    first = client.get(f"/api/jobs/{job_id}")
    assert first.json()["views"] == 1
    cookies = client.cookies.get("visitor_id")

    second = client.get(f"/api/jobs/{job_id}")
    assert second.json()["views"] == 1
    assert client.cookies.get("visitor_id") == cookies


def test_view_count_increments_different_visitor(client, db):
    seed = setup_seed(db)
    job_id = seed["approved_job"].id

    first = client.get(f"/api/jobs/{job_id}")
    assert first.json()["views"] == 1

    client.cookies.clear()
    second = client.get(f"/api/jobs/{job_id}")
    assert second.json()["views"] == 2


def test_catalog_categories(client, db):
    setup_seed(db)
    res = client.get("/api/categories")
    assert res.status_code == 200
    slugs = [c["slug"] for c in res.json()]
    assert "frontend" in slugs


def test_catalog_tags(client, db):
    setup_seed(db)
    res = client.get("/api/tags")
    assert res.status_code == 200
    slugs = [t["slug"] for t in res.json()]
    assert "react" in slugs
