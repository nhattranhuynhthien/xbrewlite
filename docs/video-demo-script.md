# KỊCH BẢN VIDEO DEMO TRỰC TIẾP LUỒNG END-TO-END TRÊN PRODUCTION
## (Production Walkthrough Video Demonstration Script)

> **Người thực hiện:** TV5 (Frontend – Menu & Cart)  
> **Mã công việc:** I-41 (S2-39) | **Reviewer:** TV6 (Frontend – Checkout & Orders)  
> **Thời lượng video:** Khoảng 4 - 6 phút  
> **Môi trường demo:** Production URL với HTTPS  

---

## 1. Chuẩn bị Trước khi Quay
1. **Thiết bị & Trình duyệt**: Mở trình duyệt di động (hoặc DevTools ở chế độ Responsive Viewport iPhone 14/15: 393 x 852px).
2. **Dữ liệu demo sẵn có**:
   - Tài khoản Khách hàng: `customer@brewlite.vn` / `Password123!`
   - Tài khoản Barista/Staff: `staff@brewlite.vn` / `Password123!`
   - Mã giảm giá: `BREW10`
3. **Mở sẵn 2 tab song song**:
   - Tab 1: Khách hàng (Đặt món & Theo dõi tiến trình)
   - Tab 2: Nhân viên Barista quầy (`/staff` - Cập nhật trạng thái)

---

## 2. Kịch bản Chi tiết Từng Phân cảnh (Storyboard & Actions)

### Phân cảnh 1: Giới thiệu Tổng quan & Đăng nhập (0:00 - 0:45)
- **Lời thoại:** *"Xin chào thầy cô và các bạn. Đây là video demo nghiệm thu Assignment 2 - Dự án Chuỗi đồ uống thông minh BrewLite. Hệ thống được triển khai trên môi trường Production truy cập qua HTTPS."*
- **Thao tác:**
  1. Cho xem thanh địa chỉ có khóa xanh bảo mật HTTPS.
  2. Bấm vào nút **"Đăng nhập"** trên Header.
  3. Bấm nút 1-Click tài khoản mẫu **"Khách hàng mẫu"** (`customer@brewlite.vn`).
  4. Bấm **"Đăng nhập"** -> Hệ thống xác thực và cấp JWT Token, lưu thông tin và quay lại Menu.

### Phân cảnh 2: Khám phá Menu, Lọc danh mục & Chọn Size/Topping (0:45 - 2:00)
- **Lời thoại:** *"Khách hàng mở menu, duyệt qua các danh mục: Cà phê, Trà, Signature. Giao diện được tối ưu hóa mobile-first với thao tác chạm vuốt mượt mà."*
- **Thao tác:**
  1. Bấm lọc danh mục `Trà & Trà sữa`.
  2. Tìm kiếm món "Oolong" trên thanh search bar.
  3. Bấm vào món **"Trà Sữa Oolong Nướng Trân Châu"** -> Modal chi tiết món hiện lên.
  4. Đổi Size từ `Vừa (M)` sang `Lớn (L)` -> Giá phụ thu tự động nhảy thêm +12.000 đ.
  5. Tick chọn thêm 2 Topping: **"Trân châu trắng 3Q"** (+10.000 đ) và **"Kem Cheese phô mai"** (+15.000 đ).
  6. Tăng số lượng lên `2 ly` -> Giá tạm tính tự động cập nhật chính xác theo công thức.
  7. Bấm **"Thêm vào giỏ hàng"** -> Giỏ hàng xuất hiện badge số `2`.

### Phân cảnh 3: Quản lý Giỏ hàng & Áp dụng Mã giảm giá (2:00 - 3:00)
- **Lời thoại:** *"Khách hàng mở giỏ hàng. Trạng thái giỏ được lưu trữ bền vững trong LocalStorage, dù khách hàng có tải lại trang thì dữ liệu vẫn nguyên vẹn."*
- **Thao tác:**
  1. Mở trang Giỏ hàng `/cart`.
  2. Thử bấm F5 Reload trang -> Giỏ hàng vẫn giữ nguyên vẹn.
  3. Nhập mã khuyến mãi `BREW10` và bấm **"Áp dụng"** -> Hệ thống gọi API kiểm tra và giảm trừ 10% ngay trên hóa đơn.
  4. Bấm **"Xác nhận thông tin & Đặt hàng"** -> Điều hướng sang màn hình `/checkout`.

### Phân cảnh 4: Đặt hàng trong Transaction & Xử lý Thanh toán Idempotent (3:00 - 4:15)
- **Lời thoại:** *"Tại màn hình Checkout, toàn bộ quy trình tạo đơn và trừ tồn kho được bảo vệ trong Database Transaction tuân thủ ACID. Phân hệ thanh toán sử dụng khóa Idempotency-Key chống trừ tiền trùng lặp."*
- **Thao tác:**
  1. Điền thông tin giao hàng: Họ tên, Số điện thoại, Ghi chú bàn phục vụ.
  2. Chọn phương thức thanh toán **"Ví điện tử mô phỏng"** (E-Wallet).
  3. **Thử nghiệm nhánh lỗi (Demo Negative Test):** Tick vào ô *"Giả lập thẻ lỗi / ví không đủ tiền"* và bấm Thanh toán -> API trả về lỗi 400 và hệ thống hiển thị thông báo lỗi màu đỏ kèm nút **"Thử lại thanh toán"** mà không làm mất đơn đã tạo.
  4. Bỏ tick giả lập lỗi -> Bấm **"Thử lại thanh toán"** -> Thanh toán thành công, giỏ hàng được tự động dọn sạch.

### Phân cảnh 5: Theo dõi Đơn Thời gian thực & Barista Đổi Trạng thái (4:15 - 5:30)
- **Lời thoại:** *"Khách hàng được chuyển ngay sang màn hình theo dõi đơn hàng với thanh tiến trình trực quan. Màn hình tự động cập nhật sau mỗi 5 giây."*
- **Thao tác:**
  1. Trên Tab Khách hàng: Đơn đang ở trạng thái `Đã thanh toán` (PAID).
  2. Chuyển sang Tab 2 (Barista Dashboard `/staff`):
     - Bấm **"Bắt đầu pha chế"** (`PREPARING`).
  3. Quay lại Tab 1: Trong vòng 5 giây, thanh tiến trình của khách hàng tự động nhảy sang bước `Đang pha chế` (PREPARING) kèm hiệu ứng nổi bật.
  4. Chuyển sang Tab 2: Bấm **"Pha chế xong / Sẵn sàng"** (`READY`).
  5. Quay lại Tab 1: Khách hàng thấy thông báo *"Đồ uống của bạn đã sẵn sàng tại quầy!"*.
  6. Mở màn hình Lịch sử đơn hàng `/orders` -> Đơn hàng vừa đặt xuất hiện ở vị trí đầu tiên.

---

## 3. Kết luận Video Demo
- Khẳng định hệ thống chạy ổn định 100% trên môi trường Production thật với HTTPS.
- Toàn bộ luồng nghiệp vụ từ Xem menu đến Bàn giao hoàn tất trọn vẹn, đáp ứng xuất sắc mọi tiêu chí nghiệm thu của đề tài.
