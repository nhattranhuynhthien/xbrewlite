# YÊU CẦU CHỨC NĂNG & PHI CHỨC NĂNG: GIỎ HÀNG VÀ GIAO DIỆN NGƯỜI DÙNG
## (SRS - Cart & User Interface Specification)

> **Người thực hiện:** TV5 (Frontend – Menu & Cart)  
> **Mã công việc:** I-04 (D-04) | **Reviewer:** TV6 (Frontend – Checkout & Orders)  

---

## 1. Yêu cầu Chức năng (Functional Requirements)

### FR-04: Quản lý Giỏ hàng (Add / Update / Remove Cart Items)
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Khách hàng có thể thêm sản phẩm với các tùy chọn cụ thể (Size, Topping, Ghi chú) vào giỏ hàng. Trong giỏ hàng, khách hàng có thể:
  1. Tăng hoặc giảm số lượng của từng món (số lượng tối thiểu là 1, tối đa là 20 món/lần đặt).
  2. Xóa từng món ra khỏi giỏ hàng hoặc xóa toàn bộ giỏ.
  3. Quan sát tổng số tiền tạm tính được tính toán lại ngay lập tức.
- **Tiêu chí chấp nhận (Acceptance Criteria):**
  1. Cùng một sản phẩm nhưng khác size hoặc khác topping được lưu thành 2 dòng riêng biệt trong giỏ hàng.
  2. Bấm nút "+" tăng số lượng thêm 1; bấm nút "-" giảm số lượng bớt 1; nếu số lượng bằng 1 và bấm "-" thì hiển thị hộp thoại xác nhận xóa món.
  3. Tổng tiền giỏ hàng hiển thị chính xác theo công thức:
     $$\text{Total} = \sum_{i=1}^n (\text{BasePrice}_i + \text{SizeExtra}_i + \sum \text{ToppingPrice}_{i,j}) \times \text{Quantity}_i$$

### FR-05: Lưu giữ Trạng thái Giỏ hàng (Cart Persistence)
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Giỏ hàng của khách hàng không bị mất khi reload (F5), đóng tab hoặc duyệt qua lại giữa các trang trong ứng dụng.
- **Tiêu chí chấp nhận (Acceptance Criteria):**
  1. Dữ liệu giỏ hàng được đồng bộ tự động vào `localStorage` của trình duyệt.
  2. Khi người dùng mở lại trang, dữ liệu giỏ hàng tự động khôi phục nguyên vẹn.
  3. Khi đơn hàng được đặt và thanh toán thành công, giỏ hàng tự động được dọn sạch (`clearCart()`).

### FR-06: Trải nghiệm Mobile-first & PWA (Installable App)
- **Ưu tiên (MoSCoW):** Should
- **Mô tả:** Giao diện được thiết kế tối ưu trên tỉ lệ màn hình điện thoại di động (chiều rộng chuẩn từ 360px - 430px), hỗ trợ cài đặt ra màn hình chính (Add to Home Screen) dưới dạng PWA.
- **Tiêu chí chấp nhận (Acceptance Criteria):**
  1. Giao diện responsive không bị bể vỡ hoặc cuộn ngang ở độ phân giải 375px (iPhone SE).
  2. Có file `manifest.json` hợp lệ, cấu hình icons (192x192, 512x512) và theme color chuẩn thương hiệu BrewLite.

---

## 2. Yêu cầu Phi Chức năng (Non-Functional Requirements)

### NFR-03: Trạng thái Phản hồi Giao diện (UI States)
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Mọi màn hình tải dữ liệu đều phải xử lý đầy đủ 3 trạng thái:
  1. **Loading state**: Hiển thị khung xương (Skeleton loader) hoặc spinner khi đang fetch dữ liệu.
  2. **Empty state**: Hiển thị hình ảnh minh họa và thông điệp khi danh sách rỗng (ví dụ "Giỏ hàng của bạn đang trống").
  3. **Error state**: Hiển thị thông báo lỗi rõ ràng và nút "Thử lại" (Retry) khi API thất bại hoặc mất mạng.
- **Tiêu chí chấp nhận:** 100% các màn hình chính (Menu, Cart, Orders) bao phủ đủ 3 trạng thái.

### NFR-04: Tốc độ Tải Trang Ban đầu (First Contentful Paint)
- **Ưu tiên (MoSCoW):** Must
- **Mô tả:** Thời gian tải trang ban đầu FCP trên kết nối 4G di động phải nhỏ hơn 1.8 giây.
