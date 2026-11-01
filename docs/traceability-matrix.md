# MA TRẬN TRUY VẾT YÊU CẦU DỰ ÁN BREWLITE
## (Requirements Traceability Matrix - RTM)

> **Người thực hiện:** TV6 (Frontend – Checkout & Orders)  
> **Mã công việc:** I-13 (D-21) & I-45 (S2-37) | **Reviewer:** TV5 (Frontend – Menu & Cart)  
> **Cập nhật lần cuối:** 2026-11-01 (Hoàn thiện 100% toàn bộ chuỗi Task 1 đến Task 5)  

---

## 1. Giới thiệu & Quy ước Đặt mã Truy vết

Ma trận truy vết bảo đảm tính liên kết hai chiều (Bidirectional Traceability) giữa:
- **Yêu cầu (Requirements)**: Mã `FR-xx` (Chức năng) và `NFR-xx` (Phi chức năng)
- **Use-case / User Story**: Mã `UC-xx` hoặc `US-xx`
- **Thiết kế & Sơ đồ UML**: Mã `Activity-01`, `Sequence-01`, `Class-01`, `Deploy-01`, `ADR-xxx`
- **Mã nguồn & API**: Endpoint REST API (`apps/api`) hoặc Component Giao diện (`apps/web`)
- **Kiểm thử tự động (Test)**: Mã test tương ứng trong Unit test, Integration test và E2E test

---

## 2. Bảng Ma trận Truy vết Toàn diện Yêu cầu Chức năng (FR Traceability)

