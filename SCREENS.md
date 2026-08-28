# Tài liệu màn hình (SCREENS) — Remote IT Job

Tài liệu này mô tả **16 màn hình** đang có trong code, bao gồm wireframe ASCII, các thành phần chính, trạng thái rỗng, trạng thái lỗi và phương án hiển thị trên mobile (xử lý U-01).

Chú thích trạng thái dùng chung:
- **Rỗng** — dữ liệu ban đầu chưa có.
- **Lỗi** — request fail / dữ liệu không tìm thấy.
- **Mobile** — < 768px; dùng hamburger menu (U-01), card xếp dọc, bảng một cột.

---

## Nhóm Public

### S1. Trang chủ — `/`

```text
+------------------------------------------------------------+
| Logo      | Tìm việc làm   Liên hệ   [VI|EN]   ☰(mobile)   |
+------------------------------------------------------------+
|  Hero: "Remote IT — tìm việc làm dễ dàng"                    |
|  [ Tìm kiếm công việc...                             🔍 ]     |
+------------------------------------------------------------+
| Việc làm nổi bật                                   [Xem tất cả]|
| [Card] [Card] [Card] [Card]                                 |
| ─────────────────────────────────────────                      |
| Chuyên mục (Frontend | Backend | Data/AI ...) ▼              |
+------------------------------------------------------------+
```

- **Thành phần chính:** NavBar, Hero + thanh tìm kiếm, danh sách job nổi bật (4 card), danh mục nhanh.
- **Rỗng:** không có job nổi bật → hiển thị ô "Chưa có tin tuyển dụng nổi bật" + nút sang `/jobs`.
- **Lỗi:** API public fail → toast/lỗi "Không tải được dữ liệu" + nút thử lại.
- **Mobile:** NavBar rút gọn thành logo + hamburger; hero tìm kiếm full-width; card xếp 1 cột.

### S2. Danh sách việc làm — `/jobs`

```text
+------------------------------------------------------------+
| [ Bộ lọc ▼ ] [Sắp xếp▾] Số kết quả: n                        |
+------------------------------------------------------------+
| Category: [All|Frontend|...]  Job type: [All|Full-time|...] |
| Tags: [React][Vue][...]   Salary: -    Location: [-]        |
+------------------------------------------------------------+
| [Card việc làm]                                               |
| [Card việc làm]                                               |
| [Card việc làm]                                               |
|                        ‹ 1 | 2 | 3 ›                         |
+------------------------------------------------------------+
```

- **Thành phần chính:** bộ lọc (category, job_type, tags, salary range, location, timezone), danh sách `JobCard`, phân trang.
- **Rỗng:** không có match → "Không tìm thấy việc làm nào phù hợp" + nút reset bộ lọc.
- **Lỗi:** không tải được → thông báo lỗi + thử lại.
- **Mobile:** bộ lọc rút thành nút mở panel modal; card xếp 1 cột.

### S3. Chi tiết việc làm — `/jobs/{slug}-{id}`

```text
+------------------------------------------------------------+
| Breadcrumb: Trang chủ / Frontend / Job Title                |
+------------------------------------------------------------+
| [Logo]  Job Title                Remote | Full-time | USD   |
|         Company | Việt Nam | Lương 2.000-3.500$              |
+------------------------------------------------------------+
| Mô tả công việc                      | Liên hệ ứng tuyển      |
| - Công việc ...                       |  Bar: "Liên hệ HR"     |
|                                       | [Địa chỉ liên hệ...]   |
| Yêu cầu                               +------------------------+
| - Yêu cầu ...                         | Tags: [React][Node]    |
+------------------------------------------------------------+
| Việc làm tương tự: [Card] [Card] [Card]                     |
+------------------------------------------------------------+
```

- **Thành phần chính:** breadcrumb, header job (logo, title, badge remote/loại/lương), mô tả, yêu cầu, kênh liên hệ (điện thoại/email/telegram), tags, việc làm tương tự.
- **Rỗng:** không có kênh liên hệ → "Liên hệ qua hồ sơ của HR" (ẩn section liên hệ nếu không có).
- **Lỗi (404):** job không tồn tại / không public (pending, hidden, blocked owner) → hiển thị trang "Việc làm không tồn tại hoặc đã ẩn" kèm nút về trang chủ.
- **Mobile:** cột phải (liên hệ, tags) dồn xuống dưới; breadcrumb rút gọn; card tương tự xếp 1 cột.

