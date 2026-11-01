# BIÊN BẢN SPRINT 1 REVIEW & RETROSPECTIVE
## (Sprint 1 Review & Retrospective Meeting Report)

> **Người ghi biên bản:** TV6 (Frontend – Checkout & Orders)  
> **Thời gian:** Cuối Sprint 1  
> **Thành viên tham dự:** TV1, TV2, TV3, TV4, TV5, TV6 (100% có mặt)  
> **Mã công việc:** I-27 (S1-05, S1-23) | **Reviewer:** TV5 (Frontend – Menu & Cart)  

---

## 1. Mục tiêu Sprint 1 (Sprint 1 Goal)
> *"Tạo nền tảng kỹ thuật, toàn bộ tài liệu Task 1–3 có kiểm soát phiên bản vào docs/, thiết lập CI cơ bản và phát triển phiên bản MVP đầu tiên chạy được cho luồng xem menu."*

---

## 2. Kết quả Đạt được (Sprint 1 Review - Demo & Deliverables)

### 2.1. Các Tạo phẩm Đã Hoàn thành & Merge vào Main
1. **Hạ tầng & DevOps (TV1)**: Khởi tạo cấu trúc monorepo chuẩn, Dockerfile cho web/api, cấu hình NestJS module + PostgreSQL migration (I-14), thiết lập CI Pipeline tự động (I-15).
2. **Quản lý Tài liệu (TV6 & Cả nhóm)**: 100% tài liệu từ D-01 đến D-21 nằm trong `docs/` thông qua Pull Request riêng với lý do thay đổi rõ ràng (S1-05). Khởi tạo khung ma trận truy vết `docs/traceability-matrix.md`.
3. **Backend Catalog (TV3)**: Entity Product/Size/Topping, migration, seed dữ liệu đồ uống thật (I-19); API `GET /products`, `GET /products/:id`, Swagger OpenAPI công bố hợp đồng (I-20).
4. **Frontend Menu (TV5)**: Khung Next.js mobile-first, màn hình Menu xử lý đủ 3 trạng thái Loading/Empty/Error, Component tests (I-24).
5. **Minh chứng CI (TV2)**: PR #18 cố tình lỗi Unit test chứng minh CI đỏ chặn merge và PR khắc phục chạy xanh (I-18).
6. **Làm sớm việc Sprint 2**: TV2 làm khung Auth + API đăng ký/đăng nhập (I-16, I-17); TV4 làm Entity Order/Payment + POST /orders transaction (I-22, I-23); TV5 làm UI chi tiết chọn size/topping (I-25); TV6 làm UI đăng ký/đăng nhập (I-26).

---

## 3. Biên bản Họp Cải tiến (Sprint 1 Retrospective)

### 3.1. What Went Well (Những điểm làm tốt)
- **Quy tắc tuần tự thực hiện chuẩn chỉ**: Hoàn thành tài liệu, sơ đồ UML và ADR trước khi viết code, giúp các thành viên hiểu sâu kiến trúc và tránh việc đập đi làm lại.
- **Vòng review chéo xoay vòng hiệu quả**: Mỗi PR đều có đúng Reviewer chỉ định kiểm tra mã nguồn, không ai tự merge code của chính mình.
- **Chủ động làm sớm việc Sprint 2**: Cả Backend Auth/Order và Frontend UI đều hoàn thành trước một số việc giúp giảm áp lực cho Sprint 2.

### 3.2. What Could Be Improved (Những điểm cần cải thiện)
- **Tốc độ review PR ban đầu**: Ngày đầu tiên việc duyệt PR sơ đồ còn chậm do chờ đợi nhau. Cần ping thông báo qua nhóm chat ngay khi mở PR.
- **Đồng bộ mã lỗi HTTP**: Ban đầu Backend trả về lỗi chưa đồng nhất cấu trúc; nhóm đã thống nhất sử dụng `HttpExceptionFilter` chuẩn hóa JSON trả về.

### 3.3. Action Items cho Sprint 2 (Kế hoạch hành động cụ thể)
1. TV4 hoàn thiện xử lý Idempotency-Key và tích hợp Payment Mocking Service.
2. TV1 cấu hình docker-compose hoàn chỉnh và thiết lập môi trường Production HTTPS.
3. TV5 và TV6 phối hợp hoàn thiện giỏ hàng, thanh toán và màn hình theo dõi đơn thời gian thực.
4. TV2 chuẩn bị script Smoke test và kịch bản diễn tập Rollback.