| Mã yêu cầu | Tên Yêu cầu Chức năng | Use-case / User Story | Thiết kế / Sơ đồ / ADR | Code / Component / API | Test ID & File Test | Thành viên Phụ trách |
|---|---|---|---|---|---|---|
| **FR-01** | Xem menu & danh mục đồ uống | US-01: Xem menu danh mục | `Activity-01`, `Class-01`, `ADR-003` | `GET /api/v1/products`<br>`apps/web/src/app/menu/page.tsx` | **UNIT-CAT-01**<br>`products.service.spec.ts` | **TV3** (Catalog) |
| **FR-02** | Xem chi tiết sản phẩm, size, topping | US-02: Tùy chỉnh size & topping | `Activity-01`, `Class-01`, `ADR-003` | `GET /api/v1/products/:id`<br>`ProductDetailModal.tsx` | **UNIT-CAT-02**<br>`product-detail.spec.tsx` | **TV3** (Catalog) |
| **FR-03** | Quản lý tồn kho & kiểm tra hết hàng | UC-08: Kiểm tra tồn kho | `Activity-01`, `Sequence-01`, `Class-01` | `ProductService.checkStock()`<br>`apps/api/src/modules/products` | **UNIT-CAT-03**<br>`inventory.service.spec.ts` | **TV3** (Catalog) |
| **FR-04** | Quản lý giỏ hàng (thêm/sửa/xóa, tổng tiền) | US-03: Thao tác giỏ hàng | `Activity-01`, `ADR-005` | `CartContext.tsx`<br>`apps/web/src/app/cart/page.tsx` | **COMP-CART-01**<br>`cart.spec.tsx` | **TV5** (Cart) |
| **FR-05** | Lưu giữ trạng thái giỏ hàng (LocalStorage) | US-04: Lưu giỏ khi reload | `Activity-01`, `ADR-005` | `useCart.ts` (`localStorage` sync) | **COMP-CART-02**<br>`cart-persistence.spec.tsx`| **TV5** (Cart) |
| **FR-06** | Hỗ trợ PWA & Trải nghiệm Mobile-first | US-05: Cài đặt màn hình chính | `Deploy-01`, `ADR-005` | `apps/web/public/manifest.json`<br>`apps/web/public/sw.js` | **E2E-PWA-01**<br>`pwa-manifest.spec.ts` | **TV5** (Cart) |
| **FR-07** | Tạo đơn hàng trong DB Transaction | UC-06: Đặt hàng tạo đơn | `Activity-01`, `Sequence-01`, `ADR-004` | `POST /api/v1/orders`<br>`OrderService.createOrder()` | **INT-ORD-01**<br>`order-transaction.int-spec.ts`| **TV4** (Order) |
| **FR-08** | Thanh toán đơn hàng mô phỏng (Ví/Thẻ) | UC-07: Thanh toán đơn hàng | `Sequence-01`, `Class-01`, `ADR-004` | `POST /api/v1/payments`<br>`PaymentService.charge()` | **INT-PAY-01**<br>`payment-flow.int-spec.ts` | **TV4** (Payment) |
| **FR-09** | Chống thanh toán trùng (Idempotency) | UC-09: Xử lý Idempotency-Key | `Sequence-01`, `Class-01`, `ADR-004` | Header `Idempotency-Key`<br>`PaymentService.handleKey()` | **UNIT-PAY-02**<br>`payment.service.spec.ts` | **TV4** (Payment) |
| **FR-10** | Đăng ký tài khoản (BCrypt hash) | UC-01: Đăng ký tài khoản | `Activity-01`, `Class-01`, `ADR-002` | `POST /api/v1/auth/register`<br>`apps/web/src/app/auth/register` | **UNIT-AUTH-01**<br>`auth.service.spec.ts` | **TV2** (Auth) |
| **FR-11** | Đăng nhập & cấp JWT Access Token | UC-02: Đăng nhập cấp JWT | `Activity-01`, `Sequence-01`, `ADR-002` | `POST /api/v1/auth/login`<br>`apps/web/src/app/auth/login` | **UNIT-AUTH-02**<br>`auth.service.spec.ts` | **TV2** (Auth) |
| **FR-12** | Phân quyền vai trò RBAC (Customer/Staff)| UC-02, UC-12: Phân quyền vai trò | `Sequence-01`, `ADR-002` | `JwtAuthGuard.ts`, `RolesGuard.ts` | **UNIT-AUTH-03**<br>`roles.guard.spec.ts` | **TV2** (Auth) |
| **FR-13** | Xem lịch sử đơn hàng cá nhân | UC-11: Xem lịch sử đơn | `Class-01`, `ADR-006` | `GET /api/v1/orders`<br>`apps/web/src/app/orders/page.tsx`| **UNIT-ORD-02**<br>`orders.controller.spec.ts` | **TV6** (Checkout) |
| **FR-14** | Theo dõi trạng thái đơn hàng thời gian thực | UC-10: Theo dõi đơn hàng | `Activity-01`, `Sequence-01` | `GET /api/v1/orders/:id`<br>`apps/web/src/app/orders/[id]` | **COMP-TRACK-01**<br>`order-tracking.spec.tsx`| **TV6** (Checkout) |
| **FR-15** | Cập nhật trạng thái đơn (chỉ Staff) | UC-12: Cập nhật trạng thái | `Class-01`, `ADR-002` | `PATCH /api/v1/orders/:id/status`<br>`StaffDashboard.tsx` | **INT-STAFF-01**<br>`staff-order.int-spec.ts` | **TV3 / TV5** |

---

## 3. Bảng Ma trận Truy vết Yêu cầu Phi Chức năng (NFR Traceability)

