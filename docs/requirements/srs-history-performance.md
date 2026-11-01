# YÊU CẦU CHỨC NĂNG & PHI CHỨC NĂNG: LỊCH SỬ ĐƠN HÀNG, HIỆU NĂNG VÀ KHẢ DỤNG
## (SRS - Order History, Performance & Usability Specification)

> **Người thực hiện:** TV6 (Frontend – Checkout & Orders)  
> **Mã công việc:** I-13 (D-06) | **Reviewer:** TV5 (Frontend – Menu & Cart)  

---

## 1. Yêu cầu Chức năng (Functional Requirements)

### FR-13: Xem Lịch sử Đơn hàng Cá nhân (Order History)
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Khách hàng đã đăng nhập có thể xem danh sách tất cả các đơn hàng mình đã từng đặt, sắp xếp theo thời gian mới nhất lên đầu. Mỗi đơn hàng hiển thị mã đơn, ngày giờ tạo, tổng tiền, phương thức thanh toán và trạng thái hiện tại.
- **Tiêu chí chấp nhận (Acceptance Criteria):**
  1. API `GET /api/v1/orders` trả về mảng danh sách đơn hàng thuộc về chính User đang đăng nhập (dựa trên JWT claims).
  2. Người dùng tuyệt đối không xem được đơn hàng của người dùng khác (Data isolation).
  3. Bấm vào một đơn hàng trong danh sách sẽ mở ra trang/modal xem chi tiết từng món, size, topping và timeline trạng thái của đơn đó.

### FR-14: Theo dõi Trạng thái Đơn hàng Thời gian thực (Order Tracking)
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Sau khi thanh toán thành công, khách hàng được điều hướng đến màn hình xác nhận đơn hàng và theo dõi tiến trình thực tế. Màn hình tự động cập nhật trạng thái đơn (thông qua cơ chế polling định kỳ mỗi 5 giây hoặc làm mới).
- **Tiêu chí chấp nhận (Acceptance Criteria):**
  1. Hiển thị trực quan thanh tiến trình 4 bước: `Đã thanh toán (PAID)` -> `Đang pha chế (PREPARING)` -> `Đã sẵn sàng (READY)` -> `Đã nhận món (COMPLETED)`.
  2. Khi nhân viên pha chế đổi trạng thái trên quầy, màn hình của khách hàng phản ánh trạng thái mới trong vòng tối đa 5 giây.

### FR-15: Cập nhật Trạng thái Đơn hàng Dành cho Nhân viên (Staff Order Management)
- **Ưu tiên (MoSCoW):** Should
- **Mô tả:** Nhân viên quầy có màn hình dashboard hiển thị các đơn đang chờ pha chế và có nút bấm chuyển trạng thái tuần tự theo State Machine:
  `PENDING_PAYMENT` -> `PAID` -> `PREPARING` -> `READY` -> `COMPLETED`. Ngoài ra có thể chuyển sang `CANCELLED` nếu có sự cố.
- **Tiêu chí chấp nhận (Acceptance Criteria):**
  1. API `PATCH /api/v1/orders/:id/status` chỉ chấp nhận các bước chuyển trạng thái hợp lệ. Nếu nhảy cóc sai quy trình (ví dụ từ `PENDING_PAYMENT` nhảy thẳng sang `COMPLETED`), server trả về HTTP 400 Bad Request.
  2. Bắt buộc có quyền `STAFF` mới được gọi API này.

---

## 2. Yêu cầu Phi Chức năng (Non-Functional Requirements)

### NFR-14: Tính Khả dụng & Phục hồi Hệ thống (System Availability & Uptime)
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Hệ thống đạt độ sẵn sàng tối thiểu 99.0% trong thời gian vận hành thử nghiệm. Khi xảy ra lỗi crash ứng dụng, container Docker tự động khởi động lại (restart policy `always` hoặc `unless-stopped`).
- **Tiêu chí chấp nhận:** Khởi động lại service không làm mất mát dữ liệu đã ghi nhận vào PostgreSQL volume.

### NFR-15: Tính Tiện dụng & Thân thiện Người dùng (Usability & Accessibility)
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Giao diện đặt hàng đơn giản, phông chữ dễ đọc, nút bấm tối thiểu 44x44px theo chuẩn chạm ngón tay của Apple/Google Human Interface Guidelines, màu sắc tương phản cao (WCAG AA).
- **Tiêu chí chấp nhận:** Người dùng mới có thể hoàn tất việc chọn món và thanh toán trong vòng 3 phút mà không cần người khác hướng dẫn.
