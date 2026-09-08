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


def test_security_matches_dependency_graph():
    # R-05: security phải khớp dependency graph thật (không suy theo tag).
    from fastapi.routing import APIRoute

    from app.api.dependencies import get_current_user, require_active_hr, require_admin
    from app.api.routes import admin as admin_router
    from app.api.routes import auth as auth_router
    from app.api.routes import catalog as catalog_router
    from app.api.routes import hr as hr_router
    from app.api.routes import jobs as jobs_router

    auth_deps = (get_current_user, require_active_hr, require_admin)

    def depends_on_auth(dep):
        stack = [dep]
        while stack:
            d = stack.pop()
            if getattr(d, "call", None) in auth_deps:
                return True
            stack.extend(getattr(d, "dependencies", None) or [])
        return False

    schema = app.openapi()
    checked = 0
    routers = [auth_router.router, jobs_router.router, catalog_router.router, hr_router.router, admin_router.router]
    for router in routers:
        for route in router.routes:
            if not isinstance(route, APIRoute):
                continue
            needs = depends_on_auth(route.dependant)
            for method in route.methods or []:
                if method in {"HEAD", "OPTIONS"}:
                    continue
                op = schema["paths"].get(f"/api{route.path}", {}).get(method.lower(), {})
                assert op, f"missing openapi op for {method} {route.path}"
                sec = bool(op.get("security"))
                assert sec == needs, f"{method} {route.path}: security={sec}, dependency={needs}"
                checked += 1
    assert checked > 0