### S4. Theo danh mục — `/category/{slug}`

```text
+------------------------------------------------------------+
| Breadcrumb: Trang chủ / Frontend                            |
+------------------------------------------------------------+
| [H1] Frontend                         (n việc làm)          |
| [Card] [Card] [Card] ...                                   |
+------------------------------------------------------------+
```

- **Thành phần chính:** breadcrumb, tiêu đề danh mục, số lượng job, danh sách `JobCard`.
- **Rỗng:** "Chưa có tin tuyển dụng trong chuyên mục này" + nút xem toàn bộ.
- **Lỗi (404):** `{slug}` không tồn tại → trang "Chuyên mục không tồn tại" + nút về trang chủ.
- **Mobile:** tiêu đề + danh sách 1 cột.

### S5. Theo tag — `/tag/{slug}`

```text
+------------------------------------------------------------+
| Breadcrumb: Trang chủ / #React                              |
+------------------------------------------------------------+
| [H1] #React  (n việc làm)                                   |
| [Card] [Card] [Card] ...                                   |
+------------------------------------------------------------+
```

- **Thành phần chính:** breadcrumb, tiêu đề tag, số lượng, danh sách `JobCard`.
- **Rỗng:** "Chưa có tin tuyển dụng nào gắn tag này" + nút xem toàn bộ.
- **Lỗi (404):** tag không tồn tại / bị ẩn → "Tag không tồn tại" + nút về trang chủ.
- **Mobile:** 1 cột.

---

## Nhóm Auth

### S6. Đăng nhập — `/login`

```text
+------------------------------------------------------------+
| [Logo]                                                      |
|   Đăng nhập Remote IT                                       |
|   Email:     [________________]                             |
|   Mật khẩu:  [_________]                                    |
|   [ Đăng nhập ]                       [Đăng ký]             |
|   ---------------------------------------------------       |
|   [ Đăng nhập bằng Google ]                                |
+------------------------------------------------------------+
```

- **Thành phần chính:** form email/password, nút đăng nhập, link đăng ký, nút Google (nếu đã cấu hình OAuth).
- **Lỗi:** sai email/mật khẩu → thông báo "Email hoặc mật khẩu không đúng" (không tiết lộ field nào sai). HR chưa duyệt → "Tài khoản đang chờ phê duyệt".
- **Rỗng:** không áp dụng.
- **Mobile:** form gọn full-width, 1 cột.

### S7. Đăng ký — `/register`

```text
+------------------------------------------------------------+
|   Đăng ký tài khoản HR                                      |
|   Họ tên:    [____________]                                |
|   Email:     [____________]                                |
|   Công ty:   [____________]                                |
|   Mật khẩu:  [_________]                                   |
|   [ Đăng ký ]                        [Đăng nhập]            |
+------------------------------------------------------------+
```

- **Thành phần chính:** form đăng ký (name, email, company, password), nút đăng ký, link đăng nhập.
- **Lỗi:** email trùng → "Email đã đăng ký" + giữ nguyên form. Password yếu → hiện danh sách ràng buộc.
- **Rỗng:** sau khi đăng ký thành công → chuyển sang trạng thái "chờ duyệt" (HR pending) với thông báo.
- **Mobile:** 1 cột.

---

## Nhóm HR

### S8. Bảng điều khiển HR — `/hr`

```text
+------------------------------------------------------------+
| NavBar (logo, menu HR, [VI|EN], avatar)                     |
+------------------------------------------------------------+
| [H1] Xin chào                      [ + Đăng tin mới ]      |
| [Tổng tin][Đang mở][Chờ duyệt][Đã đóng]  ← StatCard        |
| Danh sách tin tuyển dụng                                   |
| [JobRow]  Fullstack Developer   Đang mở   ■ ■ ▓ ▓ (actions)|
| [JobRow]  React Developer       Chờ duyệt                  |
+------------------------------------------------------------+
```

