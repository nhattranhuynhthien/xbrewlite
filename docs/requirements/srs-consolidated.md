# TÀI LIỆU YÊU CẦU PHẦN MỀM HỢP NHẤT (SRS CONSOLIDATED)
## BREWLITE – REQUIREMENTS TO DEPLOYMENT (ASSIGNMENT 2)

> **Người tổng hợp & hợp nhất:** TV2 (Backend – Auth & User)  
> **Hỗ trợ rà soát mã:** TV6 (Frontend – Checkout & Orders)  
> **Mã công việc:** I-07 (D-08) | **Reviewer:** TV3 (Đỗ Hoàng Vinh)  

---

## 1. Giới thiệu Tổng quan
Tài liệu này hợp nhất toàn bộ các yêu cầu chức năng (FR) và phi chức năng (NFR) được phát triển bởi các thành viên trong nhóm BrewLite (TV1..TV6), đảm bảo tính thống nhất, triệt tiêu xung đột mã hiệu và làm căn cứ gốc cho Ma trận truy vết (`docs/traceability-matrix.md`).

---

## 2. Bảng Hợp nhất Yêu cầu Chức năng (Functional Requirements - FR)

| Mã FR | Tên Yêu cầu | Thành viên | Mức MoSCoW | API / Giao diện liên quan | Tiêu chí chấp nhận chính |
|---|---|---|---|---|---|
| **FR-01** | Xem menu & danh mục đồ uống | TV3 | Must | `GET /api/v1/products` / Menu Screen | Trả về danh sách đồ uống phân nhóm; hiển thị rõ giá cơ bản và nhãn hết hàng. |
| **FR-02** | Xem chi tiết sản phẩm, size, topping | TV3 | Must | `GET /api/v1/products/:id` / Detail Modal | Trả về đủ options kèm phụ thu; 404 khi không tìm thấy id; tính giá phản ứng. |
| **FR-03** | Quản lý tồn kho & kiểm tra hết hàng | TV3 | Must | Service Inventory / DB Trigger | Từ chối đơn với mã 400 nếu vượt tồn kho; trừ kho nguyên tử trong transaction. |
| **FR-04** | Quản lý giỏ hàng (thêm/sửa/xóa) | TV5 | Must | Cart Store / Cart Screen | Tính đúng tổng tiền theo công thức; cho phép tăng/giảm/xóa từng dòng món. |
| **FR-05** | Lưu giữ trạng thái giỏ hàng (Persistence) | TV5 | Must | `localStorage` Sync | Giỏ hàng không mất khi F5 reload hoặc đóng mở tab trình duyệt; clear khi xong đơn. |
| **FR-06** | Hỗ trợ PWA & Trải nghiệm Mobile-first | TV5 | Should | `manifest.json`, Service Worker | Responsive mượt mà trên iPhone SE (375px); cho phép cài đặt ra màn hình Home. |
| **FR-07** | Tạo đơn hàng trong DB Transaction | TV4 | Must | `POST /api/v1/orders` / Checkout | Tạo đơn + trừ kho trong 1 transaction; tính lại giá phía server; rollback khi lỗi. |
| **FR-08** | Thanh toán đơn hàng mô phỏng (Ví/Thẻ) | TV4 | Must | `POST /api/v1/payments` / Pay Form | Hỗ trợ Ví điện tử & Thẻ ngân hàng; xử lý cả luồng thành công và luồng thất bại. |
| **FR-09** | Chống thanh toán trùng (Idempotency) | TV4 | Must | Header `Idempotency-Key` (UUID) | Gửi lại cùng key trả kết quả cũ, không tạo thanh toán mới hoặc trừ tiền 2 lần. |
| **FR-10** | Đăng ký tài khoản người dùng | TV2 | Must | `POST /api/v1/auth/register` / Register UI | Mật khẩu băm BCrypt (salt >= 10); validate định dạng email; từ chối email trùng. |
| **FR-11** | Đăng nhập & cấp JWT Access Token | TV2 | Must | `POST /api/v1/auth/login` / Login UI | Đăng nhập đúng trả JWT 24h; sai email/password trả 401 Unauthorized. |
| **FR-12** | Phân quyền vai trò RBAC (Customer/Staff)| TV2 | Must | `JwtAuthGuard`, `RolesGuard` | Chặn Customer truy cập API Staff với mã 403 Forbidden; bảo vệ route backend. |
| **FR-13** | Xem lịch sử đơn hàng cá nhân | TV6 | Must | `GET /api/v1/orders` / History Screen | Chỉ xem đơn của chính tài khoản đang đăng nhập; sắp xếp mới nhất lên đầu. |
| **FR-14** | Theo dõi trạng thái đơn hàng thời gian thực | TV6 | Must | `GET /api/v1/orders/:id` / Tracking UI | Thanh tiến trình 4 trạng thái; cơ chế polling cập nhật trạng thái trong 5 giây. |
| **FR-15** | Staff cập nhật trạng thái đơn hàng | TV3 / TV5 | Should | `PATCH /api/v1/orders/:id/status` / Staff UI | Tuân thủ state machine (`PENDING_PAYMENT` -> `PAID` -> `PREPARING` -> `READY` -> `COMPLETED`). |

