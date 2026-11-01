# BẢNG PROJECT BOARD & PRODUCT BACKLOG (45 ISSUES & 89 VIỆC CON)

> **Người thực hiện:** TV6 (Frontend – Checkout & Orders)  
> **Mã công việc:** I-02 (R-03, R-04) | **Reviewer:** TV5  
> **Định dạng:** GitHub Project Board V2 (Cột: `Todo` -> `Doing` -> `Review` -> `Done`)  

---

## 1. Quy ước Vận hành GitHub Project Board

### 1.1. Luồng Trạng thái (Workflow Columns)
1. **Todo**: Các issue đã được đặc tả, có đầy đủ checklist việc con, phân công Assignee và Reviewer.
2. **Doing**: Issue đang có nhánh làm việc (`docs/...` hoặc `feature/...`) và commit đang được đẩy lên.
3. **Review**: Pull Request đã được mở, CI chạy tự động, đang chờ Reviewer duyệt chéo theo ma trận.
4. **Done**: PR đã được approve và merge vào nhánh `main`, tất cả tiêu chí Definition of Done (DoD) được thỏa mãn.

### 1.2. Vòng Review Chéo Bắt Buộc (Cross-Review Matrix)
- **TV1 (Tech Lead / DevOps)** ➔ Được duyệt bởi: **TV2**
- **TV2 (Backend – Auth & User)** ➔ Được duyệt bởi: **TV3**
- **TV3 (Backend – Catalog)** ➔ Được duyệt bởi: **TV4**
- **TV4 (Backend – Order & Payment)** ➔ Được duyệt bởi: **TV1**
- **TV5 (Frontend – Menu & Cart)** ➔ Được duyệt bởi: **TV6**
- **TV6 (Frontend – Checkout & Orders)** ➔ Được duyệt bởi: **TV5**

### 1.3. Definition of Done (DoD) Toàn Dự Án
1. Mã nguồn / tài liệu được merge vào nhánh chính `main` thông qua Pull Request, có ít nhất 01 phê duyệt từ Reviewer quy định.
2. Pipeline CI chạy hoàn toàn Xanh: `Install` ➔ `Lint` ➔ `Unit Test` ➔ `Build`.
3. Có test tự động bao phủ nghiệp vụ (Unit test, Component test, Integration test hoặc E2E test).
4. Thỏa mãn 100% tiêu chí checklist trong từng Issue.
5. Không để lộ Secret/Token/Password/DB URL thật vào repository hay log CI.
6. Sơ đồ PlantUML `.puml` và ảnh render `.svg` được cập nhật đồng bộ trong `docs/diagrams/`.
7. Các dòng tương ứng trong `docs/traceability-matrix.md` được điền đầy đủ.
8. Có thể chạy local ổn định thông qua `docker-compose up` hoặc README.

---

## 2. Bảng Danh sách 45 Issues Chi tiết (Khớp 100% từ I-01 đến I-45)

