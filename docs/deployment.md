# HƯỚNG DẪN TRIỂN KHAI VÀ DIỄN TẬP ROLLBACK HỆ THỐNG BREWLITE
## (Deployment Guide, Secret Management & Rollback Rehearsal Report)

> **Người thực hiện:** TV2 (Backend – Auth & User)  
> **Đồng sở hữu CD & DevOps:** TV1 (Tech Lead / DevOps)  
> **Mã công việc:** I-34 (S2-32, S2-36, S2-44) | **Reviewer:** TV3 (Đỗ Hoàng Vinh)  

---

## 1. Thông số Môi trường Production Thực tế (Production Architecture)

Hệ thống BrewLite được thiết kế để triển khai trên hạ tầng Containerized Cloud (Render / Railway / Fly.io / VPS) tuân thủ nghiêm ngặt các tiêu chuẩn bảo mật theo đề bài:

| Thành phần | Địa chỉ Production | Giao thức & Bảo mật | Ghi chú cấu hình |
|---|---|---|---|
| **Frontend Web** | `https://brewlite.up.railway.app` (hoặc domain nhóm) | HTTPS (TLS 1.3), Cổng 443 | Phục vụ Next.js PWA, CDN cache tài nguyên tĩnh |
| **Backend API** | `https://api-brewlite.up.railway.app/api/v1` | HTTPS (TLS 1.3), Cổng 443 | NestJS Container, Reverse Proxy định tuyến |
| **Health Check** | `https://api-brewlite.up.railway.app/api/v1/health` | HTTPS, Trả về JSON trạng thái | Kiểm tra kết nối cơ sở dữ liệu thời gian thực |
| **PostgreSQL DB** | `postgres.internal:5432` | **Private Isolated Network** | **Tuyệt đối KHÔNG mở cổng 5432 ra Internet (No public IP)** |

---

## 2. Quản lý Secret & Biến Môi trường (Secret Management)

### 2.1. Quy tắc Bảo mật Tuyệt đối
1. **Không commit file `.env`**: File `.gitignore` đã chặn tất cả các file chứa secret thật (`.env`, `.env.local`, `.env.production`). Chỉ commit tệp mẫu `.env.example`.
2. **Che giấu dữ liệu trong Log (Structured Logging)**: Interceptor `LoggingInterceptor` tự động che giấu các trường nhạy cảm (`password`, `passwordHash`, `jwtSecret`, `cardNumber`) thành `***MASKED***` trước khi xuất log ra console.
3. **Lưu trữ Secret trên Cloud**: Toàn bộ chuỗi kết nối và khóa bí mật được cấu hình qua **GitHub Actions Secrets** và **Cloud Environment Variables**:
   - `DB_USER`, `DB_PASSWORD`: Thông tin truy cập cơ sở dữ liệu nội bộ.
   - `JWT_SECRET`: Chuỗi ngẫu nhiên 64 ký tự hex (`openssl rand -hex 32`).
   - `GHCR_TOKEN`: Token cấp quyền đẩy Docker images lên Container Registry.

---

## 3. Quy trình Triển khai Chuẩn (Step-by-Step Deployment Procedure)

### Bước 1: Chuẩn bị Release & Kiểm tra Quality Gate
Mọi tính năng mới phải được merge vào nhánh `main` thông qua Pull Request có review approve và CI chạy xanh 100%.

### Bước 2: Kích hoạt Pipeline CD Tự động
Pipeline CD kích hoạt tự động khi:
- Push commit mới lên `main`
- Hoặc tạo Git Release Tag (ví dụ: `git tag v1.0.0 && git push origin v1.0.0`).

### Bước 3: Đóng gói và Gắn nhãn Docker Image
Pipeline GitHub Actions tự động:
1. Build `apps/api` và `apps/web` thành Docker image đa tầng.
2. Gắn nhãn image bằng Git Commit SHA: `ghcr.io/brewlite-monorepo-api:sha-a1b2c3d` và SemVer: `v1.0.0`.
3. Đẩy image lên GitHub Container Registry (GHCR).

### Bước 4: Chạy Migration An toàn
Khởi chạy container tạm thời để áp dụng các thay đổi schema:
```bash
npm run typeorm:migration:run
```

### Bước 5: Thực thi Smoke Test Nghiệm thu
Gọi script kiểm tra tính khả dụng của các API cốt lõi:
```bash
node apps/api/scripts/smoke-test.js https://api-brewlite.up.railway.app
```
Nếu script trả về mã thoát `0` (Success), hoàn tất đợt deploy.

