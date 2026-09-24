from sqlalchemy.exc import OperationalError

from app.api.dependencies import get_db
from app.main import app


def test_health_ok(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_health_returns_503_when_db_unavailable(client):
    class BrokenSession:
        def execute(self, *args, **kwargs):
            raise OperationalError("SELECT 1", {}, Exception("connection refused"))

    app.dependency_overrides[get_db] = lambda: BrokenSession()
    res = client.get("/api/health")
    assert res.status_code == 503
    assert res.json()["error"]["code"] == "health.db_unavailable"
