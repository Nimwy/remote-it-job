# Hướng dẫn kiểm thử (TESTING) — Remote IT Job

Tài liệu mô tả các tầng test, cách dựng database test, quy ước đặt tên file và mục tiêu coverage. **Nguồn sự thật là các lệnh chạy test**, không phải con số ghi trong tài liệu.

## Tổng quan các tầng

| Tầng | Công cụ | Vị trí | Vai trò |
|------|---------|--------|---------|
| Unit (core) | pytest | `backend/tests/core/` | Logic thuần, **không** cần DB (security, slug). |
| Repository | pytest | `backend/tests/repositories/` | Truy vấn DB, một file cho mỗi repository. |
| Service | pytest | `backend/tests/services/` | Nghiệp vụ, không qua HTTP. |
| API | pytest + TestClient | `backend/tests/api/` | Endpoint thật, kiểm tra status/response/error. |
| Flow | pytest | `backend/tests/flows/` | Kịch bản xuyên suốt (vd moderation). |
| Component/Hook | Vitest + jsdom | `frontend/src/**/*.test.tsx` | UI component, hook tách biệt. |
| Lib/Unit | Vitest | `frontend/src/**/*.test.ts` | Hàm thuần (date, url...). |
| E2E | Playwright | `frontend/e2e/*.spec.ts` | Trải nghiệm người dùng qua browser thật. |

Nguyên tắc: **mỗi tầng test đúng phạm vi của nó** — core/repository/service không đi qua HTTP; API test qua TestClient; e2e mới dùng browser. Tránh gộp nhiều tầng vào một file.

## Backend test (pytest)

### Dựng database test
- DB test là một PostgreSQL riêng (mặc định `remoteit_test`), **không** dùng DB dev `remoteit`.
- URL test đọc từ biến môi trường `TEST_DATABASE_URL` (nếu bỏ trống sẽ dùng giá trị mặc định trong `tests/conftest.py` — không hardcode địa chỉ khi chạy local).
- Schema được `create_all` một lần ở đầu session (`_schema` fixture), mỗi test được bọc trong một transaction **rollback** (`db` fixture) để nhanh và sạch.
- Rate limit bị tắt trong môi trường test (`RATE_LIMIT_ENABLED=false` đặt trong `conftest.py`).

### Chạy test

```bash
# Chạy toàn bộ + coverage
docker compose run --rm backend pytest

# Chạy nhanh, bỏ coverage
docker compose run --rm backend pytest -q --no-cov

# Chỉ chạy một tầng / một file
docker compose run --rm backend pytest tests/repositories -q
docker compose run --rm backend pytest tests/api/test_jobs.py -q

# Lint
docker compose run --rm backend ruff check .
```

### Quy ước đặt tên file
- Dao động theo tầng: `tests/<tang>/test_<doi_tuong>.py` hoặc `test_<module>_<nghiep_vu>.py`.
- Hàm test: `test_<hành_vi>`.
- Fixture chung đặt trong `tests/conftest.py`; data builder đặt trong `tests/factories.py`.

### Mục tiêu coverage
- Mục tiêu hiện tại **≥ 80%** (`--cov=app --cov-report=term-missing`).
- Ưu tiên coverage cho `app/core`, `app/services`, `app/repositories`; nếu coverage tụt, bổ sung test cho tầng tương ứng.

## Frontend test (Vitest)

- Chạy: `cd frontend && npm test`.
- File test nằm cạnh module: `src/lib/date.test.ts`, `src/components/CompanyLogo.test.tsx`, `src/hooks/useAdmin.test.tsx`.
- Test component/hook cần môi trường `jsdom` (đánh dấu `// @vitest-environment jsdom` đầu file); test hàm thuần dùng `node` (mặc định).
- Mock phụ thuộc bên ngoài bằng `vi.mock` + `vi.hoisted`; với TanStack Query bọc `QueryClientProvider`.

## E2E test (Playwright)

- Chạy: `cd frontend && npm run test:e2e` (cần `LD_LIBRARY_PATH` tới thư mục chứa thư viện hệ thống của Chromium nếu môi trường thiếu).
- **Môi trường cô lập:** e2e dùng backend riêng (`backend-e2e`, port **8001**) trỏ tới database riêng `remoteit_e2e`. Lệnh khởi động tự tạo DB, chạy schema và seed dữ liệu demo (admin, HR, jobs, và một job pending cho test admin).
- `playwright.config.ts` chạy song song 2 webServer: backend-e2e + frontend dev (port **3100**) trỏ `BACKEND_URL=:8001`.
- `e2e/global-setup.ts` reseed lại DB trước mỗi lần chạy để kết quả tái lập.
- Test file đặt trong `frontend/e2e/*.spec.ts` (public, auth, hr, admin).

### Lưu ý khi thêm cấu hình e2e
- Không để e2e chạy nhầm vào DB dev `remoteit` hoặc backend `:8000`.
- Dữ liệu test cho admin/hệ thống nên thêm vào `backend/scripts/e2e_prepare.py` (idempotent).

## Củng cố khi tái cấu trúc
- Khi tách/gộp file test, giữ cấu trúc theo tầng để không quay lại tình trạng gộp một file chứa nhiều tầng.
- Chạy `docker compose run --rm backend pytest -q` và `cd frontend && npm test` cùng `npm run test:e2e` để chắc chắn không hồi quy.
