import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.sessions import SessionMiddleware

from app.api.routes import admin, auth, catalog, hr, jobs
from app.core.config import get_settings
from app.core.exceptions import APIError
from app.core.logging import logger
from app.schemas.common import ErrorResponse

settings = get_settings()

# Mã lỗi dùng chung khai báo cho mọi endpoint (S-03) — máy đọc được từ spec.
ERROR_RESPONSES = {
    status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse, "description": "Chưa đăng nhập / token không hợp lệ"},
    status.HTTP_403_FORBIDDEN: {"model": ErrorResponse, "description": "Không có quyền truy cập"},
    status.HTTP_404_NOT_FOUND: {"model": ErrorResponse, "description": "Không tìm thấy tài nguyên"},
    status.HTTP_409_CONFLICT: {"model": ErrorResponse, "description": "Xung đột dữ liệu"},
    status.HTTP_422_UNPROCESSABLE_ENTITY: {"model": ErrorResponse, "description": "Dữ liệu không hợp lệ"},
    status.HTTP_429_TOO_MANY_REQUESTS: {"model": ErrorResponse, "description": "Vượt giới hạn tốc độ"},
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


openapi_tags = [
    {"name": "auth", "description": "Đăng ký, đăng nhập, phiên và tài khoản."},
    {"name": "jobs", "description": "Tìm kiếm và xem công khai việc làm cùng lượt xem."},
    {"name": "catalog", "description": "Danh mục (category) và thẻ (tag) công khai."},
    {"name": "hr", "description": "Các thao tác dành cho HR: quản lý job, hồ sơ và kênh liên hệ."},
    {"name": "admin", "description": "Quản trị: duyệt tin/HR, quản lý job, danh mục và tag."},
]


app = FastAPI(
    title="Remote IT Job",
    description=(
        "Website tuyển dụng việc làm IT remote cho thị trường Việt Nam. "
        "Tài nguyên xác thực bằng cookie phiên phía server (HTTP-only cookie `session`). "
        "- Xem docs tại `/docs`, đặc tả OpenAPI tại `/openapi.json`.\n"
        "Để thử các endpoint cần đăng nhập (HR/Admin), đăng nhập trước qua `/api/auth/login` "
        "trong cùng phiên (browser/cookie) — thao tác `Try it out` sẽ gửi kèm cookie."
    ),
    version="0.1.0",
    openapi_tags=openapi_tags,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cần cho Google OAuth state; dùng SECRET_KEY (B-12)
app.add_middleware(SessionMiddleware, secret_key=settings.secret_key)

_default_openapi = app.openapi


def custom_openapi():
    """Mở rộng Schema OpenAPI: khai báo cách xác thực bằng cookie phiên.

    Auth thực tế dùng HTTP-only cookie `session` (xem app/api/dependencies.py),
    nên ta mô tả một security scheme kiểu apiKey (in cookie) và đánh dấu các
    nhóm cần đăng nhập (hr, admin) để Swagger thể hiện rõ quyền truy cập.
    """
    if app.openapi_schema:
        return app.openapi_schema

    schema = _default_openapi()
    schema.setdefault("components", {})
    schema["components"].setdefault("securitySchemes", {})
    schema["components"]["securitySchemes"]["SessionAuth"] = {
        "type": "apiKey",
        "in": "cookie",
        "name": settings.access_cookie_name,
        "description": (
            "Access token (JWT) dạng cookie HTTP-only. Đăng nhập qua /api/auth/login hoặc "
            "/api/auth/refresh trong cùng phiên để mở quyền."
        ),
    }

    for path_item in schema.get("paths", {}).values():
        for operation in path_item.values():
            tags = operation.get("tags", [])
            if any(tag in {"hr", "admin"} for tag in tags):
                operation["security"] = [{"SessionAuth": []}]

    app.openapi_schema = schema
    return schema


app.openapi = custom_openapi


@app.exception_handler(APIError)
async def api_error_handler(request: Request, exc: APIError):
    logger.warning("API error %s %s -> %s", request.method, request.url.path, exc.code)
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message}},
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    detail = exc.detail
    if isinstance(detail, dict) and "code" in detail:
        code, message = detail["code"], detail.get("message", "")
    else:
        # 404/405 (Starlette), ... — dùng message gốc, code theo status
        code, message = f"http_{exc.status_code}", str(detail)
    logger.warning("HTTP error %s %s -> %s", request.method, request.url.path, code)
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": code, "message": message}},
    )


@app.exception_handler(RequestValidationError)
async def request_validation_handler(request: Request, exc: RequestValidationError):
    """Đồng bộ lỗi 422 về dạng {error:{code,message}} (S-02)."""
    errors = exc.errors()
    first = errors[0] if errors else {}
    field = ".".join(str(x) for x in first.get("loc", []) if x not in ("body", "query", "path"))
    message = f"Dữ liệu không hợp lệ{f' cho trường {field}' if field else ''}"
    logger.warning("Validation error %s %s -> %s", request.method, request.url.path, message)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": {"code": "validation_error", "message": message}},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", uuid.uuid4().hex[:12])
    logger.exception("Unhandled error %s %s request_id=%s", request.method, request.url.path, request_id)
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "internal_error",
                "message": "Internal server error",
                "request_id": request_id,
            }
        },
    )


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if settings.cookie_secure:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    request_id = uuid.uuid4().hex[:12]
    request.state.request_id = request_id
    start = time.perf_counter()

    response = await call_next(request)

    elapsed_ms = int((time.perf_counter() - start) * 1000)
    # Ghi user_id nếu có (đặt bởi auth dependency); an toàn khi chưa có
    user_id = getattr(request.state, "user_id", None)
    logger.info(
        "%s %s -> %s %dms request_id=%s%s",
        request.method,
        request.url.path,
        response.status_code,
        elapsed_ms,
        request_id,
        f" user={user_id}" if user_id else "",
    )
    return response


app.include_router(auth.router, prefix="/api", responses=ERROR_RESPONSES)
app.include_router(jobs.router, prefix="/api", responses=ERROR_RESPONSES)
app.include_router(catalog.router, prefix="/api", responses=ERROR_RESPONSES)
app.include_router(hr.router, prefix="/api", responses=ERROR_RESPONSES)
app.include_router(admin.router, prefix="/api", responses=ERROR_RESPONSES)
