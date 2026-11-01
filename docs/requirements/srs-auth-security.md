# YÊU CẦU CHỨC NĂNG & PHI CHỨC NĂNG: XÁC THỰC VÀ BẢO MẬT
## (SRS - Authentication & Security Specification)

> **Người thực hiện:** TV2 (Backend – Auth & User)  
> **Mã công việc:** I-07 (D-03) | **Reviewer:** TV3 (Backend – Catalog)  

---

## 1. Yêu cầu Chức năng (Functional Requirements)

### FR-10: Đăng ký Tài khoản Người dùng (User Registration)
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Khách hàng mới có thể đăng ký tài khoản bằng email, mật khẩu và họ tên.
- **Tiêu chí chấp nhận (Acceptance Criteria):**
  1. API `POST /api/v1/auth/register` nhận email, password, fullName.
  2. Validate email hợp lệ, mật khẩu tối thiểu 6 ký tự.
  3. Mật khẩu bắt buộc phải được băm bằng thuật toán BCrypt với Salt rounds >= 10 trước khi lưu vào database.
  4. Nếu email đã tồn tại trong hệ thống, trả về HTTP 409 Conflict với thông báo "Email already registered".

### FR-11: Đăng nhập & Cấp JWT Token (User Authentication & JWT Issuance)
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Người dùng đăng nhập bằng email và mật khẩu để nhận chuỗi JWT Access Token.
- **Tiêu chí chấp nhận (Acceptance Criteria):**
  1. API `POST /api/v1/auth/login` kiểm tra email và so khớp mật khẩu bằng `bcrypt.compare`.
  2. Nếu thông tin chính xác, trả về mã HTTP 200 kèm access token và thông tin người dùng cơ bản (id, email, fullName, role).
  3. Nếu sai email hoặc mật khẩu, trả về mã HTTP 401 Unauthorized với thông báo "Invalid credentials".

### FR-12: Phân quyền Vai trò Người dùng (Role-Based Access Control - RBAC)
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Hệ thống hỗ trợ 2 vai trò cơ bản:
  - `CUSTOMER`: Quyền xem menu, quản lý giỏ hàng, đặt đơn của chính mình, xem lịch sử đơn của chính mình.
  - `STAFF`: Quyền xem danh sách tất cả các đơn hàng trong ngày, cập nhật trạng thái đơn (`PREPARING`, `READY`, `COMPLETED`, `CANCELLED`).
- **Tiêu chí chấp nhận (Acceptance Criteria):**
  1. Khách hàng thông thường truy cập API của Staff (ví dụ `PATCH /api/v1/orders/:id/status`) bị chặn lại với mã HTTP 403 Forbidden.
  2. Request không có JWT token hợp lệ khi gọi API bảo vệ bị chặn lại với mã HTTP 401 Unauthorized.

---

## 2. Yêu cầu Phi Chức năng (Non-Functional Requirements)

### NFR-12: Bảo mật Dữ liệu & Mật khẩu (Password & Credential Security)
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Mật khẩu người dùng tuyệt đối không bao giờ được lưu trữ dưới dạng bản rõ (plaintext). Chuỗi bí mật JWT (`JWT_SECRET`) phải có độ dài tối thiểu 32 ký tự ngẫu nhiên và chỉ được truyền qua biến môi trường.
- **Tiêu chí chấp nhận:** Không thể đảo ngược mật khẩu từ cơ sở dữ liệu; token JWT hết hạn sau thời gian cấu hình (mặc định 24h).

### NFR-13: Bảo mật Mạng & Kết nối (HTTPS & CORS Policy)
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Trên môi trường Production, toàn bộ giao tiếp giữa Client và Server bắt buộc phải đi qua giao thức bảo mật HTTPS với chứng chỉ SSL/TLS hợp lệ. Cấu hình CORS chỉ cho phép nguồn gốc Frontend được ủy quyền truy cập API.
- **Tiêu chí chấp nhận:** Các truy cập qua HTTP thường tự động được chuyển hướng (redirect 301) sang HTTPS.
