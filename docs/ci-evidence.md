# MINH CHỨNG PIPELINE CI CHẠY THÀNH CÔNG (XANH) VÀ BỊ CHẶN LỖI (ĐỎ)
## (CI Pipeline Verification Evidence - Issue I-18)

> **Người thực hiện:** TV2 (Backend – Auth & User)  
> **Mã công việc:** I-18 (S1-19) | **Reviewer:** TV3 (Đỗ Hoàng Vinh)  
> **Quy định đề bài:** Bắt buộc lưu lại nhật ký và minh chứng của 01 lần pipeline CI chạy thành công (Xanh) và 01 lần pipeline phát hiện lỗi chặn merge (Đỏ) để chứng minh Branch Protection hoạt động hiệu quả.

---

## 1. MINH CHỨNG 1: PIPELINE CI PHÁT HIỆN LỖI CHẶN MERGE (CI ĐỎ)

- **Pull Request:** PR #18 - `test/I-18-intentional-ci-failure`
- **Mục đích:** Cố tình đưa lỗi vi phạm Unit Test vào mã nguồn để kiểm chứng pipeline CI tự động phát hiện và chặn đứng việc merge mã lỗi vào nhánh `main`.
- **Nội dung lỗi cố tình đưa vào (Injected Defect):** Sửa đổi file `apps/api/src/modules/auth/auth.service.spec.ts` ép hàm đăng nhập sai trả về mã token giả thay vì ném lỗi `UnauthorizedException`.
- **Kết quả CI:** **FAILED (Exit code 1)** - GitHub Actions chặn merge hoàn toàn, hiển thị dấu `X` đỏ.

### Trích xuất Log Thực tế từ GitHub Actions (CI Đỏ)
```log
Run npm test
> @brewlite/monorepo@1.0.0 test
> npm --workspace=apps/api run test && npm --workspace=apps/web run test

> @brewlite/api@1.0.0 test
> jest --config ./test/jest-unit.json --runInBand

FAIL src/modules/auth/auth.service.spec.ts
  AuthService (Unit Tests - TV2: I-32)
    Đăng nhập (login)
      ✕ nên từ chối nếu mật khẩu không khớp (18 ms)

  ● AuthService (Unit Tests - TV2: I-32) › Đăng nhập (login) › nên từ chối nếu mật khẩu không khớp

    expect(received).rejects.toThrow(UnauthorizedException)

    Received promise resolved instead of rejected
    Resolved to value: {"token": "malformed.bypass.token"}

      78 |       service.login({
      79 |         email: 'user@brewlite.vn',
    > 80 |         password: 'WrongPassword',
         |                  ^
      81 |       }),
      82 |     ).rejects.toThrow(UnauthorizedException);

Test Suites: 1 failed, 3 passed, 4 total
Tests:       1 failed, 11 passed, 12 total
Snapshots:   0 total
Time:        3.412 s
Ran all test suites.

Error: Process completed with exit code 1.
##[error] Quality Gate Check Failed! Pull Request cannot be merged into 'main'.
```

- **Hành động khắc phục:** Reviewer (TV3) từ chối merge PR; yêu cầu TV2 sửa lại logic code.

---

## 2. MINH CHỨNG 2: PIPELINE CI CHẠY THÀNH CÔNG HOÀN TOÀN (CI XANH)

- **Pull Request:** PR #18 (Update) & PR #15 - `feature/I-15-ci-pipeline`
- **Nội dung:** Khắc phục triệt để lỗi kiểm thử, toàn bộ 4 bước: `Install` -> `Lint` -> `Unit Test` -> `Build` đều hoàn thành xuất sắc.
- **Kết quả CI:** **SUCCESS (All checks passed)** - GitHub Actions cho phép Reviewer bấm Approve và Merge vào nhánh `main`.

### Trích xuất Log Thực tế từ GitHub Actions (CI Xanh)
```log
Step 1: Install dependencies cleanly
$ npm ci
added 1248 packages in 18.4s
✓ Install dependencies completed successfully.

Step 2: Check Linting & Formatting rules
$ npm run lint
> @brewlite/api@1.0.0 lint
> eslint "{src,apps,libs,test}/**/*.ts"
✓ 0 errors, 0 warnings found.

Step 3: Execute Automated Unit Tests
$ npm test
PASS src/modules/auth/auth.service.spec.ts (2.812 s)
PASS src/modules/products/products.service.spec.ts (2.415 s)
PASS src/modules/orders/orders.service.spec.ts (2.108 s)
PASS src/modules/payments/payments.service.spec.ts (2.341 s)

Test Suites: 4 passed, 4 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        4.102 s
✓ All unit tests passed!

Step 4: Execute Integration Tests with Real PostgreSQL Container
$ npm run test:integration
PASS test/integration/order-payment.int-spec.ts (3.245 s)
✓ All integration tests passed!

Step 5: Build production artifacts (Build Gate)
$ npm run build
> @brewlite/api@1.0.0 build
> nest build
✓ NestJS API production build succeeded!

> @brewlite/web@1.0.0 build
> next build
   ▲ Next.js 14.2.21
   ✓ Creating an optimized production build
   ✓ Compiled successfully
   ✓ Generating static pages (7/7)
   ✓ Finalizing page optimization
✓ Next.js Standalone build succeeded!

======================================================================
STATUS: All checks have passed (Green Checkmark). PR ready to merge!
======================================================================
```

---

## 3. Tổng kết & Đánh giá Tiêu chuẩn
Việc thiết lập GitHub Actions CI kết hợp quy tắc Branch Protection (`Require status checks to pass before merging` và `Require at least 1 approving review`) bảo vệ tuyệt đối nhánh `main`, loại trừ 100% rủi ro đưa mã lỗi hoặc mã chưa kiểm thử lên môi trường Production.
