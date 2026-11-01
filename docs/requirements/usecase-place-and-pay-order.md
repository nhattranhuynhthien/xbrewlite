# ĐẶC TẢ USE-CASE TRỌNG TÂM: ĐẶT VÀ THANH TOÁN ĐƠN HÀNG
## (Use-Case Specification: Place and Pay Order - UC-06 & UC-07)

> **Người thực hiện:** TV4 (Nguyễn Văn Tài – Backend Order & Payment)  
> **Mã công việc:** I-09 (D-09 - PR 1 / Refs #9) | **Reviewer:** TV1 (Tech Lead / DevOps)  
> **Liên kết Yêu cầu (Traceability):** FR-03, FR-04, FR-07, FR-08, FR-09, FR-11, FR-12, NFR-05, NFR-06  

---

## 1. Tóm tắt Use-case (Brief Description)
Use-case này mô tả toàn bộ chu trình cốt lõi mang lại giá trị kinh doanh trực tiếp cho BrewLite: Khách hàng sau khi lựa chọn các món đồ uống vào giỏ hàng sẽ tiến hành tạo đơn hàng trong hệ thống (được bọc trong một Database Transaction duy nhất nhằm kiểm tra và trừ tồn kho nguyên tử), sau đó lựa chọn phương thức thanh toán mô phỏng (Ví điện tử hoặc Thẻ ngân hàng) kèm khóa chống trùng `Idempotency-Key` để thanh toán và nhận xác nhận đơn hàng theo thời gian thực.

---

## 2. Thông tin Đặc tả Cơ bản (Basic Specification)

- **Mã định danh Use-case:** UC-06 (Đặt hàng / Tạo đơn) & UC-07 (Thanh toán đơn hàng)
- **Tác nhân chính (Primary Actor):** Khách hàng (Customer) - đã đăng nhập vào hệ thống.
- **Tác nhân phụ / Hỗ trợ (Supporting Actors):**
  - Hệ thống Cổng thanh toán mô phỏng (Payment Gateway Mock)
  - Hệ thống Cơ sở dữ liệu PostgreSQL (Database)
- **Điều kiện kích hoạt (Trigger):** Khách hàng bấm nút **"Xác nhận đặt hàng & Thanh toán"** tại màn hình Checkout.
- **Tiền điều kiện (Pre-conditions):**
  1. Khách hàng đã đăng nhập và sở hữu JWT Access Token hợp lệ.
  2. Giỏ hàng có ít nhất một sản phẩm hợp lệ (`cart.items.length > 0`).
  3. Thiết bị client đã tạo sẵn một mã định danh ngẫu nhiên `Idempotency-Key` (chuẩn UUIDv4) cho phiên thanh toán này.
- **Hậu điều kiện (Post-conditions):**
  - **Trường hợp thành công:**
    1. Bản ghi `Order` được tạo với trạng thái ban đầu `PENDING_PAYMENT`, sau khi thanh toán thành công chuyển sang `PAID`.
    2. Số lượng tồn kho (`stock`) của các sản phẩm tương ứng trong kho giảm chính xác theo số lượng khách đặt.
    3. Bản ghi `Payment` được lưu với trạng thái `SUCCESS` cùng transaction code giả lập.
    4. Giỏ hàng client được làm rỗng (`clearCart()`).
    5. Khách hàng được chuyển hướng sang màn hình theo dõi đơn hàng với trạng thái `PAID`.
  - **Trường hợp thất bại:**
    1. Nếu thiếu hàng trong kho: Transaction tạo đơn bị Rollback hoàn toàn, không có đơn hàng nào được tạo và tồn kho không đổi.
    2. Nếu thanh toán thất bại: Đơn hàng giữ nguyên ở trạng thái `PENDING_PAYMENT`, bản ghi `Payment` ghi nhận trạng thái `FAILED`, cho phép khách hàng chọn phương thức khác để thử lại mà không phải tạo lại giỏ hàng.

---

## 3. Các Luồng Thực thi (Flow of Events)

### 3.1. Luồng Cơ bản / Luồng Chính (Main Success Scenario)
1. **Khách hàng** duyệt giỏ hàng tại màn hình Checkout, chọn phương thức thanh toán (`E-WALLET` hoặc `CARD`) và bấm nút **"Thanh toán ngay"**.
2. **Next.js UI** kiểm tra tính hợp lệ dữ liệu phía client và gửi yêu cầu tạo đơn:
   - `POST /api/v1/orders` kèm header `Authorization: Bearer <jwt_token>` và payload danh sách items, thông tin nhận hàng.
3. **NestJS API** xác thực JWT token qua `JwtAuthGuard`, trích xuất `userId`.
4. **NestJS API** mở một Database Transaction (`QueryRunner.startTransaction()`):
   - Duyệt từng sản phẩm trong danh sách: kiểm tra sản phẩm có tồn tại và `stock >= item.quantity`.
   - Tính toán lại đơn giá từng món, phụ thu size, phụ thu topping trực tiếp từ DB để xác định `totalAmount` chuẩn.
   - Thực thi trừ tồn kho nguyên tử (`stock = stock - item.quantity`).
   - Tạo bản ghi `Order` với trạng thái `PENDING_PAYMENT`.
   - Tạo các bản ghi `OrderItem` và `OrderItemTopping`.
   - Commit transaction (`QueryRunner.commitTransaction()`).
5. **NestJS API** trả về thông tin đơn hàng vừa tạo kèm `orderId` và mã HTTP 201 Created.
6. **Next.js UI** nhận được `orderId`, lập tức gửi yêu cầu xử lý thanh toán:
   - `POST /api/v1/payments` kèm header `Idempotency-Key: <UUID>` và body `{ orderId, paymentMethod: "E-WALLET", amount: totalAmount }`.
7. **NestJS API** kiểm tra header `Idempotency-Key`:
   - Nếu key chưa từng tồn tại: Gửi yêu cầu xác thực sang **Payment Mocking Service**.
8. **Payment Mocking Service** xử lý giao dịch và trả về kết quả thành công `{ status: "SUCCESS", transactionNo: "TXN_..." }`.
9. **NestJS API** lưu bản ghi `Payment` với `status: SUCCESS`, `idempotencyKey: <UUID>`, đồng thời cập nhật trạng thái đơn hàng `Order.status = 'PAID'`.
10. **NestJS API** trả về kết quả thanh toán thành công với mã HTTP 200 OK.
11. **Next.js UI** xóa sạch giỏ hàng local và điều hướng khách hàng sang màn hình **Theo dõi đơn hàng (Order Tracking)**.

---

### 3.2. Luồng Thay thế (Alternative Flows)

#### A1: Khách hàng thanh toán qua Thẻ ngân hàng (Card)
- Tại bước 1, khách hàng chọn phương thức `CARD` thay vì `E-WALLET`.
- Luồng xử lý tương tự, Payment Service mô phỏng gọi mạng lưới Napas/Visa, trả về mã giao dịch thẻ hợp lệ.

#### A2: Gửi lại cùng một yêu cầu thanh toán (Idempotency Retried Request)
- Khách hàng bấm đúp nút thanh toán hoặc trình duyệt gửi lại request do timeout mạng.
- Tại bước 7, NestJS API tìm thấy `Idempotency-Key` đã tồn tại trong bảng `payments` với trạng thái `SUCCESS`.
- Hệ thống KHÔNG gọi lại Payment Gateway, KHÔNG trừ tiền lần hai, mà trả về ngay kết quả thanh toán đã lưu với HTTP 200 OK.

---

### 3.3. Luồng Ngoại lệ (Exception Flows)

#### E1: Sản phẩm đã hết hàng trong lúc đặt (Out of Stock)
- Tại bước 4, khi NestJS API kiểm tra tồn kho phát hiện một sản phẩm có `stock < item.quantity`.
- Hệ thống lập tức gọi `QueryRunner.rollbackTransaction()`.
- API trả về mã lỗi HTTP 400 Bad Request kèm chi tiết:
  ```json
  { "statusCode": 400, "error": "Bad Request", "message": "Sản phẩm 'Trà Đào Cam Sả' không đủ số lượng trong kho (còn 1, yêu cầu 2)" }
  ```
- Next.js UI hiển thị thông báo lỗi nổi bật màu đỏ và gợi ý khách điều chỉnh lại giỏ hàng.

#### E2: Token JWT hết hạn hoặc chưa đăng nhập (Unauthorized)
- Tại bước 3, `JwtAuthGuard` phát hiện token không hợp lệ hoặc đã hết hạn.
- API trả về mã lỗi HTTP 401 Unauthorized.
- Next.js UI lưu lại trạng thái giỏ hàng hiện tại và điều hướng người dùng về trang `/login` với query param `redirect=/checkout`.

#### E3: Cổng thanh toán từ chối giao dịch (Payment Failed)
- Tại bước 8, Payment Mocking Service trả về `{ status: "FAILED", message: "Số dư ví không đủ hoặc thẻ bị từ chối" }`.
- NestJS API ghi nhận bản ghi `Payment` với `status: FAILED`. Trạng thái đơn hàng giữ nguyên `PENDING_PAYMENT`.
- API trả về kết quả thất bại với HTTP 400 Bad Request.
- Next.js UI thông báo cho khách hàng: *"Thanh toán chưa thành công: Số dư không đủ. Vui lòng thử lại hoặc chọn phương thức thanh toán khác."* Nút **"Thử lại"** được kích hoạt để khách thanh toán tiếp mà không bị mất đơn.
