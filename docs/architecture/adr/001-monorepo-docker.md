# ADR 001: LỰA CHỌN CẤU TRÚC MONOREPO VÀ ĐÓNG GÓI DOCKER

> **Người thực hiện:** TV1 (Tech Lead / DevOps)  
> **Mã công việc:** I-08 (D-14) | **Reviewer:** TV2 (Backend – Auth & User)  
> **Trạng thái:** Accepted  
> **Ngày quyết định:** 2026-11-01  

---

## 1. Bối cảnh (Context)
Dự án BrewLite bao gồm 2 thành phần chính: Ứng dụng di động Next.js (`apps/web`) và Máy chủ API NestJS (`apps/api`), kèm theo bộ tài liệu kỹ thuật, sơ đồ UML và kiểm thử tự động. Nhóm gồm 6 thành viên cần phối hợp phát triển song song trong vòng 2 Sprint ngắn. Việc quản lý mã nguồn, chia sẻ hợp đồng giao tiếp (API DTOs, schemas), đồng bộ quy trình CI/CD và triển khai thử nghiệm cần một giải pháp tối ưu hóa năng suất và giảm thiểu ma sát vận hành.

## 2. Quyết định (Decision)
1. **Sử dụng Cấu trúc Monorepo**: Tổ chức toàn bộ dự án trong 1 repository duy nhất sử dụng cơ chế **npm workspaces** với thư mục chuẩn theo đề bài:
   - `apps/web`: Ứng dụng Next.js Mobile-first / PWA.
   - `apps/api`: Máy chủ NestJS, TypeORM, PostgreSQL.
   - `docs/`: Chứa toàn bộ tài liệu yêu cầu, sơ đồ UML (`.puml` và `.svg`), kiến trúc và ma trận truy vết.
   - `tests/`: Kiểm thử tích hợp (Integration) và End-to-End (E2E).
   - `.github/workflows/`: Pipeline CI/CD tự động.
2. **Chuẩn hóa Môi trường bằng Docker**:
   - Viết `Dockerfile` đa tầng (multi-stage build) riêng cho `web` và `api` nhằm tối ưu kích thước image và tách biệt môi trường build/runtime.
   - Sử dụng `docker-compose.yml` để liên kết 3 dịch vụ: `web`, `api`, `postgres` trên cùng một bridge network nội bộ.

## 3. Hệ quả (Consequences)
- **Ưu điểm:**
  - Đồng bộ versioning và mã nguồn giữa FE và BE; dễ dàng xem xét toàn diện thay đổi trong 1 Pull Request.
  - Một bộ công cụ CI/CD tập trung (GitHub Actions) có thể lint, test và build đồng thời cả hai ứng dụng.
  - Người mới (hoặc giảng viên chấm bài) chỉ cần clone 1 repo và gõ `docker compose up` là toàn bộ hệ thống hoạt động đầy đủ.
- **Hạn chế & Biện pháp xử lý:**
  - Kích thước repo lớn hơn; giải quyết bằng cách cấu hình `.gitignore` nghiêm ngặt và cache `node_modules` trong CI.
  - Xung đột commit khi nhiều người cùng sửa file cấu hình gốc; giải quyết bằng cách áp dụng branch protection, PR template và quy ước Conventional Commits.
