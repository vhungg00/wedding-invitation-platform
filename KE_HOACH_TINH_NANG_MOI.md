# Kế Hoạch Phát Triển Các Tính Năng Nâng Cao Cho Thiệp Cưới

> **Ngày cập nhật:** 23/10/2026  
> **Dự án:** Wedding Invitation Platform (Việt Hùng & Xuân Ly)  
> **Mục đích:** Tài liệu lưu trữ thiết kế & giải pháp kỹ thuật cho 6 tính năng nâng cao. Khi cần triển khai mục nào chỉ cần yêu cầu theo số thứ tự (1 → 6).

---

## 🌸 NHÓM 1: TĂNG TRẢI NGHIỆM KHÁCH MỜI TRÊN TRANG THIỆP (`/`, `/nha-gai`)

### 1. Nút "📍 Mở Google Maps Chỉ Đường" (1-Chạm Mở App Bản Đồ)
* **Vấn đề thực tế:** Khung `iframe` bản đồ nhúng trên màn hình điện thoại khá nhỏ, khách đang di chuyển ngoài đường khó thao tác phóng to để tìm đường.
* **Giải pháp UI/UX:**
  * Đặt nút nổi bật **"📍 Mở Google Maps Chỉ Đường"** ngay bên dưới địa chỉ Nhà Trai (`app/page.tsx`) và Nhà Gái (`app/nha-gai/page.tsx`).
  * Khi bấm trên điện thoại (iOS/Android), tự động mở thẳng ứng dụng **Google Maps** ở chế độ dẫn đường (`https://www.google.com/maps/dir/?api=1&destination=...`).
* **File cần sửa:** `app/page.tsx`, `app/nha-gai/page.tsx`.

---

### 2. Nút "📅 Lưu Lịch Hẹn Ngày Cưới Vào Điện Thoại" (Google Calendar & Apple `.ics`)
* **Vấn đề thực tế:** Khách nhận thiệp trước đám cưới 1–2 tuần dễ quên giờ hoặc ngày tổ chức.
* **Giải pháp UI/UX:**
  * Đặt nút **"📅 Lưu vào Lịch điện thoại (Nhắc hẹn)"** ngay dưới khối Lịch tháng 12 (`app/hooks/calender.tsx` hoặc ngay dưới `CountdownTimer`).
  * Hỗ trợ 2 tùy chọn:
    1. **Google Calendar:** Mở link tạo sự kiện trực tiếp (`https://calendar.google.com/calendar/render?action=TEMPLATE&text=...`).
    2. **Lịch iPhone / Outlook (`.ics`):** Tự động tải file `.ics` chứa thông tin:
       * Nhà Trai: `06/12/2026 10:00` – Lễ Thành Hôn Việt Hùng & Khánh Ly.
       * Nhà Gái: `05/12/2026 10:30` – Lễ Vu Quy Xuân Ly & Việt Hùng.
       * Tự động cài `VALARM` nhắc trước 1 ngày và trước 2 tiếng.
* **File dự kiến:** Tạo `app/components/AddToCalendarButton.tsx`, tích hợp vào `app/page.tsx` và `app/nha-gai/page.tsx`.

---

### 3. Bong Bóng Lời Chúc Bay Nhẹ Ở Góc Màn Hình (Floating Wishes + Gửi Lời Chúc Popup)
* **Vấn đề thực tế:** Mục Sổ lưu bút dạng danh sách dài đang tạm ẩn để giữ trang thiệp ngắn gọn, tinh tế.
* **Giải pháp UI/UX:**
  * Hiển thị **1 bong bóng nhỏ gọn bán trong suốt (`backdrop-blur`)** ở góc dưới bên trái màn hình, tự động chuyển lời chúc mới mỗi 5 giây:
    * Ví dụ: *"💌 **Anh Hoàng:** Chúc hai em trăm năm hạnh phúc, sớm sinh quý tử nhé!"*
  * Có nút nhỏ **"✍️ Gửi lời chúc"** và nút **"Ẩn"** ngay cạnh để khách thích có thể bấm mở popup gửi lời chúc (lưu vào bảng `Wish` trong MongoDB) mà không làm dài trang thiệp.
