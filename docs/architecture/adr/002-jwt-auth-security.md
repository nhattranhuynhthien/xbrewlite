# ADR 002: CƠ CHẾ XÁC THỰC BẰNG JSON WEB TOKEN (JWT) VÀ PHÂN QUYỀN RBAC

> **Người thực hiện:** TV2 (Backend – Auth & User)  
> **Mã công việc:** I-12 (D-15) | **Reviewer:** TV3 (Đỗ Hoàng Vinh)  
> **Trạng thái:** Accepted  
> **Ngày quyết định:** 2026-11-01  

---

## 1. Bối cảnh (Context)
Ứng dụng BrewLite phục vụ trên nền tảng di động (PWA/Mobile web) với lượng truy cập cao trong giờ cao điểm. Hệ thống cần cơ chế xác thực người dùng không trạng thái (stateless) để giảm tải cho cơ sở dữ liệu khi mở rộng quy mô, đồng thời cần phân quyền rõ ràng giữa 2 nhóm tác nhân: Khách hàng thông thường (`CUSTOMER`) và Nhân viên pha chế / Thu ngân (`STAFF`).

## 2. Quyết định (Decision)
1. **Sử dụng Stateless JSON Web Token (JWT)**:
   - Sau khi người dùng xác thực email và mật khẩu (băm BCrypt, salt >= 10) thành công, máy chủ cấp một JWT Access Token có thời hạn 24 giờ.
   - Payload chứa các thông tin tối thiểu: `{ sub: user.id, email: user.email, role: user.role }`.
   - Secret key (`JWT_SECRET`) bắt buộc lấy từ biến môi trường, có độ dài tối thiểu 32 ký tự, không bao giờ hardcode.
2. **Cơ chế Phân quyền Role-Based Access Control (RBAC)**:
   - Xây dựng NestJS Custom Decorators: `@Roles(UserRole.STAFF)` và `@CurrentUser()`.
   - Kết hợp `JwtAuthGuard` (xác thực token hợp lệ) và `RolesGuard` (kiểm tra vai trò người dùng trong claims).
   - Nếu không có token: Trả về HTTP 401 Unauthorized. Nếu sai vai trò: Trả về HTTP 403 Forbidden.

## 3. Hệ quả (Consequences)
- **Ưu điểm:**
  - Máy chủ không cần lưu session trong RAM hay Redis, dễ dàng scale-out nhiều container API.
  - Phân quyền chặt chẽ ngay tại Controller layer thông qua Decorator trực quan.
- **Hạn chế & Biện pháp xử lý:**
  - Khó thu hồi (revoke) token trước thời hạn nếu bị rò rỉ; giải quyết bằng cách thiết lập thời gian sống hợp lý (24h) và mã hóa truyền thông 100% qua HTTPS.
