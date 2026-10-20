# Kế Hoạch & Thiết Kế: Thống Kê QR Mừng Cưới & Nâng Cấp Giao Diện

> **Ngày tạo:** 19/10/2026  
> **Dự án:** Wedding Invitation Platform (Việt Hùng & Xuân Ly)

---

## 1. TỔNG KẾT VẤN ĐỀ VỪA XỬ LÝ (Table Scroll Ngang Trên Mobile)

### Nguyên nhân gây lỗi:
Trong file `app/globals.css` có các đoạn CSS cưỡng chế toàn cục:
```css
* {
  max-width: 100vw !important;
}
div[class*="flex"],
div[class*="grid"] {
  max-width: 100vw;
  overflow-x: hidden;
}
```
**Hậu quả:** Khi co nhỏ màn hình về kích thước mobile (hoặc trên điện thoại thật), quy tắc này triệt tiêu hoàn toàn khả năng tràn nội dung (`overflow-x: auto`), ép toàn bộ các cột của bảng co rúm lại trong `100vw`, làm biến mất thanh cuộn ngang.

### Hướng xử lý:
- Trong `app/globals.css`: Bỏ hoặc nới lỏng `overflow-x: hidden` đối với các container chứa bảng dữ liệu (hoặc loại trừ class `.table-resize-scroll`).
- Trong `app/components/ui/TableResize.tsx`: Đã hoàn thiện cấu trúc thanh cuộn tùy chỉnh (Custom Scrollbar Track & Thumb `refScrollX`) mượt mà, hỗ trợ cả kéo chuột trên PC lẫn vuốt chạm (touch) trên mobile.

---

## 2. NGHIÊN CỨU GIẢI PHÁP THỐNG KÊ THANH TOÁN QR MỪNG CƯỚI

### A. Triết lý thiết kế (Đơn giản - Đúng thực tế)
- **Khách tự quyết định số tiền:** Không bắt khách chọn mệnh giá cứng nhắc trên web; khi quét QR, khách tự gõ số tiền mừng theo ý muốn trên app ngân hàng của họ (VCB, MB, Techcombank, TPBank,...).
- **QR thông minh (VietQR động):**
  - Tự động sinh mã VietQR theo chuẩn Napas.
  - Link động: `https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-compact2.png?accountName=<NAME>&addInfo=<NOI_DUNG>`
  - Nội dung chuyển khoản tự động điền sẵn: `MUNG CUOI HUNG LY - [TEN KHACH]` (Lấy trực tiếp từ tên khách nếu vào từ link thiệp cá nhân hóa).
  - Khi tiền về tài khoản, thông báo trên điện thoại cô dâu/chú rể sẽ hiển thị rõ ràng: *"+500,000 VND từ ... ND: MUNG CUOI HUNG LY - ANH NAM"*.

### B. Quy trình duyệt tiền mừng trong Admin (Duyệt tay tiện lợi)
1. **Khách mừng tiền:** Quét mã QR chuyển khoản trên app ngân hàng.
2. **Điện thoại nổ thông báo:** Cô dâu / Chú rể nhận được tin nhắn biến động số dư.
3. **Vào Admin > Tab "Mừng Cưới":**
   - Tìm kiếm theo tên khách hoặc lọc theo Bên (Nhà Trai / Nhà Gái).
   - Nhập số tiền thực nhận (ví dụ `500.000đ`).
   - Bật gạt công tắc **"Đã nhận"** (Active trạng thái).
   - Có thể thêm ghi chú (ví dụ: *"Bạn đại học", "Mừng kèm quà riêng",...*).
4. **Báo cáo thống kê tự động:**
   - **Tổng tiền mừng đã nhận (VNĐ)**.
   - **Tổng tiền Nhà Trai vs Nhà Gái**.
   - **Số lượng khách đã mừng / Chưa mừng**.
   - **Nút xuất Excel/CSV:** Lưu danh sách đầy đủ để sau này tiện tra cứu khi đi đám cưới lại.

