from app.core.security import generate_session_token, hash_password, verify_password


def test_hash_and_verify_password():
    hashed = hash_password("secret123")
    assert hashed != "secret123"
    assert verify_password("secret123", hashed) is True
    assert verify_password("wrong", hashed) is False


def test_hash_password_salted():
    assert hash_password("secret123") != hash_password("secret123")


def test_generate_session_token_unique_and_hashed():
    raw1, hash1 = generate_session_token()
    raw2, hash2 = generate_session_token()
    assert raw1 != raw2
    assert hash1 == hash1
    assert len(hash1) == 64
    assert raw1 != hash1
