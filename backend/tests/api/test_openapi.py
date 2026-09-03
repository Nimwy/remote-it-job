from app.main import app


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
