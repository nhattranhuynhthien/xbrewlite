# BỐI CẢNH, STAKEHOLDER VÀ PHẠM VI DỰ ÁN BREWLITE
## (Context, Stakeholder, and Scope Document)

> **Người thực hiện:** TV3 (Đỗ Hoàng Vinh – Backend Catalog)  
> **Hỗ trợ rủi ro & ràng buộc:** TV1 (Tech Lead / DevOps)  
> **Mã công việc:** I-03 (D-01) | **Reviewer:** TV4 (Nguyễn Văn Tài)  

---

## 1. Vấn đề Nghiệp vụ (Business Problem)
Chuỗi cửa hàng đồ uống cà phê & trà BrewLite đang đối mặt với các thách thức vận hành:
- **Thời gian chờ đợi tại quầy giờ cao điểm**: Khách hàng phải xếp hàng dài từ 10 - 20 phút để gọi món và thanh toán, gây tỷ lệ bỏ hàng cao (~15%).
- **Sai sót trong đơn hàng thủ công**: Việc ghi nhận tùy chọn (size ly, lượng đường/đá, topping) qua giấy hoặc nói miệng dễ nhầm lẫn (tỷ lệ pha sai ~5%).
- **Nghẽn thanh toán**: Tiền mặt và quẹt thẻ truyền thống tại một máy POS duy nhất gây nghẽn cổ chai.
- **Thiếu tính linh hoạt & cá nhân hóa**: Khách hàng không thể kiểm tra trước tình trạng còn hàng (stock) của món và không theo dõi được đơn đang chuẩn bị hay đã sẵn sàng.

**Giải pháp:** Xây dựng hệ thống đặt đồ uống tự phục vụ **BrewLite** trên nền tảng Web di động (Mobile-first PWA), cho phép khách hàng chủ động quét mã QR, duyệt menu trực quan, tùy chỉnh topping/size, đặt hàng, thanh toán trực tuyến qua Ví/Thẻ điện tử với cơ chế Idempotency chống trừ tiền trùng, và theo dõi tiến trình đơn hàng theo thời gian thực.

---

## 2. Bảng Phân tích Stakeholder (Stakeholder Analysis)

| Stakeholder | Mục tiêu chính | Kỳ vọng đối với BrewLite | Trách nhiệm liên quan |
|---|---|---|---|
| **Khách hàng (Customer)** | Đặt đồ uống nhanh chóng, chính xác, không cần xếp hàng | Giao diện mobile mượt mà, tải nhanh < 1.5s, hiển thị rõ giá/topping/tồn kho, thanh toán an toàn, biết trạng thái đơn hàng | Sử dụng ứng dụng, thanh toán đúng số tiền, nhận hàng đúng giờ |
| **Nhân viên quầy / Pha chế (Staff)** | Tiếp nhận đơn hàng chính xác, phân luồng pha chế tối ưu | Nhận thông tin đơn rõ ràng (size, topping ghi chú), đổi trạng thái đơn dễ dàng (`PENDING` -> `PREPARING` -> `READY` -> `COMPLETED`) | Chuẩn bị đồ uống theo đúng đơn, cập nhật trạng thái đơn lên hệ thống |
| **Quản lý cửa hàng (Manager)** | Tăng doanh số, kiểm soát tồn kho nguyên liệu, giảm thất thoát | Dữ liệu đơn hàng đồng nhất, báo cáo thời gian thực, quản lý danh mục món linh hoạt | Thiết lập giá, cập nhật trạng thái hết hàng của sản phẩm |
| **Giảng viên / Khách hàng nghiệm thu** | Đánh giá năng lực phát triển phần mềm theo chuẩn công nghiệp | Đáp ứng đầy đủ quy trình từ Requirements -> Deployment, sơ đồ khớp mã nguồn, test tự động đạt chuẩn, có môi trường Production thực tế | Nghiệm thu sản phẩm, chấm điểm theo rubric |
| **Nhóm phát triển (Dev Team - TV1..TV6)** | Áp dụng quy trình Agile/Scrum, kiến trúc micro-service/modular monorepo, CI/CD chuẩn | Codebase sạch, tài liệu truy vết 100%, quy ước commit/branch nghiêm ngặt, tự động hóa toàn diện | Phát triển, kiểm thử, triển khai và bảo trì sản phẩm |
| **Cổng thanh toán mô phỏng (Payment Gateway)** | Cung cấp cổng xác thực thanh toán thẻ/ví an toàn | Giao thức truyền tin chuẩn REST, có xác thực bảo mật và cơ chế chống lặp (Idempotency-Key) | Trả về kết quả giao dịch (SUCCESS/FAILED) chính xác |

---

## 3. Phạm vi Dự án (Project Scope)

### 3.1. Phạm vi trong MVP (In-Scope - Bắt buộc thực hiện)
1. **Catalog & Menu**:
   - Duyệt danh mục đồ uống theo nhóm (Coffee, Tea, Signature).
   - Xem chi tiết từng món kèm ảnh, giá cơ bản, mô tả, tình trạng còn/hết hàng.
   - Chọn Size (Nhỏ, Vừa, Lớn) và danh sách Topping (Trân châu trắng, Thạch đào, Kem cheese...) kèm phụ thu tự động tính.
2. **Giỏ hàng (Cart)**:
   - Thêm, sửa số lượng, xóa món trong giỏ hàng.
   - Tự động tính tổng tiền theo công thức: $\text{Tổng} = \sum (\text{Giá gốc} + \text{Phụ thu size} + \sum \text{Topping}) \times \text{Số lượng}$.
   - Giữ trạng thái giỏ hàng khi reload trang (Local Storage).