---

## 3. THIẾT KẾ LẠI GIAO DIỆN "MỪNG CƯỚI" (Không còn bị "lỏ")

### Thực trạng hiện tại:
- Nằm đơn độc ở 1 nút đỏ dưới banner ảnh cuối trang.
- Bấm vào mở ra popup che màn hình, chỉ có 1 tấm ảnh QR tĩnh đơn điệu, không chia rõ Nhà Trai / Nhà Gái, thiếu các nút tiện ích.

### Thiết kế mới đề xuất: Section "Hộp Mừng Cưới" (Wedding Gift Box)
Đặt trang trọng ở gần cuối thiệp (ngay sau phần Form RSVP & Sổ Lưu Bút):

```
┌────────────────────────────────────────────────────────────────────────┐
│                        HỘP MỪNG CƯỚI & CHÚC PHÚC                       │
│  "Sự hiện diện của quý vị là niềm vinh hạnh lớn của chúng tôi.         │
│   Nếu không thể đến dự trực tiếp, quý vị có thể gửi quà mừng qua đây"  │
│                                                                        │
│       [ 🤵 Mừng Chú Rể (Nhà Trai) ]    [ 👰 Mừng Cô Dâu (Nhà Gái) ]     │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                                                                │   │
│   │              [ MÃ VIETQR CHUẨN NÉT TỰ ĐỘNG ]                   │   │
│   │                                                                │   │
│   │   • Ngân hàng: MB Bank                                         │   │
│   │   • Chủ tài khoản: TẠ VIỆT HÙNG                                │   │
│   │   • Số tài khoản: 0988xxxxxx                                   │   │
│   │   • Nội dung: Mung cuoi Hung Ly - Anh Nam                      │   │
│   │                                                                │   │
│   │       [ 📋 Sao chép số tài khoản ]    [ 📥 Tải mã QR ]         │   │
│   │                                                                │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

#### Điểm cộng lớn của thiết kế này:
1. **Nút "Sao chép số tài khoản":** Khách duyệt thiệp trên điện thoại thì không thể tự quét QR trên chính màn hình đó được. Chỉ cần 1 chạm copy STK là mở app ngân hàng dán vào được ngay.
2. **Tab chuyển đổi Chú Rể / Cô Dâu:** Rõ ràng, minh bạch cho khách của từng bên.
3. **Hài hòa với tông màu thiệp:** Sử dụng viền bo cong mềm mại, tông vàng đồng / hồng pastel / đỏ song hỷ sang trọng.

---

## 4. KẾ HOẠCH BƯỚC TIẾP THEO (Tối triển khai)

Khi bạn quay lại tiếp tục, các bước sẽ được tiến hành:

1. **Bước 1: Sửa triệt để CSS mobile:**
   - Điều chỉnh file `app/globals.css` để bảng dữ liệu cuộn ngang mượt mà 100% trên cả iPhone, Android và Desktop.
2. **Bước 2: Xây dựng Section "Hộp Mừng Cưới":**
   - Tạo component `GiftBoxSection.tsx` đẹp mắt, có tab Nhà Trai / Nhà Gái, nút copy STK và sinh mã VietQR.
   - Thay thế nút bấm popup cũ trong `app/page.tsx` và `app/nha-gai/page.tsx`.
3. **Bước 3: Nâng cấp Database & API Mừng Cưới:**
   - Thêm model `Gift` hoặc tích hợp vào `Guest` trong `prisma/schema.prisma` (gồm: `guestName`, `amount`, `side`, `status: PENDING | RECEIVED`, `note`).
   - Tạo API route `/api/gifts` (GET, POST, PATCH active trạng thái).
4. **Bước 4: Thêm Tab "Mừng Cưới" vào Admin Platform:**
   - Giao diện bảng quản lý danh sách tiền mừng, thống kê tổng số tiền, lọc theo bên tiệc, tìm kiếm nhanh và nút active trạng thái 1 click.
