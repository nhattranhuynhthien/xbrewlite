/**
 * BrewLite - Auto Create 45 GitHub Issues Script
 * Author: TV6 (I-02: R-04)
 * Usage:
 *   $env:GITHUB_TOKEN="your_personal_access_token_here"
 *   node scripts/create-github-issues.js
 */

const https = require('https');

const REPO_OWNER = process.env.REPO_OWNER || 'nhattranhuynhthien';
const REPO_NAME = process.env.REPO_NAME || 'xbrewlite';
const TOKEN = process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.error('LỖI: Chưa thiết lập biến môi trường GITHUB_TOKEN!');
  console.log('Cách chạy trên PowerShell:');
  console.log('  $env:GITHUB_TOKEN="ghp_xxxxxxxxxxxx"');
  console.log('  node scripts/create-github-issues.js');
  process.exit(1);
}

const issues = [
  {
    id: 'I-01',
    title: 'I-01: Tạo repo, cấu trúc thư mục, .gitignore, .env.example',
    assignee: 'TV1 (Tech Lead / DevOps)',
    reviewer: 'TV2',
    sprint: 'Sprint-0',
    sp: 3,
    priority: 'Must',
    labels: ['devops', 'Sprint-0'],
    checklist: [
      '(R-01) Tạo repo, cấu trúc apps/web, apps/api, docs, tests, .github/workflows — Cấu trúc khớp mục 9 của đề; mọi thành viên có quyền; giảng viên được mời',
      '(R-02) .gitignore và .env.example (không chứa secret thật) — Clone về chạy được nhờ .env.example; .env bị ignore',
    ],
  },
  {
    id: 'I-02',
    title: 'I-02: README, quy ước commit/branch, DoD, PR template, issue board',
    assignee: 'TV6 (Frontend – Checkout & Orders)',
    reviewer: 'TV5',
    sprint: 'Sprint-0',
    sp: 4,
    priority: 'Must',
    labels: ['docs', 'Sprint-0'],
    checklist: [
      '(R-03) README, quy ước commit, branch strategy, PR template, Definition of Done — README mô tả mục đích + cách chạy local; DoD nằm trong repo',
      '(R-04) Dựng issue board, nạp backlog Sprint 1 và Sprint 2 — Board có cột Todo/Doing/Review/Done; mọi issue có assignee và label',
    ],
  },
  {
    id: 'I-03',
    title: 'I-03: Context & scope + SRS phần menu/chi tiết sản phẩm',
    assignee: 'TV3 (Backend – Catalog)',
    reviewer: 'TV4',
    sprint: 'Sprint-0',
    sp: 5,
    priority: 'Must',
    labels: ['docs', 'Sprint-0'],
    checklist: [
      '(D-01) Viết context-and-scope.md (stakeholder, in/out-of-scope, giả định, ràng buộc, rủi ro) — File docs/requirements/context-and-scope.md có bảng stakeholder, in-scope, out-of-scope, giả định, ràng buộc',
      '(D-02) SRS: FR/NFR nhóm menu và chi tiết sản phẩm (MoSCoW + tiêu chí chấp nhận) — Mỗi FR/NFR có mã, mức MoSCoW, tiêu chí chấp nhận kiểm chứng được',
    ],
  },
  {
    id: 'I-04',
    title: 'I-04: SRS phần giỏ hàng và giao diện',
    assignee: 'TV5 (Frontend – Menu & Cart)',
    reviewer: 'TV6',
    sprint: 'Sprint-0',
    sp: 2,
    priority: 'Must',
    labels: ['docs', 'Sprint-0'],
    checklist: [
      '(D-04) SRS: FR/NFR nhóm giỏ hàng và giao diện — Mỗi FR/NFR có mã, mức MoSCoW, tiêu chí chấp nhận kiểm chứng được',
    ],
  },
  {
    id: 'I-05',
    title: 'I-05: SRS phần đặt đơn và thanh toán',
    assignee: 'TV4 (Backend – Order & Payment)',
    reviewer: 'TV1',
    sprint: 'Sprint-0',
    sp: 2,
    priority: 'Must',
    labels: ['docs', 'Sprint-0'],
    checklist: [
      '(D-05) SRS: FR/NFR nhóm đặt đơn và thanh toán — Mỗi FR/NFR có mã, mức MoSCoW, tiêu chí chấp nhận kiểm chứng được',
    ],
  },
  {
    id: 'I-06',
    title: 'I-06: NFR khả năng triển khai (CI/CD, Docker, health, log)',
    assignee: 'TV1 (Tech Lead / DevOps)',
    reviewer: 'TV2',
    sprint: 'Sprint-0',
    sp: 1,
    priority: 'Must',
    labels: ['docs', 'Sprint-0'],
    checklist: [
      '(D-07) SRS: NFR khả năng triển khai (CI/CD, Docker, health, log) — Mỗi FR/NFR có mã, mức MoSCoW, tiêu chí chấp nhận kiểm chứng được',
    ],
  },
  {
    id: 'I-07',
    title: 'I-07: SRS xác thực/bảo mật + hợp nhất SRS + use-case diagram tổng quát',
    assignee: 'TV2 (Backend – Auth & User)',
    reviewer: 'TV3',
    sprint: 'Sprint-0',
    sp: 5,
    priority: 'Must',
    labels: ['docs', 'Sprint-0'],
    checklist: [
      '(D-03) SRS: FR/NFR nhóm xác thực và bảo mật — Mỗi FR/NFR có mã, mức MoSCoW, tiêu chí chấp nhận kiểm chứng được',
      '(D-08) Hợp nhất SRS + vẽ use-case diagram tổng quát — Mã FR/NFR không trùng, có file .puml và ảnh/SVG của use-case tổng quát',
    ],
  },
  {
    id: 'I-08',
    title: 'I-08: Mô tả kiến trúc, chốt nền tảng triển khai, deployment diagram, ADR 001',
    assignee: 'TV1 (Tech Lead / DevOps)',
    reviewer: 'TV2',
    sprint: 'Sprint-0',
    sp: 7,
    priority: 'Must',
    labels: ['docs', 'Sprint-0'],
    checklist: [
      '(D-13) Mô tả kiến trúc (C4/phân lớp), trade-off, logging/health/config — docs/architecture/ mô tả đủ web, API, DB, payment mô phỏng, lý do chọn',
      '(D-14) ADR 001: monorepo + Docker — docs/architecture/adr/001-monorepo-docker.md',
      '(D-20) Chốt nền tảng triển khai + vẽ UML deployment diagram — Phản ánh đúng nền tảng thật: CDN/web, API container, DB persistent, registry, HTTPS/port, secret, health, log, ranh giới local/CI/prod',
    ],
  },
  {
    id: 'I-09',
    title: 'I-09: Đặc tả use-case Đặt/thanh toán + sequence diagram + ADR 004',
    assignee: 'TV4 (Backend – Order & Payment)',
    reviewer: 'TV1',
    sprint: 'Sprint-0',
    sp: 9,
    priority: 'Must',
    labels: ['docs', 'Sprint-0'],
    checklist: [
      '(D-09) Đặc tả use-case Đặt và thanh toán đơn hàng + use-case diagram phạm vi',
      '(D-11) Sequence diagram checkout (JWT, validate, transaction, alt thanh toán, idempotency) — docs/diagrams/sequence-checkout.puml + .svg',
      '(D-17) ADR 004: transaction đơn hàng + idempotency thanh toán',
    ],
  },
  {
    id: 'I-10',
    title: 'I-10: Activity diagram + ADR 005',
    assignee: 'TV5 (Frontend – Menu & Cart)',
    reviewer: 'TV6',
    sprint: 'Sprint-0',
    sp: 4,
    priority: 'Must',
    labels: ['docs', 'Sprint-0'],
    checklist: [
      '(D-10) Activity diagram luồng end-to-end (có swimlane, hết hàng, chưa đăng nhập, thanh toán lỗi) — Có .puml + ảnh/SVG',
      '(D-18) ADR 005: Next.js PWA, state giỏ hàng, data fetching',
    ],
  },
  {
    id: 'I-11',
    title: 'I-11: Class diagram + ADR 003',
    assignee: 'TV3 (Backend – Catalog)',
    reviewer: 'TV4',
    sprint: 'Sprint-0',
    sp: 4,
    priority: 'Must',
    labels: ['docs', 'Sprint-0'],
    checklist: [
      '(D-12) Class diagram domain (User, Product, Order, OrderItem, Payment, Promotion, LoyaltyTransaction) — Khớp SRS và sequence',
      '(D-16) ADR 003: ORM + schema/migration cho catalog',
    ],
  },
  {
    id: 'I-12',
    title: 'I-12: ADR 002: JWT và bảo mật',
    assignee: 'TV2 (Backend – Auth & User)',
    reviewer: 'TV3',
    sprint: 'Sprint-0',
    sp: 1,
    priority: 'Must',
    labels: ['docs', 'Sprint-0'],
    checklist: [
      '(D-15) ADR 002: JWT và bảo mật — File ADR có bối cảnh, quyết định, hệ quả',
    ],
  },
  {
    id: 'I-13',
    title: 'I-13: SRS lịch sử/trạng thái/hiệu năng/khả dụng + ADR 006 kiểm thử + khung ma trận truy vết',
    assignee: 'TV6 (Frontend – Checkout & Orders)',
    reviewer: 'TV5',
    sprint: 'Sprint-0',
    sp: 4,
    priority: 'Must',
    labels: ['docs', 'Sprint-0'],
    checklist: [
      '(D-06) SRS: FR/NFR lịch sử đơn, quản lý trạng thái, hiệu năng, khả dụng',
      '(D-19) ADR 006: chiến lược kiểm thử (unit/integration/E2E)',
      '(D-21) Khởi tạo traceability-matrix.md (khung + quy ước mã)',
    ],
  },
  {
    id: 'I-14',
    title: 'I-14: Khung NestJS, config, PostgreSQL, migration, Dockerfile',
    assignee: 'TV1 (Tech Lead / DevOps)',
    reviewer: 'TV2',
    sprint: 'Sprint-1',
    sp: 9,
    labels: ['devops', 'backend', 'Sprint-1'],
    checklist: [
      '(S1-07) Dockerfile cho web và api — docker build thành công cho cả hai',
      '(S1-08) Khung NestJS theo module + config module đọc env',
      '(S1-09) Kết nối PostgreSQL + thiết lập migration',
    ],
  },
  {
    id: 'I-15',
    title: 'I-15: CI (Install -> Lint -> Unit Test -> Build) + branch protection',
    assignee: 'TV1 (Tech Lead / DevOps)',
    reviewer: 'TV2',
    sprint: 'Sprint-1',
    sp: 4,
    labels: ['devops', 'Sprint-1'],
    checklist: [
      '(S1-14) Pipeline CI chạy khi mở PR: Install -> Lint -> Unit Test -> Build',
      '(S1-06) Branch protection: PR bắt buộc, cần 1 review, CI phải xanh',
    ],
  },
  {
    id: 'I-16',
    title: 'I-16: Khung auth, entity User, API đăng ký',
    assignee: 'TV2 (Backend – Auth & User)',
    reviewer: 'TV3',
    sprint: 'Sprint-1',
    sp: 6,
    labels: ['backend', 'Sprint-1'],
    checklist: [
      '(S1-20) Khung module auth + entity User + migration',
      '(S2-01) API đăng ký (hash mật khẩu, validate)',
    ],
  },
  {
    id: 'I-17',
    title: 'I-17: API đăng nhập, JWT, role guard',
    assignee: 'TV2 (Backend – Auth & User)',
    reviewer: 'TV3',
    sprint: 'Sprint-1',
    sp: 6,
    labels: ['backend', 'Sprint-1'],
    checklist: [
      '(S2-02) API đăng nhập + phát hành JWT',
      '(S2-03) JWT guard + role guard (customer/staff)',
    ],
  },
  {
    id: 'I-18',
    title: 'I-18: PR cố tình lỗi: minh chứng pipeline đỏ và xanh',
    assignee: 'TV2 (Backend – Auth & User)',
    reviewer: 'TV3',
    sprint: 'Sprint-1',
    sp: 1,
    labels: ['test', 'Sprint-1'],
    checklist: [
      '(S1-19) PR cố tình lỗi để có minh chứng pipeline đỏ; chụp log xanh và đỏ',
    ],
  },
  {
    id: 'I-19',
    title: 'I-19: Entity Product/Size/Topping, migration, seed, script DB reset 1 lệnh',
    assignee: 'TV3 (Backend – Catalog)',
    reviewer: 'TV4',
    sprint: 'Sprint-1',
    sp: 7,
    labels: ['backend', 'devops', 'Sprint-1'],
    checklist: [
      '(S1-10) Entity Product/Size/Topping + migration',
      '(S1-11) Seed dữ liệu mẫu (đồ uống, size, topping)',
      '(S2-30) Script migration/seed tái tạo được database chỉ bằng 1 lệnh',
    ],
  },
  {
    id: 'I-20',
    title: 'I-20: API GET /products, GET /products/:id, Swagger, unit test',
    assignee: 'TV3 (Backend – Catalog)',
    reviewer: 'TV4',
    sprint: 'Sprint-1',
    sp: 8,
    labels: ['backend', 'test', 'Sprint-1'],
    checklist: [
      '(S1-12) API GET /products',
      '(S1-13) API GET /products/:id (404 khi không tồn tại)',
      '(S1-15) Unit test cho products service/controller',
      '(S1-24) Cấu hình Swagger/OpenAPI công bố hợp đồng',
    ],
  },
  {
    id: 'I-21',
    title: 'I-21: API size/topping và quản lý tồn kho',
    assignee: 'TV3 (Backend – Catalog)',
    reviewer: 'TV4',
    sprint: 'Sprint-2',
    sp: 5,
    labels: ['backend', 'Sprint-2'],
    checklist: [
      '(S2-06) Mở rộng GET /products/:id: size, topping, giá phụ thu',
      '(S2-08) Quản lý tồn kho và kiểm tra hết hàng',
    ],
  },
  {
    id: 'I-22',
    title: 'I-22: Entity Order/OrderItem/Payment, POST /orders (transaction)',
    assignee: 'TV4 (Backend – Order & Payment)',
    reviewer: 'TV1',
    sprint: 'Sprint-1',
    sp: 8,
    labels: ['backend', 'Sprint-1'],
    checklist: [
      '(S1-21) Entity Order/OrderItem/Payment + migration + enum trạng thái',
      '(S2-10) POST /orders trong transaction (tạo đơn + trừ tồn kho)',
    ],
  },
  {
    id: 'I-23',
    title: 'I-23: Validate đơn và GET /orders (lịch sử)',
    assignee: 'TV4 (Backend – Order & Payment)',
    reviewer: 'TV1',
    sprint: 'Sprint-1',
    sp: 5,
    labels: ['backend', 'Sprint-1'],
    checklist: [
      '(S2-11) Validate đơn và xử lý hết hàng/dữ liệu sai',
      '(S2-14) GET /orders (lịch sử) và GET /orders/:id',
    ],
  },
  {
    id: 'I-24',
    title: 'I-24: Khung Next.js mobile-first, màn hình menu, component test',
    assignee: 'TV5 (Frontend – Menu & Cart)',
    reviewer: 'TV6',
    sprint: 'Sprint-1',
    sp: 8,
    labels: ['frontend', 'test', 'Sprint-1'],
    checklist: [
      '(S1-16) Khung Next.js mobile-first: layout, API client, theme',
      '(S1-17) Màn hình menu với trạng thái loading/empty/error',
      '(S1-18) Component test cho màn hình menu',
    ],
  },
  {
    id: 'I-25',
    title: 'I-25: UI chi tiết sản phẩm: chọn size/topping',
    assignee: 'TV5 (Frontend – Menu & Cart)',
    reviewer: 'TV6',
    sprint: 'Sprint-1',
    sp: 3,
    labels: ['frontend', 'Sprint-1'],
    checklist: [
      '(S2-17) UI chi tiết sản phẩm: chọn size/topping — Giá hiển thị cập nhật theo lựa chọn',
    ],
  },
  {
    id: 'I-26',
    title: 'I-26: UI đăng ký/đăng nhập, nối API, route guard',
    assignee: 'TV6 (Frontend – Checkout & Orders)',
    reviewer: 'TV5',
    sprint: 'Sprint-1',
    sp: 8,
    labels: ['frontend', 'Sprint-1'],
    checklist: [
      '(S1-22) Khung UI đăng ký/đăng nhập: form component và validation',
      '(S2-21) Nối UI đăng ký/đăng nhập với API, lưu token',
      '(S2-22) Route guard: chưa đăng nhập thì chuyển về login',
    ],
  },
  {
    id: 'I-27',
    title: 'I-27: Rà soát docs/ + Sprint 1 Review và Retrospective',
    assignee: 'TV6 (Frontend – Checkout & Orders)',
    reviewer: 'TV5',
    sprint: 'Sprint-1',
    sp: 3,
    labels: ['docs', 'Sprint-1'],
    checklist: [
      '(S1-05) Rà soát: toàn bộ tài liệu Task 1–3 đã nằm trong docs/ với lịch sử PR',
      '(S1-23) Sprint 1 Review + Retrospective, ghi vào docs/',
    ],
  },
  {
    id: 'I-28',
    title: 'I-28: docker-compose + CI chạy Postgres',
    assignee: 'TV1 (Tech Lead / DevOps)',
    reviewer: 'TV2',
    sprint: 'Sprint-2',
    sp: 6,
    labels: ['devops', 'Sprint-2'],
    checklist: [
      '(S2-28) docker-compose.yml chạy web + api + db ở local',
      '(S2-41) CI chạy integration test với service Postgres',
    ],
  },
  {
    id: 'I-29',
    title: 'I-29: Dựng production: web, API, DB private, HTTPS',
    assignee: 'TV1 (Tech Lead / DevOps)',
    reviewer: 'TV2',
    sprint: 'Sprint-2',
    sp: 5,
    labels: ['devops', 'Sprint-2'],
    checklist: [
      '(S2-31) Dựng môi trường production: web, API, DB không public, HTTPS',
    ],
  },
  {
    id: 'I-30',
    title: 'I-30: CD: build image tag SHA, push registry',
    assignee: 'TV1 (Tech Lead / DevOps)',
    reviewer: 'TV2',
    sprint: 'Sprint-2',
    sp: 5,
    labels: ['devops', 'Sprint-2'],
    checklist: [
      '(S2-33) CD: trigger push/tag -> quality gate -> build image tag SHA -> push registry',
    ],
  },
  {
    id: 'I-31',
    title: 'I-31: Deploy tự động, migration an toàn, dừng pipeline khi lỗi',
    assignee: 'TV1 (Tech Lead / DevOps)',
    reviewer: 'TV2',
    sprint: 'Sprint-2',
    sp: 5,
    labels: ['devops', 'Sprint-2'],
    checklist: [
      '(S2-34) Deploy tự động, migration an toàn, smoke test, dừng pipeline khi lỗi',
    ],
  },
  {
    id: 'I-32',
    title: 'I-32: Unit test auth + seed tài khoản demo',
    assignee: 'TV2 (Backend – Auth & User)',
    reviewer: 'TV3',
    sprint: 'Sprint-2',
    sp: 3,
    labels: ['test', 'backend', 'Sprint-2'],
    checklist: [
      '(S2-04) Unit test auth — Test pass trong CI',
      '(S2-42) Seed tài khoản demo (customer và staff)',
    ],
  },
  {
    id: 'I-33',
    title: 'I-33: GET /health, logging, smoke test',
    assignee: 'TV2 (Backend – Auth & User)',
    reviewer: 'TV3',
    sprint: 'Sprint-2',
    sp: 4,
    labels: ['backend', 'test', 'Sprint-2'],
    checklist: [
      '(S2-29) GET /health và logging có cấu trúc',
      '(S2-35) Smoke test sau triển khai (health + luồng đọc /products)',
    ],
  },
  {
    id: 'I-34',
    title: 'I-34: Quản lý secrets, deployment.md, diễn tập rollback',
    assignee: 'TV2 (Backend – Auth & User)',
    reviewer: 'TV3',
    sprint: 'Sprint-2',
    sp: 5,
    labels: ['devops', 'docs', 'Sprint-2'],
    checklist: [
      '(S2-32) Quản lý secret trong CI/production, rà soát repo và log',
      '(S2-36) docs/deployment.md: quy trình deploy và rollback',
      '(S2-44) Diễn tập rollback trên production trước ngày demo',
    ],
  },
  {
    id: 'I-35',
    title: 'I-35: Promotion + LoyaltyTransaction (tối giản)',
    assignee: 'TV2 (Backend – Auth & User)',
    reviewer: 'TV3',
    sprint: 'Sprint-2',
    sp: 5,
    labels: ['backend', 'Sprint-2'],
    checklist: [
      '(S2-05) Module Promotion + LoyaltyTransaction (tối giản)',
    ],
  },
  {
    id: 'I-36',
    title: 'I-36: Tính giá phía server + API cập nhật trạng thái đơn',
    assignee: 'TV3 (Backend – Catalog)',
    reviewer: 'TV4',
    sprint: 'Sprint-2',
    sp: 6,
    labels: ['backend', 'Sprint-2'],
    checklist: [
      '(S2-07) Tính giá phía server (size + topping x số lượng)',
      '(S2-09) API cập nhật trạng thái đơn (state machine, chỉ staff)',
    ],
  },
  {
    id: 'I-37',
    title: 'I-37: Payment mô phỏng Ví/Thẻ + idempotency',
    assignee: 'TV4 (Backend – Order & Payment)',
    reviewer: 'TV1',
    sprint: 'Sprint-2',
    sp: 8,
    labels: ['backend', 'Sprint-2'],
    checklist: [
      '(S2-12) POST /payments mô phỏng Ví/Thẻ (thành công/thất bại)',
      '(S2-13) Idempotency-Key cho thanh toán',
    ],
  },
  {
    id: 'I-38',
    title: 'I-38: Unit test order/payment + integration test (DB test)',
    assignee: 'TV4 (Backend – Order & Payment)',
    reviewer: 'TV1',
    sprint: 'Sprint-2',
    sp: 8,
    labels: ['test', 'Sprint-2'],
    checklist: [
      '(S2-15) Unit test nghiệp vụ order/payment',
      '(S2-16) Integration test API tạo đơn và thanh toán',
    ],
  },
  {
    id: 'I-39',
    title: 'I-39: Giỏ hàng, validate frontend, component test',
    assignee: 'TV5 (Frontend – Menu & Cart)',
    reviewer: 'TV6',
    sprint: 'Sprint-2',
    sp: 9,
    labels: ['frontend', 'test', 'Sprint-2'],
    checklist: [
      '(S2-18) Giỏ hàng: thêm/sửa/xóa, tính tổng tiền',
      '(S2-19) Validate và hiển thị lỗi ở frontend',
      '(S2-20) Component test giỏ hàng và chi tiết sản phẩm',
    ],
  },
  {
    id: 'I-40',
    title: 'I-40: PWA + màn hình staff cập nhật trạng thái',
    assignee: 'TV5 (Frontend – Menu & Cart)',
    reviewer: 'TV6',
    sprint: 'Sprint-2',
    sp: 6,
    labels: ['frontend', 'Sprint-2'],
    checklist: [
      '(S2-26) PWA: manifest, service worker, cài được lên màn hình',
      '(S2-43) Màn hình staff cập nhật trạng thái đơn (hoặc chốt demo bằng Swagger)',
    ],
  },
  {
    id: 'I-41',
    title: 'I-41: Video demo luồng end-to-end trên production',
    assignee: 'TV5 (Frontend – Menu & Cart)',
    reviewer: 'TV6',
    sprint: 'Sprint-2',
    sp: 3,
    labels: ['docs', 'Sprint-2'],
    checklist: [
      '(S2-39) Quay video/demo luồng end-to-end trên production',
    ],
  },
  {
    id: 'I-42',
    title: 'I-42: UI checkout + thanh toán (Ví/Thẻ, idempotency)',
    assignee: 'TV6 (Frontend – Checkout & Orders)',
    reviewer: 'TV5',
    sprint: 'Sprint-2',
    sp: 5,
    labels: ['frontend', 'Sprint-2'],
    checklist: [
      '(S2-23) UI checkout + chọn Ví/Thẻ + xử lý thành công/thất bại',
    ],
  },
  {
    id: 'I-43',
    title: 'I-43: Màn hình xác nhận/theo dõi đơn + lịch sử đơn',
    assignee: 'TV6 (Frontend – Checkout & Orders)',
    reviewer: 'TV5',
    sprint: 'Sprint-2',
    sp: 5,
    labels: ['frontend', 'Sprint-2'],
    checklist: [
      '(S2-24) Màn hình xác nhận và theo dõi trạng thái đơn',
      '(S2-25) Màn hình lịch sử đơn hàng',
    ],
  },
  {
    id: 'I-44',
    title: 'I-44: E2E: menu -> giỏ -> đăng nhập -> thanh toán -> xác nhận đơn',
    assignee: 'TV6 (Frontend – Checkout & Orders)',
    reviewer: 'TV5',
    sprint: 'Sprint-2',
    sp: 5,
    labels: ['test', 'Sprint-2'],
    checklist: [
      '(S2-27) E2E: menu -> giỏ -> đăng nhập -> thanh toán -> xác nhận đơn',
    ],
  },
  {
    id: 'I-45',
    title: 'I-45: Hoàn thiện traceability matrix, README, release notes + Sprint 2 Review/Retro',
    assignee: 'TV6 (Frontend – Checkout & Orders)',
    reviewer: 'TV5',
    sprint: 'Sprint-2',
    sp: 7,
    labels: ['docs', 'Sprint-2'],
    checklist: [
      '(S2-37) Hoàn thiện traceability-matrix.md (mọi FR có use-case, sơ đồ, API, test)',
      '(S2-38) README: chạy local, test, build, deploy, rollback + release notes + tag version',
      '(S2-40) Sprint 2 Review + Retrospective',
    ],
  },
];

