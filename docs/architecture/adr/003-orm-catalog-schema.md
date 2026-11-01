# ADR 003: LỰA CHỌN TYPEORM VÀ THIẾT KẾ SCHEMA DANH MỤC SẢN PHẨM

> **Người thực hiện:** TV3 (Đỗ Hoàng Vinh – Backend Catalog)  
> **Mã công việc:** I-11 (D-16 - PR 2) | **Reviewer:** TV4 (Nguyễn Văn Tài)  
> **Trạng thái:** Accepted  
> **Ngày quyết định:** 2026-11-01  

---

## 1. Bối cảnh (Context)
Phân hệ danh mục sản phẩm (Catalog) là nền tảng cốt lõi của BrewLite. Mỗi sản phẩm có nhiều kích cỡ (Size: S, M, L với giá phụ thu khác nhau) và danh sách tùy chọn Topping đa dạng. Mô hình dữ liệu cần đảm bảo:
- Thao tác truy vấn nhanh danh sách sản phẩm.
- Tách biệt rõ ràng giữa giá gốc và giá tùy chọn để tính toán chính xác phía máy chủ.
- Dễ dàng kiểm soát cấu trúc bảng qua các bản migration phiên bản và có script seed dữ liệu mẫu chạy được lặp lại trên database trống.

## 2. Quyết định (Decision)
1. **Lựa chọn TypeORM làm Object-Relational Mapper (ORM)**:
   - TypeORM tích hợp sâu với NestJS qua module `@nestjs/typeorm`.
   - Sử dụng Entity decorator định nghĩa quan hệ rõ ràng: `Product 1 -> N Size`, `Product N <-> N Topping` (thông qua bảng liên kết hoặc cấu trúc trực tiếp), `Order 1 -> N OrderItem`.
   - Áp dụng TypeORM CLI Migration để quản lý schema (tuyệt đối không bật `synchronize: true` trên môi trường Production).
2. **Thiết kế Schema Catalog**:
   - Kiểu dữ liệu tiền tệ: Sử dụng `DECIMAL(10,2)` hoặc số nguyên (VND).
   - Đảm bảo trường `stock` (tồn kho) và `isAvailable` (cờ trạng thái) được cập nhật đồng bộ.
   - Viết script `npm run db:reset` chỉ với 1 lệnh: Tự động chạy migration tạo bảng trống và nạp đầy đủ dữ liệu mẫu (Cà phê Đen, Cà phê Sữa, Trà Đào Cam Sả, Trà Sữa Oolong...) kèm size và topping.

## 3. Hệ quả (Consequences)
- **Ưu điểm:**
  - Định nghĩa thực thể Type-Safe, code clean và dễ bảo trì.
  - Kiểm soát tuyệt đối lịch sử thay đổi lược đồ cơ sở dữ liệu qua các tệp migration trong `apps/api/src/database/migrations/`.
- **Hạn chế & Biện pháp xử lý:**
  - N+1 query khi load quan hệ; giải quyết bằng cách dùng `relations: ['sizes', 'toppings']` hoặc `createQueryBuilder` kết hợp `leftJoinAndSelect`.
