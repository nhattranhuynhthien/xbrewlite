# THIẾT KẾ KIẾN TRÚC HỆ THỐNG BREWLITE (C4 & LAYERED ARCHITECTURE)
## (System Architecture Document)

> **Người thực hiện:** TV1 (Tech Lead / DevOps)  
> **Mã công việc:** I-08 (D-13) | **Reviewer:** TV2 (Backend – Auth & User)  

---

## 1. Giới thiệu & Mục tiêu Kiến trúc
Kiến trúc BrewLite được thiết kế nhằm đáp ứng các mục tiêu trọng tâm:
1. **Khả năng phục vụ đa nền tảng di động (Mobile-first PWA)**: Trải nghiệm mượt mà, tải nhanh trên smartphone.
2. **Tính toàn vẹn dữ liệu tài chính & tồn kho**: Đảm bảo ACID khi đặt hàng và tính Idempotent khi thanh toán.
3. **Tính mô-đun hóa cao (Modular Monorepo)**: Dễ dàng mở rộng, kiểm thử độc lập và triển khai tự động qua container Docker.

---

## 2. Mô hình Kiến trúc Phân tầng (Layered Architecture)

Hệ thống được tổ chức thành 4 tầng ranh giới rõ ràng:

```
+-------------------------------------------------------------------+
| 1. PRESENTATION LAYER (apps/web - Next.js 14 App Router, PWA)     |
|    - Pages/Routes: /menu, /cart, /checkout, /orders, /auth/login  |
|    - Components: UI Kit, Tailwind CSS, Skeleton Loaders          |
|    - State Management: Cart Context / LocalStorage Store          |
|    - API Client: Fetch/Axios Wrapper with Interceptors & JWT Auth |
+-------------------------------------------------------------------+
                                  | HTTPS (REST API / JSON)
+-------------------------------------------------------------------+
| 2. API GATEWAY & CONTROLLER LAYER (apps/api - NestJS Framework)   |
|    - Global Filters: HttpExceptionFilter, LoggingInterceptor      |
|    - Security Guards: JwtAuthGuard, RolesGuard (RBAC)             |
|    - Controllers: AuthController, ProductController,              |
|                   OrderController, PaymentController, HealthCtrl  |
+-------------------------------------------------------------------+
                                  | DTOs & Domain Interfaces
+-------------------------------------------------------------------+
| 3. BUSINESS LOGIC & DOMAIN SERVICE LAYER                         |
|    - AuthService (BCrypt, Token Issuance)                         |
|    - ProductService (Stock Check, Catalog Cache)                  |
|    - OrderService (Transaction Management, Server-side Pricing)   |
|    - PaymentService (Mock Adapter, Idempotency-Key Handler)       |
+-------------------------------------------------------------------+
                                  | QueryRunner / Repositories
+-------------------------------------------------------------------+
| 4. DATA PERSISTENCE & INFRASTRUCTURE LAYER                        |
|    - ORM: TypeORM with Type-Safe Entities & Migration Files       |
|    - Relational DB: PostgreSQL 16 (Persistent Volume Mount)       |
|    - Containerization: Docker, Multi-Stage Build, Compose, CI/CD  |
+-------------------------------------------------------------------+
```

---

## 3. Kiến trúc C4 - Mức Container (C4 Container Diagram)

- **Web Application Container (`apps/web`)**: Next.js PWA, render phía client kết hợp server components, phục vụ qua CDN/Node server, giao tiếp với backend qua REST HTTPS.
- **Backend API Container (`apps/api`)**: NestJS runtime, chạy trên Node.js LTS alpine container, chịu trách nhiệm xác thực token, thực thi logic nghiệp vụ và bọc giao dịch DB.
- **Database Container (`postgres`)**: PostgreSQL 16 Alpine, lưu trữ dữ liệu bền vững qua Named Volume, mạng nội bộ (private network bridge) không publish cổng ra ngoài Internet trên môi trường production.
- **Payment Mock Adapter**: Module nằm trong Backend API (hoặc mock gateway bên ngoài) mô phỏng kết quả xử lý ví Momo/ZaloPay và cổng thẻ Napas/Visa với độ trễ từ 300ms - 800ms.

---

## 4. Quản lý Cấu hình, Health Check & Logging

- **Quản lý Cấu hình (Configuration Management)**:
  Sử dụng `@nestjs/config` đọc cấu hình từ biến môi trường (`process.env`). Kiểm tra tính hợp lệ bằng Joi/class-validator khi khởi động service. Không hardcode credentials vào mã nguồn.
- **Giám sát Trạng thái (Health Check Endpoint)**:
  Endpoint `GET /api/v1/health` tự động ping PostgreSQL (`SELECT 1`). Trả về HTTP 200 OK nếu DB hoạt động bình thường, HTTP 503 Service Unavailable nếu mất kết nối DB.
- **Ghi Log có cấu trúc (Structured Logging)**:
  Sử dụng NestJS Built-in Logger / Morgan / Winston với định dạng JSON chuẩn. Che giấu các trường nhạy cảm (`password`, `jwtSecret`, `cardNumber`) trước khi ghi ra stdout/file.

---

## 5. Đánh giá Trade-offs (Ưu điểm, Hạn chế & Quyết định Kỹ thuật)

| Tiêu chí | Lựa chọn của nhóm | Quyết định thay thế | Lý do lựa chọn & Trade-off |
|---|---|---|---|
| **Cấu trúc Repo** | Monorepo (npm workspaces) | Polyrepo (2 repos riêng) | Đơn giản hóa việc chia sẻ types/contracts, quản lý 1 pipeline CI/CD duy nhất, phù hợp với quy mô nhóm 6 thành viên. Đổi lại build thời gian đầu có thể lâu hơn nếu không cache. |
| **Backend Framework** | NestJS | Express thuần | Cung cấp cấu trúc Dependency Injection chuẩn Enterprise, hỗ trợ sẵn Guard, Interceptor, Swagger OpenAPI và TypeORM modules giúp 4 dev backend làm việc độc lập không giẫm chân nhau. |
| **Data Layer** | TypeORM + PostgreSQL | Prisma ORM | TypeORM hỗ trợ `QueryRunner.startTransaction()` và pessimistic locking (`FOR UPDATE`) tường minh, kiểm soát sâu các lệnh SQL migration. |
| **Giao tiếp Dịch vụ** | RESTful HTTP/JSON | gRPC / GraphQL | REST đơn giản, trực quan, hỗ trợ tốt cache HTTP và tích hợp dễ dàng với OpenAPI Swagger cho Frontend mock dữ liệu. |