function createIssue(issueData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      title: issueData.title,
      body: `### Mã Issue: ${issueData.id}\n\n` +
        `**Phụ trách:** ${issueData.assignee}\n` +
        `**Duyệt PR (Reviewer):** ${issueData.reviewer}\n` +
        `**Sprint:** ${issueData.sprint} | **Story Points:** ${issueData.sp} SP\n\n` +
        `### Checklist việc con cần hoàn thành:\n` +
        issueData.checklist.map((item) => `- [ ] ${item}`).join('\n') +
        `\n\n---\n*Issue được tạo tự động cho BrewLite Assignment 2.*`,
      labels: issueData.labels,
    });

    const options = {
      hostname: 'api.github.com',
      path: `/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
      method: 'POST',
      headers: {
        'User-Agent': 'BrewLite-Auto-Issue-Creator',
        'Authorization': `token ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Accept': 'application/vnd.github.v3+json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode === 201) {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log(`Đang nạp 45 issues vào repository: https://github.com/${REPO_OWNER}/${REPO_NAME} ...`);
  for (let i = 0; i < issues.length; i++) {
    const item = issues[i];
    try {
      const res = await createIssue(item);
      console.log(`✓ [${i + 1}/45] Tạo thành công Issue #${res.number}: ${item.title}`);
      // Sleep 500ms to avoid GitHub secondary rate limits
      await new Promise((r) => setTimeout(r, 600));
    } catch (err) {
      console.error(`✗ Lỗi khi tạo ${item.id}:`, err.message);
    }
  }
  console.log('\n🎉 ĐÃ NẠP XONG 45 ISSUES VÀO REPO GITHUB!');
}

run();
