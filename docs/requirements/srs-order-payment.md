# YÊU CẦU CHỨC NĂNG & PHI CHỨC NĂNG: ĐẶT ĐƠN VÀ THANH TOÁN
## (SRS - Order & Payment Specification)

> **Người thực hiện:** TV4 (Nguyễn Văn Tài – Backend Order & Payment)  
> **Mã công việc:** I-05 (D-05) | **Reviewer:** TV1 (Tech Lead / DevOps)  

---

## 1. Yêu cầu Chức năng (Functional Requirements)

### FR-07: Tạo Đơn hàng trong Transaction (Atomic Order Creation)
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Khách hàng sau khi chọn món và điền thông tin (tên, số điện thoại, hình thức nhận tại quầy/bàn) bấm xác nhận tạo đơn hàng. Toàn bộ thao tác ghi bản ghi `Order`, các bản ghi con `OrderItem`, `OrderItemTopping` và trừ số lượng tồn kho `Product.stock` phải được thực thi trong một Database Transaction duy nhất.
- **Tiêu chí chấp nhận (Acceptance Criteria):**
  1. API `POST /api/v1/orders` nhận payload danh sách items và thông tin khách hàng.
  2. Bắt buộc có JWT Token hợp lệ trong Authorization header (`Bearer <token>`).
  3. Giá sản phẩm, giá size và giá topping được tính lại hoàn toàn phía Server (không chấp nhận giá từ client gửi lên để phòng chống giả mạo giá).
  4. Nếu bất kỳ món nào không đủ tồn kho, toàn bộ giao dịch bị Rollback và trả về HTTP 400 Bad Request kèm chi tiết món hết hàng.
  5. Đơn hàng mới tạo có trạng thái mặc định là `PENDING_PAYMENT`.

### FR-08: Thanh toán Đơn hàng Mô phỏng (Simulated Payment)
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Khách hàng thực hiện thanh toán cho đơn hàng đã tạo qua hai phương thức mô phỏng:
  1. **Ví điện tử (E-WALLET)**: Momo/ZaloPay mock.
  2. **Thẻ ngân hàng (CARD)**: Visa/MasterCard/Napas mock.
  Hệ thống hỗ trợ truyền tham số cờ mô phỏng (`simulateSuccess: boolean` hoặc các kịch bản test) để kiểm thử cả trường hợp thanh toán thành công và trường hợp thanh toán thất bại (thẻ hết tiền / từ chối giao dịch).
- **Tiêu chí chấp nhận (Acceptance Criteria):**
  1. API `POST /api/v1/payments` nhận `orderId`, `method`, `amount`.
  2. Khi thanh toán thành công: Tạo bản ghi `Payment` với trạng thái `SUCCESS`, cập nhật trạng thái đơn hàng từ `PENDING_PAYMENT` sang `PAID` (hoặc `PREPARING`).
  3. Khi thanh toán thất bại: Tạo bản ghi `Payment` với trạng thái `FAILED`, đơn hàng giữ nguyên `PENDING_PAYMENT` và cho phép khách hàng chọn phương thức khác để thử lại.

### FR-09: Cơ chế Chống Thanh toán Trùng lặp (Payment Idempotency)
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Để tránh việc trừ tiền nhiều lần do khách hàng bấm đúp nút thanh toán hoặc do mạng chập chờn gửi lại request (network retry), client bắt buộc phải gửi kèm header `Idempotency-Key` (UUIDv4) duy nhất cho mỗi phiên thanh toán.
- **Tiêu chí chấp nhận (Acceptance Criteria):**
  1. Nếu client gửi cùng một `Idempotency-Key` lần thứ hai khi giao dịch trước đã xử lý thành công, server KHÔNG tạo bản ghi thanh toán mới và KHÔNG thực hiện trừ tiền lại, mà trả về ngay kết quả thanh toán của lần trước với mã HTTP 200 OK.
  2. Header `Idempotency-Key` là chuỗi UUID chuẩn; nếu thiếu header này, server trả về HTTP 400 Bad Request.

---

## 2. Yêu cầu Phi Chức năng (Non-Functional Requirements)

### NFR-05: Tính Toàn vẹn Giao dịch (ACID Guarantee)
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Thao tác tạo đơn hàng và trừ tồn kho phải tuân thủ nghiêm ngặt nguyên lý ACID. Nếu xảy ra sự cố sập server hoặc lỗi DB giữa chừng, không được để xảy ra trạng thái trừ kho mà không có đơn hoặc tạo đơn mà không trừ kho.
- **Tiêu chí chấp nhận:** Sử dụng TypeORM / PostgreSQL `QueryRunner` với Transaction Isolation Level `READ COMMITTED` hoặc cao hơn.

### NFR-06: Thời gian Xử lý Thanh toán (Payment SLA)
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Phản hồi của API thanh toán mô phỏng không được vượt quá 1.5 giây trong điều kiện mạng bình thường.
- **Tiêu chí chấp nhận:** Thời gian phản hồi trung bình của API payment từ 300ms đến 800ms (giả lập độ trễ ngân hàng thực tế).
