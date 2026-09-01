# Q-01 — Cấu trúc URL của category (đề xuất gửi mentor)

> Mục **Q-01** trong `yeucau.md`: "Cấu trúc URL của category — hiện `/category/{slug}`, gợi ý `/it-jobs-remote/{slug}` (từ khoá SEO thay vì 'category'). Kỹ thuật đã bỏ query string như yêu cầu, nhưng về SEO chưa đạt ý."

## 1. Hiện trạng (đã xác nhận trong code)

- **Frontend route:** `frontend/src/app/[locale]/(main)/category/[slug]/page.tsx` — render danh sách job của một category; dữ liệu lấy từ `GET /api/jobs?category={slug}` (filter theo `Category.slug`) + `GET /api/categories`.
- **Điểm gắn link tới category (frontend):**
  - `src/app/[locale]/(main)/page.tsx:61` — chips danh mục trên trang chủ (`/category/${c.slug}`).
  - `src/app/[locale]/(main)/jobs/[slugId]/page.tsx:94` — breadcrumb ở trang chi tiết job (`/category/${job.category.slug}`).
- **Backend:** KHÔNG có route riêng cho trang category (đây là route frontend). `slug` chỉ dùng làm value filter của `GET /api/jobs?category=`, nên **backend không cần đổi**.
- **Test ảnh hưởng nếu đổi:** `frontend/e2e/public.spec.ts` có `page.goto("/category/frontend")`.
- **Tài liệu ảnh hưởng:** `SCREENS.md` (mục S4) mô tả `/category/{slug}`; `PROJECT_MAP.md`/`DIAGRAMS.md` có nhắc URL.

## 2. Phân tích ngắn

- `category` là từ chung chung, gần như 0 giá trị SEO; segment chứa từ khoá ("remote jobs") giúp trang category bắt từ khoá chính của thị trường mục tiêu.
- `slug` sau nó (vd `frontend`, `devops-sysadmin`) là phần mô tả chuyên môn — đã ổn.
- Rủi ro chính: **thay đổi URL làm chết các link/index cũ**, nên cần redirect 301 từ `/category/*` sang URL mới (hoặc giữ song song một thời gian).

## 3. Các phương án

| Phương án | URL | Ưu điểm | Nhược điểm |
|---|---|---|---|
| **A. Giữ nguyên** | `/category/{slug}` | Không phải đổi gì, ít rủi ro | "category" ít từ khoá, không đạt ý SEO |
| **B. `/it-jobs-remote/{slug}`** (gợi ý) | `/it-jobs-remote/frontend` | Đúng gợi ý mentor, chứa "it jobs remote" | Dài (3 từ), hơi lặp nghĩa với slug mô tả chuyên môn |
| **C. `/remote-jobs/{slug}`** | `/remote-jobs/frontend` | Ngắn, chứa từ khoá chính "remote jobs" | Không có chữ "it" (vẫn rõ nhờ ngữ cảnh + tag) |

## 4. Đề xuất của em

- **Đổi sang URL có từ khoá** (phương án **C** — `/remote-jobs/{slug}` — ngắn gọn, ôm đúng từ khoá chính; hoặc **B** đúng gợi ý mentor nếu muốn thêm "it").
- **Giữ slug mô tả** (`frontend`, `backend`, `devops-sysadmin`, ...) làm segment cuối — không đổi dữ liệu cũ, không phải re-design category.
- **Thêm redirect 301** `/category/{slug}` → URL mới để giữ thứ hạng/keyword cũ, đồng thời cập nhật các link nội bộ (trang chủ + breadcrumb) sang URL mới.
- Phạm vi thay đổi khá nhỏ: đổi/rename route frontend + 2 điểm gắn link + cập nhật 1 e2e test + vài dòng tài liệu. **Backend không đổi.**

## 5. Câu hỏi gửi mentor

1. Đồng ý đổi URL taxonomy không, và chọn **B (`/it-jobs-remote/`)** hay **C (`/remote-jobs/`)**?
2. Có cần giữ `/category/{slug}` để redirect 301 trong thời gian chuyển tiếp, hay gỡ hẳn?
3. Slug giữ nguyên dạng hiện tại (`frontend`, `devops-sysadmin`, ...) chứ?