---

## 3. Bảng Hợp nhất Yêu cầu Phi Chức năng (Non-Functional Requirements - NFR)

| Mã NFR | Nhóm NFR | Thành viên | Mức MoSCoW | Tiêu chí chấp nhận kiểm chứng được |
|---|---|---|---|---|
| **NFR-01** | Hiệu năng Catalog | TV3 | Must | Thời gian phản hồi P95 của API `GET /products` <= 200ms với 50 concurrent requests. |
| **NFR-02** | Toàn vẹn dữ liệu tiền tệ | TV3 | Must | Giá tiền lưu số nguyên hoặc `DECIMAL(10,2)` đơn vị VND, không làm tròn sai số. |
| **NFR-03** | Trạng thái phản hồi UI | TV5 | Must | Xử lý đầy đủ 3 trạng thái: Skeleton Loading, Empty State, Error State kèm nút Thử lại. |
| **NFR-04** | Tốc độ tải trang ban đầu (FCP) | TV5 | Must | First Contentful Paint (FCP) trên mạng 4G di động đạt dưới 1.8 giây. |
| **NFR-05** | Tính toàn vẹn ACID | TV4 | Must | Tạo đơn và trừ kho thực thi qua QueryRunner PostgreSQL (`READ COMMITTED`). |
| **NFR-06** | SLA thanh toán | TV4 | Must | API thanh toán phản hồi trung bình trong khoảng 300ms - 800ms. |
| **NFR-07** | Tự động hóa CI & Branch Protection| TV1 | Must | Pull Request tự động chạy Install -> Lint -> Test -> Build; chặn merge nếu có lỗi. |
| **NFR-08** | Chuẩn hóa Docker Container | TV1 | Must | Cung cấp Dockerfile cho web, api và `docker-compose.yml` chạy local chỉ bằng 1 lệnh. |
| **NFR-09** | Giám sát Health Check | TV1 / TV2 | Must | Endpoint `GET /api/v1/health` kiểm tra kết nối DB và trả 200 OK hoặc 503 Service Unavailable. |
| **NFR-10** | Structured Logging & Che dấu Secret | TV1 / TV2 | Must | Log JSON có timestamp, log level; tuyệt đối không log plaintext password và secret. |
| **NFR-11** | Tự động hóa CD & Diễn tập Rollback | TV1 / TV2 | Must | Build image tag commit SHA, deploy tự động, chạy smoke test và có quy trình rollback. |
| **NFR-12** | Bảo mật thông tin xác thực | TV2 | Must | Mật khẩu hash BCrypt; secret JWT lưu qua biến môi trường tối thiểu 32 ký tự. |
| **NFR-13** | Bảo mật truyền thông HTTPS | TV1 / TV2 | Must | Toàn bộ traffic Production qua HTTPS; database không mở cổng công khai ra Internet. |
| **NFR-14** | Độ sẵn sàng & tự phục hồi | TV6 | Must | Uptime đạt >= 99.0%; container Docker tự động khởi động lại nếu tiến trình gặp sự cố. |
| **NFR-15** | Tính tiện dụng chuẩn Mobile | TV6 | Must | Nút bấm tối thiểu 44x44px; hoàn thành đặt món trong vòng 3 phút với người mới. |
