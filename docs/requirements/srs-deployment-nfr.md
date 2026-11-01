# YÊU CẦU PHI CHỨC NĂNG: KHẢ NĂNG TRIỂN KHAI, CI/CD, HEALTH CHECK VÀ LOGGING
## (SRS - Deployability & DevOps Specification)

> **Người thực hiện:** TV1 (Tech Lead / DevOps)  
> **Mã công việc:** I-06 (D-07) | **Reviewer:** TV2 (Backend – Auth & User)  

---

## 1. Yêu cầu Phi Chức năng Khả năng Triển khai (Deployability NFRs)

### NFR-07: Tự động hóa Tích hợp Liên tục (Continuous Integration - CI)
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Mọi Pull Request (PR) mở vào nhánh chính `main` phải tự động kích hoạt workflow GitHub Actions thực thi tuần tự 4 bước:
  1. `Install`: Cài đặt dependencies sạch qua `npm ci`.
  2. `Lint`: Kiểm tra cú pháp và quy chuẩn mã nguồn (ESLint/Prettier).
  3. `Unit Test`: Chạy toàn bộ test tự động (Jest/Vitest).
  4. `Build`: Biên dịch `apps/api` và `apps/web` thành công.
- **Tiêu chí chấp nhận (Acceptance Criteria):**
  1. Bật Branch Protection Rule trên nhánh `main`: Bắt buộc ít nhất 1 code review approve và 100% CI checks chạy xanh mới cho phép merge.
  2. Nếu bất kỳ bước nào trong 4 bước thất bại, PR bị chặn merge ngay lập tức (Minh chứng CI Đỏ).

### NFR-08: Đóng gói Chuẩn Container & Docker Compose
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Hệ thống phải cung cấp `Dockerfile` đa tầng (multi-stage build) độc lập cho cả `apps/web` và `apps/api`, tối ưu kích thước image (< 250MB đối với API), và một tệp `docker-compose.yml` để khởi chạy toàn bộ hệ thống (Web, API, PostgreSQL) tại môi trường local chỉ bằng một lệnh duy nhất.
- **Tiêu chí chấp nhận (Acceptance Criteria):**
  1. Lệnh `docker compose up --build` khởi động thành công 3 service (`web`, `api`, `db`).
  2. Người ngoài nhóm không cần cài đặt Node.js hay PostgreSQL trên máy host vẫn có thể chạy và nghiệm thu sản phẩm.

### NFR-09: Giám sát Trạng thái Hệ thống (Health Check Endpoint)
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Backend cung cấp endpoint `GET /api/v1/health` trả về trạng thái tổng thể của API và kết nối Cơ sở dữ liệu PostgreSQL.
- **Tiêu chí chấp nhận (Acceptance Criteria):**
  1. Khi DB kết nối tốt, trả về HTTP 200 OK với body:
     ```json
     { "status": "ok", "timestamp": "...", "services": { "database": "up" } }
     ```
  2. Khi DB mất kết nối, trả về HTTP 503 Service Unavailable:
     ```json
     { "status": "error", "timestamp": "...", "services": { "database": "down" } }
     ```

### NFR-10: Ghi Log Có Cấu trúc & Bảo mật Log (Structured Logging & Secret Masking)
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Hệ thống backend phải ghi log theo chuẩn JSON/structured format bao gồm timestamp, log level (`INFO`, `WARN`, `ERROR`), route, execution time và status code.
- **Tiêu chí chấp nhận (Acceptance Criteria):**
  1. Tuyệt đối không được ghi các dữ liệu nhạy cảm (mật khẩu người dùng dạng rõ, JWT secret, số thẻ ngân hàng đầy đủ, DB credentials) vào file log hoặc console log.

### NFR-11: Tự động hóa Triển khai (Continuous Delivery - CD) & Rollback
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Khi có commit mới hoặc release tag trên `main`, pipeline CD tự động đóng gói Docker image với tag là Git commit SHA, deploy lên máy chủ Production, chạy migration an toàn, thực thi script smoke test để nghiệm thu. Nếu smoke test thất bại, hệ thống tự động rollback về phiên bản trước đó.
- **Tiêu chí chấp nhận (Acceptance Criteria):**
  1. Có tài liệu hướng dẫn quy trình deploy và quy trình rollback chi tiết trong `docs/deployment.md`.
  2. Có biên bản diễn tập rollback thực tế (Rollback rehearsal report) trên Production.