| Mã NFR | Nội dung Yêu cầu Phi Chức năng | Thiết kế / Kiến trúc | Mã nguồn / Cấu hình thực thi | Minh chứng / Kịch bản Kiểm thử | Thành viên Phụ trách |
|---|---|---|---|---|---|
| **NFR-01** | Độ trễ API Catalog P95 <= 200ms | `Arch-01`, `ADR-003` | Index trên `products.category` | Kịch bản Auto Smoke / Benchmark test | **TV3** (Catalog) |
| **NFR-02** | Toàn vẹn tiền tệ không sai số dấu phẩy động | `Class-01`, `ADR-003` | Kiểu `DECIMAL(10,2)` / số nguyên VND | Kiểm tra kiểu dữ liệu trong Migration TypeORM | **TV3** (Catalog) |
| **NFR-03** | Đầy đủ 3 trạng thái giao diện: Loading/Empty/Error | `ADR-005` | Skeleton, EmptyState, ErrorAlert components | **COMP-UI-01**: `menu-states.spec.tsx` | **TV5** (Menu/Cart) |
| **NFR-04** | Tốc độ tải FCP di động < 1.8s | `ADR-005` | Next.js Server Components, Image Optimization | Báo cáo Lighthouse Audits | **TV5** (Menu/Cart) |
| **NFR-05** | Toàn vẹn ACID khi tạo đơn và trừ kho | `Sequence-01`, `ADR-004` | `QueryRunner` Isolation `READ COMMITTED` | **INT-ORD-01**: Rollback khi thiếu kho | **TV4** (Order) |
| **NFR-06** | SLA API thanh toán 300ms - 800ms | `Sequence-01`, `ADR-004` | Giả lập trễ ngân hàng trong Payment Mock | Integration Test đo execution time | **TV4** (Payment) |
| **NFR-07** | CI Pipeline tự động: Install -> Lint -> Test -> Build | `Deploy-01`, `ADR-006` | `.github/workflows/ci.yml` | Minh chứng 01 lần CI Đỏ & 01 lần CI Xanh | **TV1** (DevOps) |
| **NFR-08** | Chuẩn hóa Dockerfile & docker-compose | `Deploy-01`, `ADR-001` | `Dockerfile`, `docker-compose.yml` | `docker compose up --build` chạy thành công | **TV1** (DevOps) |
| **NFR-09** | Giám sát trạng thái qua GET /api/v1/health | `Deploy-01`, `Arch-01` | `HealthController.ts` ping PostgreSQL | **SMOKE-01**: `apps/api/scripts/smoke-test.js` | **TV1 / TV2** |
| **NFR-10** | Structured Logging & Che dấu Secret | `Arch-01`, `ADR-002` | `LoggingInterceptor.ts` lọc password/secret | Rà soát log đầu ra không chứa credentials | **TV1 / TV2** |
| **NFR-11** | CD tự động, deploy an toàn, diễn tập Rollback | `Deploy-01`, `ADR-001` | `.github/workflows/cd.yml`, `docs/deployment.md` | Biên bản Diễn tập Rollback trên Production | **TV1 / TV2** |
| **NFR-12** | Bảo mật thông tin xác thực (BCrypt, JWT 32+ char) | `Class-01`, `ADR-002` | BCrypt salt 10, biến môi trường `JWT_SECRET` | Unit test so khớp hash, audit repo không secret | **TV2** (Auth) |
| **NFR-13** | Bảo mật Production qua HTTPS & DB Private | `Deploy-01` | Reverse Proxy SSL/TLS, Cổng DB 5432 nội bộ | Kiểm tra URL Production có khóa xanh HTTPS | **TV1 / TV2** |
| **NFR-14** | Độ sẵn sàng Uptime >= 99.0% & Auto-restart | `Deploy-01` | Docker restart policy `unless-stopped` | Kiểm tra service tự phục hồi khi crash | **TV6** (Checkout) |
| **NFR-15** | Tính tiện dụng chuẩn Mobile (Touch Target 44px) | `ADR-005` | Tailwind padding `p-3`, `min-h-[44px]` | Kiểm tra thực tế trên Viewport iPhone 375px | **TV6** (Checkout) |

---

## 4. Chuỗi Kiểm thử End-to-End (E2E Test Flow Coverage)

Kịch bản **E2E-01** (Thực hiện bởi TV6 trong `tests/e2e/order-flow.spec.ts`) bao phủ trọn vẹn chuỗi liên kết:
$$\text{Xem Menu (FR-01, FR-02)} \longrightarrow \text{Thêm Giỏ Hàng (FR-04, FR-05)} \longrightarrow \text{Đăng Nhập (FR-11)} \longrightarrow \text{Đặt Đơn Hàng (FR-07)} \longrightarrow \text{Thanh Toán (FR-08, FR-09)} \longrightarrow \text{Theo Dõi Đơn (FR-14)}$$