- **Thành phần chính:** navbar HR, 4 StatCard (tổng/đang mở/chờ duyệt/đã đóng), bảng danh sách job của HR với hành động (gửi duyệt, đóng, xoá).
- **Rỗng:** chưa có job → "Bạn chưa có tin tuyển dụng nào" + nút "Đăng tin mới".
- **Lỗi:** HR bị block → chặn truy cập ("Tài khoản đã bị khoá"). Không tải được → thông báo + thử lại.
- **Mobile:** StatCard xếp 2×2; bảng job đổi thành card/dạng dòng; nút hành động nằm trong menu.

### S9. Đăng tin mới — `/hr/jobs/new`

```text
+------------------------------------------------------------+
| [H1] Đăng tin mới                                           |
| Tiêu đề*  [________________]                               |
| Chuyên mục* [Select (Chọn chuyên mục)]                     |
| Loại*      [ ( )Toàn thời gian ( )Hợp đồng ... ]           |
| Địa điểm   [______________]  Múi giờ [UTC+7]               |
| Lương      [min] - [max]   Tiền tệ [USD]                   |
| Mô tả*     [_______________________________________]       |
| Yêu cầu*   [_______________________________________]       |
| Tags       [React] [Vue] [Python] ...                     |
|                    [ Lưu nháp ]                            |
+------------------------------------------------------------+
```

- **Thành phần chính:** `JobForm` (title, category, job_type, location, timezone, salary, currency, description, requirements, tags), nút "Lưu nháp".
- **Rỗng:** danh mục/tag chưa có (admin chưa tạo) → hiện cảnh báo "Chưa có chuyên mục/tag, liên hệ quản trị viên".
- **Lỗi:** validate fail → highlight field lỗi + thông báo lỗi field. Gửi fail (network) → toast.
- **Mobile:** form 1 cột, chọn tag gọn lại.

### S10. Sửa tin — `/hr/jobs/{id}/edit`

```text
+------------------------------------------------------------+
| [H1] Sửa tin                        [Cập nhật] [Xoá]       |
| (Pre-fill dữ liệu job hiện tại, giống S9)                   |
| +---------- cảnh báo nếu job đã approved khi sửa:           |
| "Sửa nội dung sẽ gửi lại để duyệt"                         |
+------------------------------------------------------------+
```

- **Thành phần chính:** `JobForm` với `initialValues`, nút "Cập nhật"/"Xoá"; cảnh báo re-approval nếu đổi nội dung substantive.
- **Rỗng:** không áp dụng (job đang sửa luôn tồn tại).
- **Lỗi (403/404):** job không thuộc HR này / không tồn tại → "Không tìm thấy tin tuyển dụng" + nút về dashboard.
- **Mobile:** 1 cột.

### S11. Hồ sơ + kênh liên hệ — `/hr/profile`

```text
+------------------------------------------------------------+
| [H1] Hồ sơ HR                                               |
| Ảnh đại diện   Tên công ty  [______________]              |
| Email          (chỉ đọc)                                   |
| Kênh liên hệ:  + Email [___________]                        |
|                + Điện thoại [_________]                     |
|                + Telegram  [_________]                       |
|                     [ Lưu thay đổi ]                        |
+------------------------------------------------------------+
```

- **Thành phần chính:** form hồ sơ (tên/công ty), danh sách kênh liên hệ (email, phone, telegram), nút lưu.
- **Lỗi:** email/công ty không hợp lệ → highlight + thông báo. Lưu fail → toast.
- **Rỗng:** chưa có kênh liên hệ → ô "Chưa thêm kênh liên hệ" + nút thêm.
- **Mobile:** 1 cột.

---

## Nhóm Admin

### S12. Bảng điều khiển Admin — `/admin`

```text
+------------------------------------------------------------+
| NavBar admin (Tổng quan | Duyệt tin | Quản lý tin | HR | Catalog)|
+------------------------------------------------------------+
| [H1] Tổng Quan Quản Trị                                     |
| [Chờ duyệt][Tổng tin][Đang mở][Tổng HR]  ← StatCard        |
| [Hình ảnh trực quan số liệu phiên bản/duyệt gần đây]        |
+------------------------------------------------------------+
```

