# BREWLITE – HỆ THỐNG ĐẶT ĐỒ UỐNG TỰ PHỤC VỤ THÔNG MINH
## ASSIGNMENT 2: REQUIREMENTS TO DEPLOYMENT (CÔNG NGHỆ PHẦN MỀM)

[![CI Pipeline](https://github.com/brewlite/brewlite/actions/workflows/ci.yml/badge.svg)](https://github.com/brewlite/brewlite/actions/workflows/ci.yml)
[![CD Pipeline](https://github.com/brewlite/brewlite/actions/workflows/cd.yml/badge.svg)](https://github.com/brewlite/brewlite/actions/workflows/cd.yml)
[![Release Version](https://img.shields.io/badge/Release-v1.0.0-teal.svg)](https://github.com/brewlite/brewlite/releases/tag/v1.0.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Môn học:** Công nghệ Phần mềm  
> **Đề tài:** BrewLite – Chuỗi cửa hàng Cà phê & Trà tự phục vụ (Mobile-first PWA)  
> **Công nghệ bắt buộc:** Next.js (Mobile-first/PWA), NestJS, PostgreSQL và Docker  
> **Học kỳ:** I – Năm học 2026–2027 | Trường Đại học Sài Gòn  

---

## 1. Đường Dẫn Triển Khai Thực Tế (Production URLs)

- 🌐 **Web PWA (Frontend):** [https://brewlite.up.railway.app](https://brewlite.up.railway.app) (HTTPS)
- 🔌 **REST API (Backend):** [https://api-brewlite.up.railway.app/api/v1](https://api-brewlite.up.railway.app/api/v1) (HTTPS)
- 📖 **Swagger OpenAPI Hợp đồng:** [https://api-brewlite.up.railway.app/docs](https://api-brewlite.up.railway.app/docs)
- 🩺 **Health Check Endpoint:** [https://api-brewlite.up.railway.app/api/v1/health](https://api-brewlite.up.railway.app/api/v1/health)
- 🔒 **Cơ sở dữ liệu Production:** PostgreSQL Private Network (`postgres.internal:5432` - Không mở cổng public ra Internet).

---

## 2. Phân Công Thành Viên & Vòng Review Chéo (Team Roster & Cross-Review)

Mỗi thành viên đảm nhiệm trọn vẹn từ viết tài liệu / vẽ sơ đồ (Task 1–3) đến code và kiểm thử tự động (Task 4–5):

| TV | Họ và tên | Vai trò chính | Người duyệt PR | Phân hệ phụ trách (Task 1–3 & Task 4–5) |
|---|---|---|---|---|
| **TV1** | *(Điền tên TV1)* | **Tech Lead / DevOps** | **TV2** | • Hạ tầng repo, Dockerfile, docker-compose, CI/CD Pipeline (I-01, I-14, I-15, I-28, I-29, I-30, I-31)<br>• NFR khả năng triển khai (I-06), Kiến trúc tổng thể C4 + ADR 001 + Deployment diagram (I-08). |
| **TV2** | *(Điền tên TV2)* | **Backend – Auth & User** | **TV3** | • Module Auth, User entity, API Đăng ký/Đăng nhập, JWT & Role Guard (I-16, I-17, I-32)<br>• SRS xác thực & Hợp nhất SRS + Use-case diagram (I-07), ADR 002 (I-12), PR cố tình lỗi CI (I-18), Health Check & Logging (I-33), Quản lý Secret & Rollback (I-34), Promotion/Loyalty (I-35). |
| **TV3** | **Đỗ Hoàng Vinh** | **Backend – Catalog** | **TV4** | • Entity Product/Size/Topping, Seed dữ liệu, API Menu & Chi tiết (I-19, I-20, I-21)<br>• Context & Scope + SRS Menu (I-03), Class diagram domain + ADR 003 (I-11), Script tái tạo DB 1 lệnh (I-19), Tính giá phía server & API Staff đổi trạng thái đơn (I-36). |
| **TV4** | **Nguyễn Văn Tài** | **Backend – Order & Payment** | **TV1** | • Entity Order/OrderItem/Payment, POST /orders trong Transaction trừ kho (I-22, I-23)<br>• SRS Đặt & thanh toán (I-05), Đặc tả Use-case trọng tâm + Sequence diagram + ADR 004 (I-09), Payment mô phỏng Ví/Thẻ + Idempotency-Key (I-37), Unit & Integration test (I-38). |
| **TV5** | *(Điền tên TV5)* | **Frontend – Menu & Cart** | **TV6** | • Khung Next.js mobile-first, Màn hình Menu (Loading/Empty/Error) (I-24)<br>• SRS Giỏ hàng (I-04), Activity diagram + ADR 005 (I-10), UI Chi tiết chọn size/topping (I-25), Giỏ hàng & Component tests (I-39), Cấu hình PWA & Màn hình Barista (I-40), Video Demo script (I-41). |
| **TV6** | *(Điền tên TV6)* | **Frontend – Checkout & Orders** | **TV5** | • UI Đăng ký/Đăng nhập & Route Guard (I-26), UI Checkout + Idempotency + Retry (I-42)<br>• README, DoD, PR template, Board 45 issues (I-02), SRS Lịch sử/Hiệu năng + ADR 006 (I-13), Màn hình Xác nhận/Theo dõi thời gian thực (I-43), E2E test (I-44), Traceability matrix & Release notes (I-45). |

---

## 3. Cấu Trúc Mã Nguồn Monorepo (Repository Layout)

```
brewlite/
|-- apps/
|   |-- web/                     # Frontend Next.js 14 App Router, Mobile-first, PWA
|   |   |-- src/app/             # Routes: /menu, /cart, /checkout, /orders, /auth, /staff
|   |   |-- src/components/      # UI Kit: ProductCard, DetailModal, Skeleton, Alerts
|   |   |-- src/context/         # CartContext (LocalStorage sync), AuthContext
|   |   |-- public/              # manifest.json, sw.js (PWA service worker)
|   |   `-- Dockerfile           # Multi-stage container build cho Web
|   `-- api/                     # Backend NestJS Framework, TypeORM, PostgreSQL
|       |-- src/modules/         # auth, products, orders, payments, promotions, health
|       |-- src/common/          # guards (JWT, Roles), interceptors (logging), filters
|       |-- src/database/        # data-source.ts, migrations, seeds/seed.ts
|       |-- scripts/             # db-reset.js (1 lệnh), smoke-test.js
|       `-- Dockerfile           # Multi-stage container build cho API
|-- docs/
|   |-- requirements/            # Task 1: context-and-scope.md, SRS, đặc tả use-case
|   |-- diagrams/                # Task 2 & 3: PlantUML (.puml) và ảnh kết xuất (.svg)
|   |-- architecture/            # Task 3: Mô tả kiến trúc C4, ADR 001 -> ADR 006
|   |-- sprint-reviews/          # Biên bản Sprint 1 & Sprint 2 Review & Retrospective
|   |-- traceability-matrix.md   # Ma trận truy vết 100% FR-01..15, NFR-01..15
|   |-- deployment.md            # Hướng dẫn deploy, secret, và biên bản diễn tập rollback
|   |-- ci-evidence.md           # Minh chứng CI chạy đỏ (chặn merge) và chạy xanh
|   `-- video-demo-script.md     # Kịch bản quay video demo production
|-- tests/                       # Task 5: Kiểm thử End-to-End (E2E) tự động
|-- .github/workflows/
|   |-- ci.yml                   # CI: Install -> Lint -> Unit Test -> Integration Test -> Build
|   `-- cd.yml                   # CD: Build Image SHA -> Push Registry -> Deploy -> Smoke Test
|-- docker-compose.yml           # Khởi chạy toàn bộ hệ thống Web + API + DB ở local
|-- .env.example                 # Mẫu biến môi trường an toàn (không lộ secret)
`-- README.md                    # Tài liệu hướng dẫn bàn giao chính thức
```

---

## 4. Hướng Dẫn Cài Đặt & Chạy Hệ Thống Ở Môi Trường Local

### Cách 1: Khởi chạy 1 lệnh duy nhất bằng Docker Compose (Khuyến nghị)
Yêu cầu: Đã cài đặt Docker & Docker Compose.
```bash
# 1. Clone kho mã nguồn về máy
git clone https://github.com/brewlite/brewlite.git
cd brewlite

# 2. Khởi tạo biến môi trường từ file mẫu
cp .env.example .env

# 3. Khởi động toàn bộ 3 dịch vụ (Web + API + PostgreSQL)
docker compose up --build
```
Truy cập:
- Frontend Web: `http://localhost:3000`
- Backend API: `http://localhost:3001/api/v1`
- Swagger Documentation: `http://localhost:3001/docs`

---

### Cách 2: Khởi chạy trực tiếp bằng Node.js / npm Workspaces

Yêu cầu: Node.js >= 20.0.0, PostgreSQL đang chạy tại cổng 5432.

```bash
# 1. Cài đặt dependencies sạch cho toàn bộ monorepo
npm ci

# 2. Tái tạo database và nạp dữ liệu mẫu chỉ với 1 lệnh (TV3: S2-30)
npm run db:reset

# 3. Khởi chạy đồng thời cả API Backend và Web Frontend
npm run dev
```

---

## 5. Tài Khoản Dùng Thử & Dữ Liệu Mẫu (Demo Credentials)

Hệ thống đã nạp sẵn dữ liệu mẫu (có nút 1-Click tự điền trên giao diện đăng nhập):

| Vai trò | Email đăng nhập | Mật khẩu mặc định | Quyền hạn trong hệ thống |
|---|---|---|---|
| **Khách hàng (Customer)** | `customer@brewlite.vn` | `Password123!` | Xem menu, đặt hàng, thanh toán, xem lịch sử đơn của mình |
| **Nhân viên Quầy (Staff / Barista)** | `staff@brewlite.vn` | `Password123!` | Truy cập `/staff`, cập nhật trạng thái đơn hàng theo State Machine |
| **Quản trị viên (Admin)** | `admin@brewlite.vn` | `Password123!` | Toàn quyền kiểm trị hệ thống |

---

## 6. Hướng Dẫn Chạy Kiểm Thử Tự Động (Automated Testing)

```bash
# 1. Chạy toàn bộ Unit Tests (Backend Jest + Frontend Jest)
npm test

# 2. Chạy Kiểm thử Tích hợp (Integration Tests)
npm run test:integration

# 3. Chạy Kiểm thử Toàn trình End-to-End (E2E Tests)
npm run test:e2e

# 4. Chạy Kiểm thử Khói sau Triển khai (Smoke Test Script)
npm run smoke:test
```

---

## 7. Quy Trình Triển Khai (CD) & Diễn Tập Rollback

- **Tự động hóa Continuous Delivery (CD)**: Mỗi khi commit mới vào nhánh `main`, GitHub Actions tự động kiểm tra Quality Gate, đóng gói Docker image với nhãn commit SHA (`ghcr.io/brewlite-api:sha-xxxx`), triển khai lên máy chủ Production, chạy migration và thực thi Smoke test.
- **Diễn tập Rollback Thực tế**: Đã diễn tập và ghi biên bản tại `docs/deployment.md`. Khi có sự cố, hệ thống tự động rollback về image tag SHA trước đó trong **2 phút 10 giây** mà không làm mất mát dữ liệu khách hàng.

---

## 8. Nhật Ký Phát Hành – Release Notes v1.0.0

### Phiên bản 1.0.0 (Bàn giao chính thức Assignment 2)
- **Sprint 0**: Hoàn thành 100% tài liệu Task 1–3: Context & Scope, SRS hợp nhất (FR-01..15, NFR-01..15), Đặc tả Use-case trọng tâm, 3 sơ đồ Task 2 (Activity, Sequence, Class), Thiết kế kiến trúc C4, Deployment diagram và 6 ADR (ADR 001 -> ADR 006).
- **Sprint 1**: Dựng khung NestJS, PostgreSQL migration, Dockerfile, GitHub Actions CI Pipeline và Branch protection. Xây dựng phân hệ Menu/Catalog, API `GET /products`, Swagger hợp đồng và màn hình Menu mobile-first xử lý đủ 3 trạng thái.
- **Sprint 2**: Hoàn thiện toàn bộ luồng End-to-End: Giỏ hàng đồng bộ LocalStorage, tạo đơn trong Transaction ACID, thanh toán Ví/Thẻ mô phỏng với `Idempotency-Key` chống trùng, theo dõi đơn polling 5s, dashboard Barista đổi trạng thái đơn, E2E test suite và triển khai Production HTTPS thành công.
