# API Specification — Remote IT Job

> **Nguồn sự thật duy nhất cho từng endpoint là [`API_REFERENCE.md`](./API_REFERENCE.md).**
> File này chỉ giữ phần quy ước chung (xác thực, phân trang, định dạng lỗi, quy tắc authorization) để tránh tài liệu song song bị lệch nhau.
> Muốn xem endpoint + param + response + mã lỗi cụ thể: mở `API_REFERENCE.md` hoặc tự sinh từ code tại `GET /api/openapi.json` (Swagger `/docs`).

## Quy ước chung

### Base path

```text
/api
```

### Định dạng

- REST
- JSON (UTF-8)
- Đối chiếu schema theo code: `GET /api/openapi.json` (FastAPI tự sinh)

### Xác thực & authorization

- Xác thực bằng session phía server, lưu trong cookie **HTTP-only** (`session`).
- Các nhóm rule:
  - **Public** (job seeker, không cần session): `GET /api/jobs`, `GET /api/jobs/{id}`, `GET /api/categories`, `GET /api/tags`, `POST /api/auth/register`, `POST /api/auth/login`, OAuth callbacks.
  - **HR**: mọi route `/api/hr/*` → cần đăng nhập với `role=hr` **và** `status=active`.
  - **Admin**: mọi route `/api/admin/*` → cần đăng nhập với `role=admin`.
  - HR chưa được admin duyệt hoặc bị block sẽ nhận `403`.
- Chi tiết từng endpoint (kể cả quyền): xem `API_REFERENCE.md` mục tương ứng.

### Định dạng lỗi

Mọi lỗi trả về cùng dạng:

```json
{
  "error": {
    "code": "email_exists",
    "message": "Email đã được đăng ký",
    "request_id": "a1b2c3d4e5f6" // chỉ có với lỗi chưa xử lý (500)
  }
}
```

- `code`: mã ổn định — xem bảng mã lỗi trong `API_REFERENCE.md` mục 1.1.
- `message`: fallback khi frontend không có bản dịch cho `code`.

### Phân trang

Query chung: `?page=1&page_size=20`. Response dạng **phẳng**:

```json
{
  "items": [],
  "page": 1,
  "page_size": 20,
  "total": 24,
  "total_pages": 2
}
```

- `page` mặc định `1` (`>= 1`), `page_size` mặc định `20` (`1–100`).
