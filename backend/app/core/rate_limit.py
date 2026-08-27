import threading
import time
from collections import defaultdict

from fastapi import Request

from app.core.config import get_settings
from app.core.exceptions import APIError


class RateLimiter:
    """Rate limiter đơn giản (fixed-window, in-memory) cho MVP — không cần Redis."""

    def __init__(self, limit: int, window_seconds: int):
        self.limit = limit
        self.window = window_seconds
        self.hits: dict[str, list[float]] = defaultdict(list)
        self.lock = threading.Lock()

    def check(self, key: str) -> None:
        now = time.time()
        with self.lock:
            timestamps = [t for t in self.hits.get(key, []) if t > now - self.window]
            if len(timestamps) >= self.limit:
                self.hits[key] = timestamps
                raise APIError(429, "rate_limit_exceeded", "Quá nhiều yêu cầu, vui lòng thử lại sau")
            timestamps.append(now)
            self.hits[key] = timestamps


def rate_limit_dependency(limiter: RateLimiter):
    """Trả về một FastAPI dependency dùng cho endpoint nhạy cảm."""

    def dependency(request: Request):
        if not get_settings().rate_limit_enabled:
            return
        key = request.client.host if request.client else "unknown"
        limiter.check(key)

    return dependency
