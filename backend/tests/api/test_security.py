from app.main import _extract_origin


def test_extract_origin_exact_match():
    assert _extract_origin("http://localhost:3000") == "http://localhost:3000"
    assert _extract_origin("https://remoteit.vn") == "https://remoteit.vn"


def test_extract_origin_strips_referer_path():
    assert _extract_origin("http://localhost:3000/some/path?x=1") == "http://localhost:3000"


def test_extract_origin_strips_userinfo_and_suffix_vectors():
    # R-01: các vector bypass phải bị tách/không khớp
    assert _extract_origin("https://remoteit.vn.evil.com") == "https://remoteit.vn.evil.com"
    assert _extract_origin("http://localhost:30000") == "http://localhost:30000"
    assert _extract_origin("http://localhost:3000@evil.com") == "http://evil.com"
    assert _extract_origin("https://evil.com") == "https://evil.com"


def test_extract_origin_default_port_normalized():
    assert _extract_origin("http://example.com:80") == "http://example.com"
    assert _extract_origin("https://example.com:443") == "https://example.com"


def test_extract_origin_none_for_invalid():
    assert _extract_origin("") is None
    assert _extract_origin("localhost:3000") is None  # thiếu scheme
    assert _extract_origin("not a url") is None
