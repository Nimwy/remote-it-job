# Hướng dẫn đóng góp (CONTRIBUTING) — Remote IT Job

Tài liệu quy định cách làm việc chung: đặt tên nhánh, viết commit, và quy trình review qua PR.

## Quy trình làm việc

1. Mỗi task/nhóm task lấy một **nhánh riêng** từ `main`, đặt tên theo convention bên dưới.
2. Làm việc trên nhánh, commit thường xuyên với message theo convention.
3. Khi hoàn thành, mở **Pull Request** để người hướng dẫn review.
4. PR chỉ merge sau khi: build OK, lint sạch, toàn bộ test pass, và được review đồng ý.
5. Sau khi merge, xoá nhánh và cập nhật `PROJECT_STATE.md` nếu trạng thái thay đổi đáng kể.

## Quy ước đặt tên nhánh

`<loại>/<mô-tả-ngắn-bằng-kebab-case>` (không dấu, chữ thường).

| Loại | Ví dụ |
|------|-------|
| `feat/` | `feat/mobile-nav` |
| `fix/` | `fix/job-edit-data-loss` |
| `docs/` | `docs/api-reference` |
| `test/` | `test/isolate-e2e-db` |
| `refactor/` | `refactor/split-tests-by-layer` |

Ví dụ nhánh đã dùng: `feat/nextjs-migration`, `fix/review-round2`.

## Quy ước commit (Conventional Commits)

```
<type>[phạm vi tùy chọn]: <mô tả> (mã mục nếu có)
```

- **type:** `feat` | `fix` | `docs` | `test` | `chore` | `refactor` | `style` | `perf`.
- Mô tả bắt đầu bằng động từ, không viết hoa chữ đầu, không chấm cuối.
- Ghi thêm mã mục review (vd `(U-01, B-04)`) ở cuối title hoặc trong body để truy vết.

Ví dụ:
```
feat: add mobile navigation and responsive hero (U-01, U-02)
fix: prevent data loss when editing jobs (F-01, F-02)
test: isolate e2e database and add HR/admin flows (T-04)
```

## Checklist trước khi mở PR

- [ ] Build không lỗi:
  - Backend tách container kiểu `docker compose run --rm backend`.
  - Frontend `cd frontend && npm run build`.
- [ ] Lint sạch (0 error): backend Ruff, frontend ESLint.
- [ ] Toàn bộ test pass — xem `TESTING.md` (backend pytest, frontend Vitest, e2e Playwright).
- [ ] Tài liệu liên quan đã cập nhật (`PROJECT_STATE.md`, `API_REFERENCE.md`...).
- [ ] Không commit file bí mật / file tổng hợp (`node_modules`, `test-results/`, `yeucau.md`).

## Ngôn ngữ

- Mã nguồn và tài liệu kỹ thuật ưu tiên tiếng Việt (phù hợp với codebase hiện tại); API/endpoint và identifier giữ tiếng Anh.
