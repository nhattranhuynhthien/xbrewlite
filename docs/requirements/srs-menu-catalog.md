# YÊU CẦU CHỨC NĂNG & PHI CHỨC NĂNG: MENU VÀ DANH MỤC SẢN PHẨM
## (SRS - Menu & Catalog Specification)

> **Người thực hiện:** TV3 (Đỗ Hoàng Vinh – Backend Catalog)  
> **Mã công việc:** I-03 (D-02) | **Reviewer:** TV4 (Nguyễn Văn Tài)  

---

## 1. Yêu cầu Chức năng (Functional Requirements)

### FR-01: Xem Danh mục & Menu Sản phẩm
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Khách hàng có thể xem danh sách tất cả các sản phẩm đồ uống đang kinh doanh, được gom nhóm theo danh mục (`COFFEE`, `TEA`, `SIGNATURE`). Mỗi sản phẩm hiển thị: Tên món, hình ảnh đại diện, giá cơ bản (Size tiêu chuẩn), mô tả ngắn gọn và trạng thái còn hàng (`isAvailable`, `stock`).
- **Tiêu chí chấp nhận (Acceptance Criteria):**
  1. API `GET /api/v1/products` trả về mã HTTP 200 kèm danh sách sản phẩm theo định dạng JSON chuẩn.
  2. Sản phẩm hết hàng (`stock <= 0` hoặc `isAvailable = false`) được đánh dấu nhãn "Hết hàng" (Sold Out) và không cho phép khách bấm nút thêm vào giỏ.
  3. Hỗ trợ lọc theo danh mục (`category`) qua query parameter, ví dụ `GET /api/v1/products?category=TEA`.

### FR-02: Xem Chi tiết Sản phẩm & Tùy chọn Kèm theo
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Khách hàng bấm vào một sản phẩm để xem trang/modal chi tiết, bao gồm: thông tin mô tả chi tiết, lựa chọn Size (Nhỏ - S, Vừa - M, Lớn - L) kèm phụ thu giá từng size, danh sách Topping khả dụng (Trân châu trắng, Thạch nha đam, Kem cheese, Sương sáo...) kèm đơn giá từng loại.
- **Tiêu chí chấp nhận (Acceptance Criteria):**
  1. API `GET /api/v1/products/:id` trả về thông tin đầy đủ của sản phẩm cùng mảng `sizes` và mảng `toppings`.
  2. Nếu truyền `id` không tồn tại, API trả về HTTP 404 Not Found với thông báo lỗi rõ ràng `{ "statusCode": 404, "message": "Product not found" }`.
  3. Giá tạm tính trên giao diện tự động nhảy cộng thêm ngay khi khách hàng tick chọn size hoặc topping.

### FR-03: Quản lý Tồn kho Sản phẩm (Inventory Check)
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Hệ thống quản lý số lượng tồn kho (`stock`) của từng sản phẩm. Khi khách đặt hàng thành công, số lượng tồn kho phải được trừ tương ứng. Khi tồn kho bằng 0, hệ thống tự động cập nhật trạng thái hết hàng.
- **Tiêu chí chấp nhận (Acceptance Criteria):**
  1. Hàm kiểm tra tồn kho phía backend từ chối đơn hàng với mã HTTP 400 Bad Request nếu số lượng yêu cầu vượt quá số lượng còn lại trong kho.
  2. Việc trừ tồn kho phải được thực hiện nguyên tử (atomic) trong cùng Database Transaction với việc tạo đơn hàng.

---

## 2. Yêu cầu Phi Chức năng (Non-Functional Requirements)

### NFR-01: Hiệu năng Truy vấn Danh mục (Catalog Latency)
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Thời gian phản hồi của API `GET /api/v1/products` phải đạt dưới 200ms với 50 concurrent requests.
- **Tiêu chí chấp nhận:** Đo lường qua kịch bản kiểm thử tải, response time phân vị P95 <= 200ms.

### NFR-02: Tính Toàn vẹn Dữ liệu Danh mục (Data Integrity)
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Giá sản phẩm, size và topping lưu trữ dưới dạng số nguyên (VND, không có phần thập phân) hoặc kiểu `DECIMAL(10,2)` để tránh sai số dấu phẩy động.
- **Tiêu chí chấp nhận:** Đơn vị tiền tệ chuẩn hóa toàn hệ thống theo VND (Việt Nam Đồng).