- **Thành phần chính:** navbar 5 mục admin, StatCard thống kê, khu vực hành động nhanh.
- **Rỗng:** không có dữ liệu → StatCard về 0, hiện mô tả "Chưa có dữ liệu".
- **Lỗi:** không tải được → thông báo + thử lại.
- **Mobile:** navbar rút vào menu; StatCard 2×2.

### S13. Hàng đợi duyệt tin — `/admin/pending`

```text
+------------------------------------------------------------+
| [H1] Tin chờ duyệt                       (n)               |
| [JobRow]  QA Engineer  · HR: Công ty ABC  · Ngày           |
|           [ Phê duyệt ] [ Từ chối ]                         |
| ... nhập lý do khi từ chối trong dialog                     |
+------------------------------------------------------------+
```

- **Thành phần chính:** danh sách job pending, nút Phê duyệt / Từ chối (dialog nhập lý do).
- **Rỗng:** "Không có tin nào đang chờ duyệt."
- **Lỗi:** thao tác fail → toast lỗi; giữ nguyên danh sách.
- **Mobile:** mỗi job là card, nút xếp dọc.

### S14. Quản lý tin — `/admin/jobs`

```text
+------------------------------------------------------------+
| [H1] Quản lý tin tuyển dụng   [Filter: Tất cả|Đang mở|Đã ẩn…]|
| [JobRow]  Mobile Developer  HR  Trạng thái  [Ẩn|Bỏ ẩn|Xoá] |
+------------------------------------------------------------+
```

- **Thành phần chính:** filter trạng thái, bảng danh sách job toàn hệ thống, hành động ẩn/bỏ ẩn/xoá.
- **Rỗng:** "Không có tin nào." — **Lỗi:** toast lỗi khi thao tác.
- **Mobile:** bảng → card; hành động trong menu.

### S15. Quản lý HR — `/admin/users`

```text
+------------------------------------------------------------+
| [H1] Quản lý HR                      (n)   [Search]        |
| [HRRow]  hr@abc.com · Công ty ABC · Trạng thái [Duyệt|Khóa]|
+------------------------------------------------------------+
```

- **Thành phần chính:** search HR, bảng danh sách HR (email, công ty, trạng thái), hành động duyệt/khóa/mở khóa.
- **Rỗng:** "Không có tài khoản HR." — **Lỗi:** toast khi thao tác.
- **Mobile:** card 1 cột.

### S16. Quản lý danh mục & tag — `/admin/catalog`

```text
+------------------------------------------------------------+
| [H1] Danh mục   [+ Thêm]      [H1] Tag   [+ Thêm]          |
| [Frontend  ●] [Frontend  ●]   [React  ●] [Vue  ●]         |
|   (toggle active, xoá)            (toggle active, xoá)      |
+------------------------------------------------------------+
```

- **Thành phần chính:** 2 cột danh mục & tag; mỗi mục có toggle active + xoá; form thêm mới.
- **Rỗng:** chưa có → "Chưa có danh mục/tag" + nút thêm.
- **Lỗi:** thao tác fail → toast.
- **Mobile:** danh mục & tag xếp 1 cột (mỗi nhóm là một section).

---

## Hành trình người dùng (tham chiếu cùng DIAGRAMS.md)

- **Job seeker:** Trang chủ `/` → tìm kiếm `/jobs` → bộ lọc → xem chi tiết `/jobs/{slug}-{id}` → liên hệ HR (kênh liên hệ) → quay lại / đi hướng khác. **Nhánh lỗi:** job không public → 404 "việc làm không tồn tại". **Trạng thái rỗng:** không có kết quả tìm kiếm/chuyên mục trống.
- **HR:** đăng ký `/register` → chờ duyệt → đăng nhập `/login` → `/hr` → đăng tin mới `/hr/jobs/new` → lưu nháp → gửi duyệt → admin **từ chối** → sửa `/hr/jobs/{id}/edit` → gửi lại → admin chấp thuận → job public → đóng/xoá tại `/hr`. **Nhánh lỗi:** HR blocked → mất quyền truy cập. **Trạng thái rỗng:** chưa có tin nào trong `/hr`.