3. **Xác thực & Người dùng (Auth)**:
   - Đăng ký tài khoản (mật khẩu mã hóa BCrypt), đăng nhập cấp JWT Access Token.
   - Phân quyền RBAC (Role: `CUSTOMER`, `STAFF`). Route guard phía Frontend và Guard phía Backend.
4. **Đặt hàng (Order)**:
   - Tạo đơn hàng được bọc trong PostgreSQL Transaction đảm bảo tính toàn vẹn và trừ tồn kho (Inventory decrement).
   - Kiểm tra tồn kho trước khi chốt đơn.
5. **Thanh toán mô phỏng (Payment)**:
   - Hỗ trợ thanh toán qua Ví điện tử (E-Wallet) và Thẻ quốc tế/nội địa (Card).
   - Sử dụng header `Idempotency-Key` (UUIDv4) để đảm bảo nếu khách ấn 2 lần hoặc lỗi mạng thử lại thì không bị thanh toán trùng.
6. **Lịch sử & Theo dõi đơn hàng**:
   - Màn hình xác nhận đơn và theo dõi trạng thái đơn hàng (polling thời gian thực).
   - Xem lịch sử các đơn hàng đã đặt của tài khoản.
   - Giao diện/API cho Staff cập nhật trạng thái đơn hàng.
7. **Kỹ thuật & DevOps**:
   - Frontend Next.js Mobile-first / PWA.
   - Backend NestJS Modular Architecture, TypeORM/PostgreSQL.
   - CI Pipeline (Lint -> Unit Test -> Build) có DB service thật.
   - CD Pipeline triển khai Dockerized lên Production với HTTPS.

### 3.2. Phạm vi Mở rộng (Extended Scope / Should & Could)
- **Cấu hình PWA hoàn chỉnh**: Web manifest, icon, service worker cache offline cơ bản (Should - TV5).
- **Hệ thống Loyalty & Khuyến mãi (Promotion/Points)**: Mã giảm giá đơn giản, tích điểm thành viên (Could - TV2).
- **Giao diện Staff riêng biệt**: Bảng Kanban kéo thả trạng thái đơn dành cho barista (Should - TV5).

### 3.3. Các nội dung Không thực hiện (Out-of-Scope)
- Không tích hợp với cổng thanh toán tài chính thật bên thứ ba (VNPay, Momo production gateway) để tránh thủ tục pháp lý doanh nghiệp; sử dụng Payment Mocking Service mô phỏng đầy đủ mã giao dịch chuẩn quốc tế.
- Không hỗ trợ định vị GPS shipper hoặc tính phí giao hàng động theo khoảng cách (BrewLite tập trung vào mô hình Pick-up tại quầy và On-premise dine-in).
- Không xây dựng phân hệ quản lý tiền lương, chấm công nhân sự hay ERP kế toán chuyên sâu.

---

## 4. Giả định, Ràng buộc và Rủi ro (Assumptions, Constraints, Risks)

### 4.1. Giả định (Assumptions)
- Khách hàng sử dụng smartphone có kết nối Internet (4G/5G/Wi-Fi) và trình duyệt hiện đại (Chrome, Safari, Edge).
- Nhân viên quầy có máy tính bảng hoặc máy tính POS kết nối cùng hệ thống mạng nội bộ/Internet của quán.

### 4.2. Ràng buộc Kỹ thuật & Nghiệp vụ (Constraints)
- **Công nghệ bắt buộc theo đề bài**: Frontend bắt buộc Next.js (mobile-first), Backend bắt buộc NestJS, Cơ sở dữ liệu bắt buộc PostgreSQL, đóng gói Docker.
- **Quy tắc tuần tự nghiêm ngặt**: Chỉ viết mã nguồn (Task 4-5) sau khi đã hoàn thành và merge tài liệu, sơ đồ UML và ADR (Task 1-3).
- **Bảo mật Production**: Database Production không được mở cổng public (0.0.0.0) ra Internet; Secret/Token/Password tuyệt đối không xuất hiện trong repo hoặc log CI.
- **Thời gian hoàn thành**: 2 Sprint (Sprint 1: Nền tảng + MVP Menu; Sprint 2: Hoàn thiện End-to-End + CI/CD + Delivery).

### 4.3. Phân tích Rủi ro & Biện pháp Giảm thiểu (Risk Matrix)

| ID | Rủi ro tiềm ẩn | Mức độ | Khả năng | Biện pháp giảm thiểu (Mitigation Strategy) |
|---|---|---|---|---|
| **R-01** | Race condition khi nhiều khách cùng đặt món số lượng tồn kho cuối cùng | Cao | Trung bình | Sử dụng DB Transaction kết hợp Pessimistic Locking hoặc Atomic Update (`UPDATE product SET stock = stock - qty WHERE id = :id AND stock >= qty`). |
| **R-02** | Khách ấn nút Thanh toán nhiều lần do mạng chập chờn gây trừ tiền trùng | Rất cao | Cao | Áp dụng cơ chế `Idempotency-Key` bắt buộc trên API `POST /payments`. Nếu key đã xử lý thành công, trả về ngay kết quả đã lưu mà không tạo giao dịch mới. |
| **R-03** | Khác biệt môi trường Local và Production dẫn đến lỗi sau deploy | Cao | Trung bình | Đóng gói toàn bộ ứng dụng bằng Docker và Docker Compose; CI chạy test trên PostgreSQL container thật. |
| **R-04** | Trễ hạn giao hàng do phân rã công việc không đều giữa các thành viên | Trung bình | Trung bình | Xây dựng Product Backlog 45 Issues rõ ràng, quy định review chéo xoay vòng nghiêm ngặt và Definition of Done (DoD) kiểm soát chất lượng từng PR. |
