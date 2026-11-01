# ADR 005: LỰA CHỌN NEXT.JS MOBILE-FIRST, PWA VÀ QUẢN LÝ TRẠNG THÁI GIỎ HÀNG

> **Người thực hiện:** TV5 (Frontend – Menu & Cart)  
> **Mã công việc:** I-10 (D-18 - PR 2) | **Reviewer:** TV6 (Frontend – Checkout & Orders)  
> **Trạng thái:** Accepted  
> **Ngày quyết định:** 2026-11-01  

---

## 1. Bối cảnh (Context)
Khách hàng chuỗi cửa hàng BrewLite chủ yếu sử dụng điện thoại thông minh để quét mã QR và đặt món ngay tại bàn hoặc quầy. Yêu cầu đặt ra là:
- Trải nghiệm ứng dụng phải nhanh như native app, tương thích hoàn hảo trên các kích thước màn hình điện thoại từ 360px trở lên.
- Giỏ hàng phải được đồng bộ liên tục, không bị mất khi khách vô tình reload trang hoặc đổi app.
- Giao diện phải xử lý mượt mà và trực quan cả 3 trạng thái: Đang tải (Loading/Skeleton), Trống (Empty) và Lỗi (Error có nút Retry).

## 2. Quyết định (Decision)
1. **Lựa chọn Next.js 14 với App Router & Định hướng Mobile-First**:
   - Sử dụng Tailwind CSS để dựng layout responsive tập trung vào viewport mobile (375px - 430px), giới hạn `max-w-md mx-auto` khi xem trên màn hình Desktop lớn để giữ nguyên trải nghiệm mobile app chuẩn chỉ.
   - Cấu hình Progressive Web App (PWA): Cung cấp `manifest.json`, icon đa kích cỡ, theme color `#0D9488` (Teal thương hiệu BrewLite) và service worker cache tĩnh.
2. **Quản lý Trạng thái Giỏ hàng (Cart State Management)**:
   - Xây dựng `CartContext` / custom hook `useCart` với React Context API kết hợp tự động đồng bộ hóa hai chiều với `localStorage`.
   - Lưu trữ đầy đủ: `productId`, `name`, `size`, `toppings`, `unitPrice`, `quantity`.
   - Tính toán tổng tiền động ở frontend để phản hồi tức thì cho người dùng, đồng thời làm rỗng giỏ (`clearCart()`) khi nhận tín hiệu thanh toán thành công.

## 3. Hệ quả (Consequences)
- **Ưu điểm:**
  - Không cần cài đặt từ App Store/Google Play, khách quét QR là dùng được ngay.
  - Tốc độ tải trang cực nhanh, hỗ trợ cài đặt ra màn hình chính (Add to Home Screen).
- **Hạn chế & Biện pháp xử lý:**
  - `localStorage` chỉ hỗ trợ phía Client (gây lỗi Hydration Mismatch trong Next.js); giải quyết bằng cách sử dụng cờ `isMounted` hoặc `useEffect` để chỉ đọc `localStorage` sau khi component đã mount trên trình duyệt.
