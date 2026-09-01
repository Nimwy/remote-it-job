

class APIError(Exception):
    """Lỗi nghiệp vụ có mã lỗi để frontend map sang ngôn ngữ."""

    def __init__(self, status_code: int, code: str, message: str = ""):
        self.status_code = status_code
        self.code = code
        self.message = message or code
        super().__init__(code)


def error(status_code: int, code: str, message: str = "") -> APIError:
    return APIError(status_code, code, message)