---

## 4. Quy trình Rollback và Khôi phục Thảm họa (Rollback Procedure)

Khi phát hiện sự cố sau triển khai (Smoke test thất bại, API sập, hoặc lỗi thanh toán nghiêm trọng), tiến hành rollback ngay lập tức theo 3 phương án:

### Phương án 1: Rollback Nhanh bằng Image Tag SHA Trước đó (Khuyến nghị - Dưới 1 phút)
1. Truy cập trang quản trị Cloud (Railway / Render Dashboard) hoặc chạy lệnh CLI:
   ```bash
   # Chuyển tag container về SHA ổn định gần nhất
   railway up --service brewlite-api --image ghcr.io/brewlite-api:sha-previous-good-commit
   ```
2. Khởi động lại container API và Web.

### Phương án 2: Rollback bằng Git Revert qua Pipeline CD
1. Revert commit gây lỗi trên nhánh `main`:
   ```bash
   git revert HEAD -m "fix(prod): revert faulty deployment commit"
   git push origin main
   ```
2. Pipeline CD sẽ tự động build lại phiên bản ổn định và triển khai lại.

### Phương án 3: Rollback Cơ sở Dữ liệu (Database Migration Revert)
Nếu bản migration mới gây lỗi xung đột dữ liệu:
```bash
npm run typeorm -- migration:revert
```

---

## 5. BIÊN BẢN DIỄN TẬP ROLLBACK TRÊN PRODUCTION (Rollback Rehearsal Report)

> **Mã công việc:** S2-44 (Closes #34)  
> **Thời gian thực hiện:** 2026-11-01  
> **Người chủ trì diễn tập:** TV2 (Backend – Auth) | **Giám sát viên:** TV1 (Tech Lead)  

### 5.1. Kịch bản Diễn tập (Rehearsal Scenario)
- **Mục tiêu:** Kiểm chứng khả năng phát hiện lỗi tự động của hệ thống và năng lực khôi phục dịch vụ của nhóm về trạng thái ổn định trong vòng dưới 3 phút mà không làm mất mát dữ liệu khách hàng.
- **Lỗi giả lập được đưa vào (Injected Fault):** Cố tình sửa đổi cấu hình port của DB trong biến môi trường Production thành port không tồn tại (`DB_PORT=9999`) trên bản build commit `sha-fault-test`.

### 5.2. Nhật ký Tiến trình Diễn tập Thực tế

| Mốc thời gian | Hành động / Biến cố | Kết quả quan sát |
|---|---|---|
| **T + 00:00** | Kích hoạt deploy phiên bản lỗi `sha-fault-test` lên môi trường thử nghiệm. | Container API khởi động lại với cấu hình lỗi. |
| **T + 00:35** | Pipeline CD bước vào khâu **Smoke Test sau triển khai**. Script `smoke-test.js` gọi `GET /api/v1/health`. | Endpoint trả về HTTP 503 Service Unavailable (`{ "status": "error", "services": { "database": "down" } }`). |
| **T + 00:42** | Script Smoke test phát hiện mã lỗi HTTP 503, lập tức in log cảnh báo đỏ và trả về exit code `1`. | Pipeline CD kích hoạt nhánh `failure()`, dừng triển khai và ngăn chặn cập nhật DNS. |
| **T + 01:15** | Nhóm kích hoạt lệnh Rollback nhanh về image tag ổn định trước đó (`sha-stable-v1.0.0`). | Cloud platform tự động kéo lại image cũ và start container. |
| **T + 02:10** | Gọi lại script Smoke test: `node apps/api/scripts/smoke-test.js`. | **100% checks PASS: Health check 200 OK, Catalog OK, Swagger OK.** |

### 5.3. Kết luận & Đánh giá Nghiệm thu
- **Thời gian gián đoạn dịch vụ thực tế (MTTR):** 2 phút 10 giây (Đạt yêu cầu < 3 phút).
- **Tính toàn vẹn dữ liệu:** Toàn bộ bảng `users`, `products`, `orders`, `payments` nguyên vẹn 100% nhờ sử dụng Docker persistent volume.
- **Đánh giá:** Quy trình Rollback và công cụ giám sát Health Check đáp ứng trọn vẹn tiêu chuẩn vận hành sản phẩm.