* **File dự kiến:** Tạo `app/components/FloatingWishes.tsx`, gọi API `/api/wishes` sẵn có.

---

### 4. Thanh Nút Tắt Nhanh Ở Góc Màn Hình (Floating Quick Actions)
* **Vấn đề thực tế:** Khách vào lại thiệp lần 2 chỉ muốn tìm nhanh mã QR mừng cưới hoặc xem địa chỉ bản đồ mà không muốn cuộn qua hết bộ ảnh.
* **Giải pháp UI/UX:**
  * Cụm nút tròn nổi nhỏ gọn ở góc phải dưới màn hình (nằm ngay trên nút bật/tắt nhạc `MusicPlayer`):
    * **💝 Mừng cưới (QR):** Cuộn mượt (`scrollIntoView({ behavior: "smooth" })`) xuống `#gift-box`.
    * **✍️ Xác nhận tham dự:** Cuộn mượt xuống `#rsvp-section`.
    * **📍 Chỉ đường:** Cuộn mượt xuống `#location-section`.
* **File dự kiến:** Tạo `app/components/QuickActionsMenu.tsx`.

---

### 5. Xem Album Ảnh Cưới Toàn Màn Hình (Lightbox Gallery + Swipe + Zoom)
* **Vấn đề thực tế:** Hiện tại khách bấm vào ảnh trong Album cưới (`app/components/PhotoAlbum.tsx`) chưa mở to toàn màn hình để ngắm chi tiết hoặc vuốt qua lại.
* **Giải pháp UI/UX:**
  * Khi khách chạm vào bất kỳ ảnh nào trong `PhotoAlbum.tsx`, mở **Lightbox tràn màn hình nền tối sang trọng**:
    * Hỗ trợ **vuốt trái / phải (Touch Swipe)** trên điện thoại và phím mũi tên `←` / `→` trên máy tính.
    * Hiển thị bộ đếm ảnh (ví dụ `3 / 8`), nút phóng to và nút đóng `✕`.
* **File cần sửa:** `app/components/PhotoAlbum.tsx`.

---

## 🤵👰 NHÓM 2: TIỆN ÍCH CHO CÔ DÂU & CHÚ RỂ TRONG TRANG ADMIN (`/admin`)

### 6. Tạo & Tải "Ảnh Thiệp Mời In Tên Khách" Tự Động (Personalized Invitation Card Image)
* **Vấn đề thực tế:** Khi gửi lời mời qua Zalo/Messenger, ngoài đoạn tin nhắn văn bản + đường link, nếu đính kèm thêm **1 tấm ảnh thiệp cưới có in sẵn tên khách mời** (VD: *"Trân trọng kính mời: Anh Nam & Gia đình"*) thì sẽ cực kỳ lịch sự và trang trọng.
* **Giải pháp kỹ thuật (HTML5 Canvas):**
  * Trong bảng Quản lý khách mời (`app/admin/components/GuestsTab.tsx`) và `ZaloMessageModal.tsx`:
  * Thêm nút **"🖼️ Tải ảnh thiệp mời"**.
  * Sử dụng `HTMLCanvasElement` vẽ tự động:
    1. Nền thiệp sang trọng + ảnh cô dâu chú rể.
    2. Dòng chữ nghệ thuật (`Imperial Script` / `Serif`): **"Trân trọng kính mời: [Tên Khách Mời]"**.
    3. Thông tin ngày giờ tương ứng theo bên của khách (Nhà Trai `06.12.2026 - 10h00` hoặc Nhà Gái `05.12.2026 - 10h30`) + mã QR dẫn thẳng tới link thiệp cá nhân hóa của khách đó.
  * Xuất ra file `thiep-moi-[slug-khach].png` tải về máy trong 1 giây hoặc copy thẳng ảnh vào Clipboard để dán (`Ctrl + V`) vào cửa sổ chat Zalo/Messenger.
* **File dự kiến:** Tạo `lib/generateInvitationCard.ts` và tích hợp vào `app/admin/components/GuestsTab.tsx`.