| ID | Sprint | Assignee | Reviewer | MoSCoW | SP | Labels | Tên Issue & Nhiệm vụ chính | Các việc con | Trạng thái |
|---|---|---|---|---|---|---|---|---|---|
| **I-01** | Sprint 0 | TV1 | TV2 | Must | 3 | `devops` | Tạo repo, cấu trúc thư mục, .gitignore, .env.example | R-01, R-02 | Done |
| **I-02** | Sprint 0 | TV6 | TV5 | Must | 4 | `docs` | README, quy ước commit/branch, DoD, PR template, issue board | R-03, R-04 | Done |
| **I-03** | Sprint 0 | TV3 | TV4 | Must | 5 | `docs` | Context & scope + SRS phần menu/chi tiết sản phẩm | D-01, D-02 | Done |
| **I-04** | Sprint 0 | TV5 | TV6 | Must | 2 | `docs` | SRS phần giỏ hàng và giao diện | D-04 | Done |
| **I-05** | Sprint 0 | TV4 | TV1 | Must | 2 | `docs` | SRS phần đặt đơn và thanh toán | D-05 | Done |
| **I-06** | Sprint 0 | TV1 | TV2 | Must | 1 | `docs` | NFR khả năng triển khai (CI/CD, Docker, health, log) | D-07 | Done |
| **I-07** | Sprint 0 | TV2 | TV3 | Must | 5 | `docs` | SRS xác thực/bảo mật + hợp nhất SRS + use-case diagram tổng quát | D-03, D-08 | Done |
| **I-08** | Sprint 0 | TV1 | TV2 | Must | 7 | `docs` | Mô tả kiến trúc, chốt nền tảng triển khai, deployment diagram, ADR 001 | D-13, D-14, D-20 | Done |
| **I-09** | Sprint 0 | TV4 | TV1 | Must | 9 | `docs` | Đặc tả use-case Đặt/thanh toán + sequence diagram + ADR 004 (3 PRs) | D-09, D-11, D-17 | Done |
| **I-10** | Sprint 0 | TV5 | TV6 | Must | 4 | `docs` | Activity diagram + ADR 005 (2 PRs) | D-10, D-18 | Done |
| **I-11** | Sprint 0 | TV3 | TV4 | Must | 4 | `docs` | Class diagram + ADR 003 (2 PRs) | D-12, D-16 | Done |
| **I-12** | Sprint 0 | TV2 | TV3 | Must | 1 | `docs` | ADR 002: JWT và bảo mật | D-15 | Done |
| **I-13** | Sprint 0 | TV6 | TV5 | Must | 4 | `docs` | SRS lịch sử/trạng thái/hiệu năng/khả dụng + ADR 006 kiểm thử + khung ma trận truy vết (2 PRs) | D-06, D-19, D-21 | Done |
| **I-14** | Sprint 1 | TV1 | TV2 | Must | 9 | `devops`, `backend` | Khung NestJS, config, PostgreSQL, migration, Dockerfile | S1-07, S1-08, S1-09 | Done |
| **I-15** | Sprint 1 | TV1 | TV2 | Must | 4 | `devops` | CI (Install -> Lint -> Unit Test -> Build) + branch protection | S1-14, S1-06 | Done |
| **I-16** | Sprint 1 | TV2 | TV3 | Must | 6 | `backend` | Khung auth, entity User, API đăng ký (hash pass, validation) | S1-20, S2-01 | Done |
| **I-17** | Sprint 1 | TV2 | TV3 | Must | 6 | `backend` | API đăng nhập, JWT, role guard (customer/staff) | S2-02, S2-03 | Done |
| **I-18** | Sprint 1 | TV2 | TV3 | Must | 1 | `test` | PR cố tình lỗi: minh chứng pipeline đỏ và xanh | S1-19 | Done |
| **I-19** | Sprint 1 | TV3 | TV4 | Must | 7 | `backend`, `devops` | Entity Product/Size/Topping, migration, seed, script DB reset 1 lệnh | S1-10, S1-11, S2-30 | Done |
| **I-20** | Sprint 1 | TV3 | TV4 | Must | 8 | `backend`, `test` | API GET /products, GET /products/:id, Swagger, unit test | S1-12, S1-13, S1-15, S1-24 | Done |
| **I-21** | Sprint 2 | TV3 | TV4 | Must | 5 | `backend` | API size/topping và quản lý tồn kho | S2-06, S2-08 | Done |
| **I-22** | Sprint 1 | TV4 | TV1 | Must | 8 | `backend` | Entity Order/OrderItem/Payment, POST /orders (transaction trừ tồn kho) | S1-21, S2-10 | Done |
| **I-23** | Sprint 1 | TV4 | TV1 | Must | 5 | `backend` | Validate đơn và GET /orders (lịch sử cá nhân), GET /orders/:id | S2-11, S2-14 | Done |
| **I-24** | Sprint 1 | TV5 | TV6 | Must | 8 | `frontend`, `test` | Khung Next.js mobile-first, màn hình menu (loading/empty/error), component test | S1-16, S1-17, S1-18 | Done |
| **I-25** | Sprint 1 | TV5 | TV6 | Must | 3 | `frontend` | UI chi tiết sản phẩm: chọn size/topping, tính giá phản ứng | S2-17 | Done |
| **I-26** | Sprint 1 | TV6 | TV5 | Must | 8 | `frontend` | UI đăng ký/đăng nhập, nối API, route guard | S1-22, S2-21, S2-22 | Done |
| **I-27** | Sprint 1 | TV6 | TV5 | Must | 3 | `docs` | Rà soát docs/ + Biên bản Sprint 1 Review và Retrospective | S1-05, S1-23 | Done |
| **I-28** | Sprint 2 | TV1 | TV2 | Must | 6 | `devops` | docker-compose + CI chạy Postgres service | S2-28, S2-41 | Done |
| **I-29** | Sprint 2 | TV1 | TV2 | Must | 5 | `devops` | Dựng production: web, API, DB private, HTTPS | S2-31 | Done |
| **I-30** | Sprint 2 | TV1 | TV2 | Must | 5 | `devops` | CD: build image tag SHA, push registry | S2-33 | Done |
| **I-31** | Sprint 2 | TV1 | TV2 | Must | 5 | `devops` | Deploy tự động, migration an toàn, dừng pipeline khi lỗi | S2-34 | Done |
| **I-32** | Sprint 2 | TV2 | TV3 | Must | 3 | `test`, `backend` | Unit test auth + seed tài khoản demo (customer & staff) | S2-04, S2-42 | Done |
| **I-33** | Sprint 2 | TV2 | TV3 | Must | 4 | `backend`, `test` | GET /health, structured logging, smoke test script | S2-29, S2-35 | Done |
| **I-34** | Sprint 2 | TV2 | TV3 | Must | 5 | `devops`, `docs` | Quản lý secrets, docs/deployment.md, diễn tập rollback | S2-32, S2-36, S2-44 | Done |
| **I-35** | Sprint 2 | TV2 | TV3 | Could | 5 | `backend` | Module Promotion + LoyaltyTransaction (tối giản) | S2-05 | Done |
| **I-36** | Sprint 2 | TV3 | TV4 | Must | 6 | `backend` | Tính giá phía server + API staff đổi trạng thái đơn | S2-07, S2-09 | Done |
| **I-37** | Sprint 2 | TV4 | TV1 | Must | 8 | `backend` | Payment mô phỏng Ví/Thẻ + Idempotency-Key chống thanh toán lặp | S2-12, S2-13 | Done |
| **I-38** | Sprint 2 | TV4 | TV1 | Must | 8 | `test` | Unit test order/payment + Integration test (DB test thật) | S2-15, S2-16 | Done |
| **I-39** | Sprint 2 | TV5 | TV6 | Must | 9 | `frontend`, `test` | Giỏ hàng, validate frontend, component test giỏ hàng | S2-18, S2-19, S2-20 | Done |
| **I-40** | Sprint 2 | TV5 | TV6 | Should | 6 | `frontend` | PWA (manifest, service worker) + màn hình staff đổi trạng thái đơn | S2-26, S2-43 | Done |
| **I-41** | Sprint 2 | TV5 | TV6 | Must | 3 | `docs` | Video demo kịch bản luồng end-to-end trên production | S2-39 | Done |
| **I-42** | Sprint 2 | TV6 | TV5 | Must | 5 | `frontend` | UI checkout + thanh toán (Ví/Thẻ, idempotency, retry) | S2-23 | Done |
| **I-43** | Sprint 2 | TV6 | TV5 | Must | 5 | `frontend` | Màn hình xác nhận/theo dõi đơn + lịch sử đơn hàng | S2-24, S2-25 | Done |
| **I-44** | Sprint 2 | TV6 | TV5 | Must | 5 | `test` | E2E test tự động: menu -> giỏ -> login -> checkout -> xác nhận đơn | S2-27 | Done |
| **I-45** | Sprint 2 | TV6 | TV5 | Must | 7 | `docs` | Hoàn thiện traceability matrix, README, release notes + Sprint 2 Review/Retro | S2-37, S2-38, S2-40 | Done |
