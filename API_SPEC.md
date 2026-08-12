# API Specification — Remote IT Job

## 1. Quy ước

Base path:

```text
/api
```

Định dạng:
- REST
- JSON
- UTF-8

Xác thực:
- session phía server
- cookie HTTP-only

Tất cả endpoint được bảo vệ yêu cầu backend authorization.

## 2. Public jobs

### GET /api/jobs

Tìm kiếm/lọc public jobs.

Query parameters:

```text
q
category
tags
job_type
salary_min
salary_max
currency
location
timezone
page
page_size
sort
```

Mặc định:
- `page=1`
- `page_size=20`
- `sort=latest`

Chỉ trả về job public/đủ điều kiện.

Conceptual response:

```json
{
  "items": [
    {
      "id": 123,
      "title": "React Developer",
      "company_name": "ABC",
      "category": {
        "id": 1,
        "name": "Frontend",
        "slug": "frontend"
      },
      "job_type": "fulltime",
      "location": "Vietnam",
      "timezone": "UTC+7",
      "salary_min": 1800,
      "salary_max": 3000,
      "currency": "USD",
      "tags": ["react", "typescript"],
      "created_at": "2026-08-05T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 24,
    "total_pages": 2
  }
}
```

### GET /api/jobs/{job_id}

Trả về chi tiết job public và các kênh liên hệ HR.

Không tiết lộ dữ liệu riêng tư của HR ngoài thông tin profile/contact được công khai.

Request chi tiết job public hợp lệ được tính là một lượt xem.

## 3. Authentication

### POST /api/auth/register

Tạo tài khoản HR bằng email/password.

Trạng thái tài khoản ban đầu:

```text
pending
```

Đăng ký chỉ yêu cầu thông tin tối thiểu cần thiết.

### POST /api/auth/login

Xác thực email/password.

Khi thành công:
- tạo session phía server
- đặt cookie HTTP-only

HR đang pending có thể xác thực nhưng không thể thực hiện thao tác HR đã được duyệt cho đến khi Admin duyệt.

### GET /api/auth/google/login

Bắt đầu Google OAuth flow.

### GET /api/auth/google/callback

OAuth callback.

HR mới qua Google:
- tạo tài khoản nếu cần
- status = pending
- tạo session sau khi xác thực thành công

Google không bypass HR approval.

### POST /api/auth/logout

Hủy session hiện tại và xóa cookie.

### GET /api/auth/me

Trả về thông tin user đang xác thực.

### POST /api/auth/change-password

Đổi password cho tài khoản có password credential.

Yêu cầu password hiện tại và password mới.

Không cần dịch vụ email reset password trong MVP.

## 4. HR profile

### GET /api/hr/profile

Trả về profile HR hiện tại.

### PATCH /api/hr/profile

Cập nhật các trường profile như:
- name
- company_name
- avatar
- contacts

Implementation phải xác thực quyền sở hữu qua session hiện tại.

## 5. HR jobs

### GET /api/hr/jobs

Danh sách job của HR hiện tại với pagination và filter status tùy chọn.

### POST /api/hr/jobs

Tạo draft job.

### GET /api/hr/jobs/{job_id}

Lấy job thuộc sở hữu của HR hiện tại.

### PATCH /api/hr/jobs/{job_id}

Cập nhật job thuộc sở hữu.

Nếu job đã approved nhận thay đổi substantive, backend đặt status về `pending`.

### POST /api/hr/jobs/{job_id}/submit

Gửi job draft/rejected để kiểm duyệt.

### POST /api/hr/jobs/{job_id}/close

Đóng job đã approved.

### DELETE /api/hr/jobs/{job_id}

Xóa job khi được phép bởi lifecycle policy. Ưu tiên giữ lại bản ghi phục vụ kiểm duyệt thay vì xóa hủy diệt.

## 6. Admin

Tất cả endpoint `/api/admin/*` yêu cầu:
- session đã xác thực
- role = admin
- tài khoản active

### GET /api/admin/jobs

Danh sách tất cả job với filter.

### GET /api/admin/jobs/pending

Danh sách job đang pending.

### POST /api/admin/jobs/{job_id}/approve

Duyệt job đang pending.

### POST /api/admin/jobs/{job_id}/reject

Từ chối job đang pending.

Request:

```json
{
  "reason": "Tin tuyển dụng thiếu thông tin về yêu cầu công việc."
}
```

### POST /api/admin/jobs/{job_id}/hide

Ẩn job công khai.

### POST /api/admin/jobs/{job_id}/unhide

Khôi phục job bị ẩn chỉ khi lifecycle rules cho phép.

### GET /api/admin/users

Danh sách tài khoản HR với pagination/filter.

### POST /api/admin/users/{user_id}/approve

Duyệt HR đang pending.

### POST /api/admin/users/{user_id}/block

Khóa HR.

### POST /api/admin/users/{user_id}/unblock

Mở khóa HR.

### GET /api/admin/categories

Danh sách category.

### POST /api/admin/categories

Tạo category.

### PATCH /api/admin/categories/{id}

Cập nhật category.

### POST /api/admin/categories/{id}/deactivate

Vô hiệu hóa category.

### GET /api/admin/tags

Danh sách tag.

### POST /api/admin/tags

Tạo tag.

### PATCH /api/admin/tags/{id}

Cập nhật tag.

### POST /api/admin/tags/{id}/deactivate

Vô hiệu hóa tag.

## 7. Quy tắc authorization

Backend phải thực thi:

| Hành động | Job seeker | HR | Admin |
|---|---|---|---|
| Xem public jobs | Có | Có | Có |
| Tạo job | Không | Active HR | Có |
| Sửa job của mình | Không | Có | Có |
| Sửa job của HR khác | Không | Không | Có |
| Gửi duyệt job | Không | Active HR | Có |
| Duyệt job | Không | Không | Có |
| Từ chối job | Không | Không | Có |
| Khóa HR | Không | Không | Có |
| Quản lý catalog | Không | Không | Có |

## 8. Định dạng lỗi

Sử dụng cấu trúc JSON nhất quán, ví dụ:

```json
{
  "error": {
    "code": "JOB_NOT_FOUND",
    "message": "Không tìm thấy tin tuyển dụng."
  }
}
```

Validation errors sử dụng quy ước FastAPI/Pydantic nhất quán.

## 9. Quy tắc API

- Không tin `user_id` do client gửi để xác định quyền sở hữu.
- Lấy thông tin user hiện tại từ session phía server.
- Validate tất cả input ở backend.
- Không tiết lộ password hash, session token hoặc dữ liệu bảo mật nội bộ.
- Giữ API naming nhất quán.
- Mọi thay đổi API breaking yêu cầu cập nhật file này.
