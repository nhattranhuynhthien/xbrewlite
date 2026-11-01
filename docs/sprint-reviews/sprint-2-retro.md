# BIÊN BẢN SPRINT 2 REVIEW & RETROSPECTIVE
## (Sprint 2 Review & Retrospective Meeting Report)

> **Người ghi biên bản:** TV6 (Frontend – Checkout & Orders)  
> **Thời gian:** Cuối Sprint 2  
> **Thành viên tham dự:** TV1, TV2, TV3, TV4, TV5, TV6 (100% có mặt)  
> **Mã công việc:** I-45 (S2-40) | **Reviewer:** TV5 (Frontend – Menu & Cart)  

---

## 1. Mục tiêu Sprint 2 (Sprint 2 Goal)
> *"Hoàn thành luồng nghiệp vụ end-to-end từ Xem menu -> Giỏ hàng -> Đặt đơn -> Thanh toán -> Theo dõi đơn; tự động hóa đóng gói, kiểm thử tích hợp/E2E và triển khai một phiên bản Production có thể truy cập được qua HTTPS."*

---

## 2. Kết quả Đạt được (Sprint 2 Review - Final Acceptance)

### 2.1. Đánh giá Theo Tiêu chí Nghiệm thu Đề bài
| Tiêu chí đề bài | Hiện trạng bàn giao | Người phụ trách |
|---|---|---|
| **Luồng End-to-End** | Hoàn tất 100%: Xem menu -> Chọn size/topping -> Giỏ hàng -> Đặt đơn trong Transaction -> Thanh toán Ví/Thẻ Idempotent -> Theo dõi trạng thái polling 5s. | Cả nhóm |
| **API Backend & Migration** | Đầy đủ 6 module: Auth, Products, Orders, Payments, Promotions, Health. Script `npm run db:reset` tái tạo DB 1 lệnh. | TV1, TV2, TV3, TV4 |
| **Frontend PWA & Mobile** | Next.js 14 Responsive mobile-first, manifest PWA, màn hình Barista đổi trạng thái đơn. | TV5, TV6 |
| **Kiểm thử Đa tầng** | Unit test Jest, Integration test trên DB test, Component test RTL, E2E test tự động. | TV4, TV5, TV6 |
| **Hạ tầng Docker & CI/CD** | `docker-compose.yml` chạy local 1 lệnh, CI chạy xanh, CD build image tag commit SHA, auto deploy & smoke test. | TV1, TV2 |
| **Bảo mật & Production** | Frontend và API chạy HTTPS, DB private không mở public, không lộ secret trong repo hay log. | TV1, TV2 |
| **Diễn tập Rollback** | Có biên bản diễn tập thành công trên Production với thời gian khôi phục 2 phút 10 giây. | TV2, TV1 |
| **Ma trận truy vết (RTM)** | Hoàn thiện 100% tại `docs/traceability-matrix.md` (FR-01..15, NFR-01..15). | TV6 |

---

## 3. Biên bản Họp Cải tiến & Tổng kết Dự án (Sprint 2 Retrospective)

### 3.1. What Went Well (Thành công nổi bật)
- **Hoàn thành trọn vẹn 45 Issues (89 việc con) không sót bất kỳ việc nào**: Khối lượng công việc lớn được san sẻ đồng đều giữa 6 thành viên theo đúng thế mạnh.
- **Tính ổn định cao của cơ chế Idempotency & Transaction**: Giúp hệ thống không gặp bất kỳ lỗi lệch tiền hay trùng đơn nào trong toàn bộ quá trình kiểm thử tải và demo.
- **Tài liệu truy vết hoàn hảo**: Mọi tính năng đều có use-case, sơ đồ UML, mã nguồn và bài test tương ứng rõ ràng.

### 3.2. Lessons Learned (Bài học kinh nghiệm)
- Tự động hóa CI/CD ngay từ những ngày đầu (từ Sprint 1) giúp phát hiện lỗi xung đột thư viện và lỗi build rất sớm, tránh được tình trạng "nước đến chân mới nhảy" vào ngày cuối.
- Việc thống nhất hợp đồng API thông qua tài liệu Swagger giúp Frontend và Backend có thể code song song hiệu quả mà không bị block lẫn nhau.

### 3.3. Đánh giá Thành viên (Team Assessment)
100% thành viên (TV1, TV2, TV3, TV4, TV5, TV6) hoàn thành xuất sắc nhiệm vụ được giao, đóng góp đầy đủ PR tài liệu, sơ đồ, code backend/frontend, ADR và test tự động.
