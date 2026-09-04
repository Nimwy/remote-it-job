from app.main import app


def test_openapi_smoke(client):
    # S-06: /openapi.json trả 200 và có securitySchemes
    res = client.get("/openapi.json")
    assert res.status_code == 200
    schema = res.json()
    assert schema["openapi"]
    comp = schema.get("components", {}).get("securitySchemes", {})
    assert any(
        s.get("type") == "apiKey" and s.get("in") == "cookie" for s in comp.values()
    ), "securitySchemes phải khai báo apiKey cookie"


def test_login_required_operations_require_security():
    # Các endpoint yêu cầu đăng nhập (Depends(get_current_user)) phải có security
    schema = app.openapi()
    for path in ["/api/auth/me", "/api/auth/change-password", "/api/hr/jobs", "/api/admin/jobs"]:
        for method, operation in schema["paths"][path].items():
            if not isinstance(operation, dict):
                continue
            assert operation.get("security"), f"{method.upper()} {path} phải yêu cầu security"


def test_public_and_refresh_operations_have_no_security():
    schema = app.openapi()
    for path in ["/api/jobs", "/api/auth/refresh", "/api/categories"]:
        for method, operation in schema["paths"][path].items():
            if not isinstance(operation, dict):
                continue
            assert not operation.get("security"), f"{method.upper()} {path} không cần security"


def test_openapi_security_scheme_registered():
    schema = app.openapi()
    schemes = schema["components"].get("securitySchemes", {})
    assert any("cookie" in s.get("in", "") and s.get("type") == "apiKey" for s in schemes.values())


def test_authenticated_operations_require_security():
    schema = app.openapi()
    protected = {"hr", "admin"}
    for path_item in schema["paths"].values():
        for method, operation in path_item.items():
            if not isinstance(operation, dict):
                continue
            tags = operation.get("tags", [])
            deprecated = operation.get("deprecated", False)
            if tags and tags[0] in protected and not deprecated:
                assert operation.get("security"), f"{method.upper()} {path_item} missing security"
