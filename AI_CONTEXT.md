# AI Context

Tài liệu này là hợp đồng làm việc dành cho AI coding agent.

## 1. Mục tiêu project

Xây dựng website đăng tin tuyển dụng việc làm remote, tập trung vào người dùng Việt Nam.

Stack:
- React + TypeScript
- FastAPI + Python
- PostgreSQL
- SQLAlchemy
- Alembic

## 2. Business rules bắt buộc

### Job seeker
- Không cần đăng nhập.
- Không cần tạo account.
- Không có chức năng nộp CV/application.
- Chỉ tìm kiếm, xem job và lấy contact HR.
- Tự liên hệ HR bên ngoài hệ thống.

### HR
- Có thể đăng nhập bằng email/password hoặc Google OAuth.
- Một account có thể sử dụng cả email/password và Google.
- Email là định danh account chính.
- Google identity được liên kết bằng Google subject (`sub`), không tạo account trùng khi email đã tồn tại.
- HR mới có `status = pending`.
- Pending HR không được đăng tin cho đến khi admin duyệt.
- Active HR mới có quyền quản lý job.
- Blocked HR không được sử dụng các chức năng HR cần quyền active.
- HR chỉ được sửa/xóa/đóng job thuộc mình.

### Admin
- Role riêng trong bảng users.
- Admin có thể duyệt/từ chối HR.
- Admin có thể block/unblock HR.
- Admin có thể duyệt/từ chối/ẩn/xóa job theo quyền.
- Không tạo bảng admin riêng trong MVP.

### Contacts
- Contact thuộc về HR.
- Các channel hiện tại:
  - zalo
  - telegram
  - linkedin
  - phone
  - email
- Mỗi HR có tối đa một contact cho mỗi channel trong MVP.
- Job detail lấy contact từ HR sở hữu job.

### Categories và tags
- Được quản lý bởi hệ thống/admin.
- HR không tự tạo tag/category.
- Job có đúng một category.
- Job có thể có nhiều tags.
- Tags là công nghệ/kỹ năng.

### Views
- `jobs.views` là tổng số lượt mở trang chi tiết job.
- Không tuyên bố đây là unique visitors.
- Không cần bảng event view riêng trong MVP.

## 3. Authentication

Hai phương thức:
1. Email + password.
2. Google OAuth / OpenID Connect.

Password phải được lưu dưới dạng hash bằng thuật toán password hashing an toàn; không bao giờ lưu plaintext.

Google identity dùng `google_subject`.

Nếu user đăng ký email trước rồi login Google bằng cùng email:
- Không tạo user thứ hai.
- Liên kết Google identity vào account hiện tại theo quy tắc bảo mật đã định.

Authentication và HR approval là hai khái niệm riêng.

## 4. Authorization

Mọi endpoint protected phải kiểm tra:
1. Authentication.
2. User role.
3. User status.
4. Ownership nếu endpoint thao tác trên tài nguyên của HR.

Không tin tưởng role/status do frontend gửi lên.

## 5. Job lifecycle

Các trạng thái:
- draft
- pending
- approved
- rejected
- closed
- hidden
- expired

`approved` nghĩa là đã được admin duyệt và được phép hiển thị công khai.

Không tự ý cho phép mọi transition. Transition phải được kiểm soát theo role và business rules.

## 6. Cost policy

Project cá nhân và không được tự ý tạo chi phí.

Ưu tiên:
- Open-source.
- Self-hosted.
- Local development.
- Free libraries.
- Free/open font licenses.

Không tự ý thêm:
- Paid SaaS.
- Paid APIs.
- Paid authentication providers.
- Paid search services.
- Paid email services.
- Paid map APIs.
- Managed cloud database.
- AI API có tính phí.

Nếu dependency có license hoặc pricing đáng chú ý, phải ghi rõ trong tài liệu trước khi thêm.

Không tự ý đổi font sang font có license thương mại. Font Stitch hiện tại cần được giữ license/copyright notice phù hợp khi phân phối.

## 7. UI

Google Stitch là nguồn tham chiếu visual design.

Không được suy luận business logic chỉ từ UI mockup.

Ví dụ một nút "Apply" trong prototype không có nghĩa backend được phép tạo application system.

UI prototype có thể chứa mock data; production frontend phải lấy dữ liệu qua API.

## 8. Coding rules

- Đọc toàn bộ documentation trước khi sửa code.
- Không thay đổi architecture chỉ để giải quyết một lỗi nhỏ.
- Không thêm dependency nếu standard library hoặc dependency hiện có đủ dùng.
- Không tạo duplicate business logic giữa frontend và backend.
- Backend là nguồn xác thực cuối cùng cho authorization và validation.
- Mọi thay đổi schema phải đi qua migration.
- Không sửa database production bằng thao tác thủ công trong code application.
- Cập nhật PROJECT_STATE.md và CHANGELOG.md sau các thay đổi có ý nghĩa.

## 9. Không được tự ý làm

- Không thêm job application/CV system.
- Không thêm account cho job seeker.
- Không thêm company marketplace.
- Không thêm salary database riêng.
- Không thêm chat giữa HR và job seeker.
- Không thêm payment/subscription.
- Không thêm AI matching/recommendation.
- Không thêm external SaaS chỉ vì thuận tiện.

Các tính năng trên chỉ được thêm khi requirement được cập nhật.
