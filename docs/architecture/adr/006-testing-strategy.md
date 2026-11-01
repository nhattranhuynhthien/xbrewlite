# ADR 006: CHIẾN LƯỢC KIỂM THỬ ĐA TẦNG (UNIT, INTEGRATION, COMPONENT VÀ E2E)

> **Người thực hiện:** TV6 (Frontend – Checkout & Orders)  
> **Mã công việc:** I-13 (D-19 - PR 2) | **Reviewer:** TV5 (Frontend – Menu & Cart)  
> **Trạng thái:** Accepted  
> **Ngày quyết định:** 2026-11-01  

---

## 1. Bối cảnh (Context)
Để đảm bảo chất lượng hệ thống BrewLite theo đúng tiêu chuẩn công nghệ phần mềm và cam kết chất lượng của Assignment 2, nhóm cần một chiến lược kiểm thử toàn diện theo mô hình Kim tự tháp kiểm thử (Testing Pyramid), bao phủ từ các hàm tính toán nghiệp vụ nhỏ nhất đến luồng người dùng End-to-End hoàn chỉnh trên môi trường giống thật.

## 2. Quyết định (Decision)
Thiết lập 4 tầng kiểm thử tự động, tích hợp trực tiếp vào quy trình CI/CD:

```
          / \
         / E2E \       --> tests/e2e/ (Playwright/Jest E2E flow)
        /-------\
       / Integr. \     --> apps/api/test/integration/ (PostgreSQL Service)
      /-----------\
     /  Component  \   --> apps/web/__tests__/ (React Testing Library)
    /---------------\
   /    Unit Tests   \ --> apps/api/src/**/*.spec.ts (Jest)
  /-------------------\
```

1. **Unit Testing (Jest)**:
   - Tập trung vào các hàm tính giá phía server, logic trừ tồn kho, mã hóa mật khẩu và xác thực JWT token, logic xử lý Idempotency.
   - Chạy siêu tốc trong CI mà không cần database thật (sử dụng in-memory mocks).
2. **Component Testing (React Testing Library / Jest)**:
   - Kiểm thử các màn hình frontend Next.js: Menu hiển thị đủ 3 trạng thái (loading/empty/error), modal chọn size/topping cập nhật giá phản ứng, giỏ hàng tăng giảm số lượng.
3. **Integration Testing (Jest + Real PostgreSQL Container)**:
   - Kiểm thử các API phức tạp: Tạo đơn hàng `POST /orders` trong Transaction, gọi `POST /payments` với `Idempotency-Key` trên cơ sở dữ liệu kiểm thử PostgreSQL thật (được khởi tạo qua GitHub Actions service container).
4. **End-to-End Testing (E2E Test Script trong `tests/`)**:
   - Tự động hóa toàn bộ luồng xuyên suốt: Duyệt Menu -> Thêm giỏ hàng -> Đăng nhập tài khoản -> Điền thông tin giao hàng -> Thanh toán mô phỏng -> Nhận mã đơn và chuyển sang trang theo dõi trạng thái.

## 3. Hệ quả (Consequences)
- **Ưu điểm:**
  - Phát hiện lỗi sớm ngay khi lập trình viên mở PR.
  - Tự tin triển khai (Continuous Deployment) lên Production mà không lo lỗi hồi quy (regression bugs).
- **Hạn chế & Biện pháp xử lý:**
  - Viết test tốn thời gian; phân bổ trách nhiệm rõ ràng: mỗi thành viên chịu trách nhiệm viết test tự động cho đúng phân hệ của mình theo phân công Backlog.
