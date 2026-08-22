import re
import unicodedata


def slugify(text: str) -> str:
    normalized = unicodedata.normalize("NFD", text.strip().lower())
    slug = "".join(c for c in normalized if unicodedata.category(c) != "Mn")
    slug = slug.replace("đ", "d")
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-")


def unique_slug(base: str, existing: set[str]) -> str:
    slug = base
    counter = 2
    while slug in existing:
        slug = f"{base}-{counter}"
        counter += 1
    return slug
