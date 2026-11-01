# ADR 004: GIAO DỊCH TẠO ĐƠN HÀNG (DATABASE TRANSACTION) VÀ CHỐNG THANH TOÁN TRÙNG (IDEMPOTENCY)

> **Người thực hiện:** TV4 (Nguyễn Văn Tài – Backend Order & Payment)  
> **Mã công việc:** I-09 (D-17 - PR 3) | **Reviewer:** TV1 (Tech Lead / DevOps)  
> **Trạng thái:** Accepted  
> **Ngày quyết định:** 2026-11-01  

---

## 1. Bối cảnh (Context)
Trong hệ thống đặt đồ uống trực tuyến, hai rủi ro nghiêm trọng nhất có thể gây tổn thất tài chính và ảnh hưởng trải nghiệm khách hàng là:
1. **Lệch tồn kho và đơn hàng rác (Race Condition & Inconsistency)**: Khi nhiều khách cùng đặt món cuối cùng hoặc server gặp sự cố giữa lúc tạo đơn và trừ kho.
2. **Khách hàng bị trừ tiền nhiều lần (Double Charging)**: Khi khách bấm đúp nút thanh toán do mạng chậm, hoặc khi trình duyệt/client tự động gửi lại request (network timeout retry).

## 2. Quyết định (Decision)
1. **Quản lý Giao dịch Đơn hàng bằng Database Transaction**:
   - Khi nhận `POST /api/v1/orders`, backend sử dụng `DataSource.createQueryRunner()` để mở transaction với mức cô lập `READ COMMITTED`.
   - Tính toán lại giá phía server dựa trên dữ liệu thật trong DB.
   - Kiểm tra tồn kho và thực hiện trừ kho nguyên tử (`stock = stock - qty`). Nếu bất kỳ món nào không đủ, gọi `rollbackTransaction()` ngay lập tức.
   - Chỉ khi toàn bộ thao tác ghi `orders`, `order_items` và trừ kho thành công, transaction mới được `commitTransaction()`.
2. **Xử lý Idempotency cho API Thanh toán (`POST /api/v1/payments`)**:
   - Yêu cầu client bắt buộc truyền header `Idempotency-Key` (chuẩn UUIDv4) cho mỗi phiên giao dịch.
   - Trường `idempotencyKey` được định nghĩa là `UNIQUE` trong bảng `payments`.
   - Trước khi gọi cổng thanh toán mô phỏng, backend truy vấn kiểm tra xem key này đã tồn tại chưa:
     - Nếu đã tồn tại và thành công: Trả về ngay dữ liệu kết quả trước đó với HTTP 200 OK mà KHÔNG thực hiện trừ tiền hay gọi Payment Mock lần hai.
     - Nếu chưa tồn tại: Thực hiện giao dịch mới và lưu kết quả kèm key vào DB.

## 3. Hệ quả (Consequences)
- **Ưu điểm:**
  - Bảo vệ 100% tính toàn vẹn dữ liệu tài chính theo chuẩn ACID.
  - An toàn tuyệt đối trước các sự cố mạng và hành vi bấm đúp của người dùng di động.
- **Hạn chế & Biện pháp xử lý:**
  - Cần thêm chỉ mục (Index) trên cột `idempotencyKey` để tăng tốc độ truy vấn kiểm tra; đã bổ sung unique index trong migration.
