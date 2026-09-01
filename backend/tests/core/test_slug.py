from app.core.slug import slugify, unique_slug


def test_slugify_lowercases_and_hyphenates():
    assert slugify("React Developer") == "react-developer"
    assert slugify("  Leading and trailing  ") == "leading-and-trailing"


def test_slugify_strips_diacritics():
    assert slugify("Kỹ sư phần mềm") == "ky-su-phan-mem"
    assert slugify("Đà Nẵng") == "da-nang"


def test_slugify_removes_symbols():
    assert slugify("Senior/C++ Engineer!") == "senior-c-engineer"


def test_slugify_empty():
    assert slugify("!!!") == ""
    assert slugify("") == ""


def test_unique_slug_appends_counter():
    assert unique_slug("react-developer", {"react-developer"}) == "react-developer-2"
    assert unique_slug("react-developer", {"react-developer", "react-developer-2"}) == "react-developer-3"
    assert unique_slug("react-developer", set()) == "react-developer"
