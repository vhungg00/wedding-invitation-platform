# Hướng Dẫn Sử Dụng & Triển Khai Nền Tảng Thiệp Cưới (Wedding Invitation Platform)

Dự án thiệp cưới online tương tác & nền tảng quản trị khách mời dành cho lễ cưới **Việt Hùng & Xuân Ly**, được xây dựng trên nền tảng **Next.js 16 + React 19 + Tailwind CSS v4 + Prisma ORM + MongoDB Atlas**.

---

## 🌟 1. Các Tính Năng Chính

### 💌 Dành cho Khách mời (Front-end)
1. **Thiệp cưới đa kênh (Nhà Trai & Nhà Gái)**:
   * **Nhà Trai**: [http://localhost:3000](http://localhost:3000) (Lễ Thành Hôn & Tiệc mừng nhà trai).
   * **Nhà Gái**: [http://localhost:3000/nha-gai](http://localhost:3000/nha-gai) (Lễ Vu Quy & Tiệc mừng nhà gái).
2. **Cá nhân hóa thư mời trân trọng**:
   * Truy cập qua đường link có đuôi `?to=Tên+Khách` (Ví dụ: `/?to=Anh+Hoàng` hoặc `/nha-gai?to=Chị+Thảo+&+Gia+đình`).
   * Đầu trang sẽ xuất hiện banner trang trọng riêng biệt: *"Kính gửi: [Tên khách] - Sự hiện diện của bạn là niềm vinh hạnh to lớn..."* kèm nút sao chép link.
3. **Xác nhận tham dự trực tuyến (RSVP)**:
   * Tự động nhận diện tên khách mời.
   * Lựa chọn: **"Sẽ tham dự 🎉"** hoặc **"Rất tiếc không thể đến 💌"**.
   * Chọn số lượng người đi cùng, chọn tham dự bên Nhà Trai / Nhà Gái, gửi lời nhắn.
   * Dữ liệu được lưu ngay lập tức vào cơ sở dữ liệu MongoDB Atlas.
4. **Sổ lưu bút & Gửi lời chúc mừng**:
   * Khách mời gửi lời chúc, chọn vai vế/mối quan hệ (Bạn chú rể, Bạn cô dâu, Đồng nghiệp, Gia đình & Họ hàng,...).
   * Danh sách lời chúc hiển thị dạng thiệp vintage trang nhã.
   * Nút **Thả tim ❤️** tương tác trực tiếp theo thời gian thực.
5. **Mừng cưới online qua mã QR**:
   * Popup hiển thị tài khoản ngân hàng và mã QR Code chuyển khoản tiện lợi.
6. **Nhạc nền & Hiệu ứng**:
   * Tự động phát nhạc nền thông minh (bỏ qua chính sách chặn autoplay của trình duyệt sau lần chạm đầu tiên).
   * Hiệu ứng mưa tim rơi nhẹ nhàng lãng mạn.
   * Bảng lịch động tự động highlight ngày cưới đi kèm hiệu ứng tim đập.

---

### 🛡️ 2. Trang Quản Trị Hệ Thống (Admin Dashboard)

* **Trang Bảng Điều Khiển Quản Trị**: [http://localhost:3000/admin](http://localhost:3000/admin)
* **Trang Đăng Nhập Riêng Biệt**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
* **Cơ chế điều hướng**:
  * Khi truy cập `/admin`, nếu chưa đăng nhập hệ thống sẽ tự động chuyển hướng sang `/admin/login`.
  * Sau khi đăng nhập thành công (hoặc nếu đã có phiên trước đó), hệ thống sẽ tự chuyển sang `/admin`.
  * Khi bấm **"Đăng xuất"** tại `/admin`, hệ thống hủy JWT cookie và chuyển về `/admin/login`.

#### Thông tin đăng nhập mặc định:
* **Tài khoản**: `admin`
* **Mật khẩu**: `hungly2026`
*(Có thể đổi trong file `.env` hoặc cấu hình Vercel)*

#### Các công cụ trong trang Admin:
* **Thống kê tổng quan**:
  * Tổng số khách xác nhận tham dự (tổng số người, phân tách rõ số lượng khách Nhà Trai vs Nhà Gái để gia đình chốt số mâm cỗ).
  * Số lượng khách từ chối.
  * Tổng số lời chúc mừng.
* **Quản lý danh sách RSVP**:
  * Bảng chi tiết danh sách khách phản hồi.
  * Tìm kiếm theo Tên khách mời hoặc Số điện thoại.
  * Lọc theo Nhà Trai / Nhà Gái / Tất cả; lọc theo Trạng thái đi hay không đi.
  * Nút **Xuất Excel/CSV** (chuẩn UTF-8 có dấu tiếng Việt) để gia đình in ra kiểm tra và xếp bàn.
* **Sổ lưu bút**:
  * Xem toàn bộ lời chúc và số lượt tim.
  * Nút xóa lời chúc nếu có nội dung không phù hợp.
* **Tạo link thiệp mời cá nhân hóa chuẩn URL sạch (Clean Slug)**:
  * Nhập tên khách (VD: *"Chị Thảo & Gia đình"*, *"Bạn Linh"*).
  * Chọn bên Nhà Trai hoặc Nhà Gái.
  * Hệ thống tự động tạo link ngắn gọn, không bị lỗi mã hóa tiếng Việt:
    * Link sạch dạng: `https://damcuoihungly.vercel.app/nha-gai?g=chi-thao-gia-dinh-1002`
    * (Thay vì link bị mã hóa xấu xí cũ: `?to=Ch%E1%BB%8B%20Th%E1%BA%A3o%20%26%20Gia%20%C4%91%C3%ACnh`)
  * Khi khách mở link, thiệp tự động giải mã ra tên đầy đủ có dấu trang trọng **"Chị Thảo & Gia đình"** trên Banner và tự điền sẵn form RSVP!
  * Có nút **Sao chép link** và nút **Mở xem trước** để gửi ngay qua Zalo, Messenger, SMS.

---

## ⚙️ 3. Biến Môi Trường (.env)

Cấu hình các biến trong file `.env` (không chia sẻ công khai file này lên Git):

```env
# MongoDB Atlas Connection String
DATABASE_URL="mongodb+srv://tavanhunglc2000_db_user:3GlTgwZmCz0C1obS@cluster0.m21eyab.mongodb.net/wedding?retryWrites=true&w=majority"

# Tài khoản & Mật khẩu Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=hungly2026

# Khóa bí mật mã hóa phiên đăng nhập
AUTH_SECRET=wedding-secret-token-hungly-2026
```

---

## 🚀 4. Các Lệnh Thao Tác (Scripts)

| Lệnh | Ý nghĩa |
| :--- | :--- |
| `npm run dev` | Khởi chạy server phát triển local tại `http://localhost:3000` |
| `npm run build` | Biên dịch bản build tối ưu cho production |
| `npm run start` | Khởi chạy server sau khi đã build |
| `npm run db:push` | Đồng bộ cấu trúc bảng (schema) lên MongoDB Atlas |
| `npm run db:studio` | Mở giao diện Prisma Studio trên trình duyệt tại `http://localhost:5555` để xem/sửa database |
| `npm run db:seed` | Nạp sẵn dữ liệu mẫu (lời chúc, RSVP mẫu) lên database |

---

## 🌐 5. Hướng Dẫn Triển Khai Lên Vercel

Dự án hiện tại được liên kết với trang Vercel: [https://damcuoihungly.vercel.app/](https://damcuoihungly.vercel.app/)

### Bước 1: Cấu hình biến môi trường trên Vercel
1. Truy cập [Vercel Dashboard](https://vercel.com/) -> Chọn project **`damcuoihungly`**.
2. Chọn tab **Settings** -> Mục **Environment Variables**.
3. Thêm 4 biến môi trường sau:
   * **`DATABASE_URL`**: `mongodb+srv://tavanhunglc2000_db_user:3GlTgwZmCz0C1obS@cluster0.m21eyab.mongodb.net/wedding?retryWrites=true&w=majority`
   * **`ADMIN_USERNAME`**: `admin`
   * **`ADMIN_PASSWORD`**: `hungly2026`
   * **`AUTH_SECRET`**: `wedding-secret-token-hungly-2026`
4. Chọn áp dụng cho cả 3 môi trường: **Production**, **Preview**, **Development**.

### Bước 2: Đẩy mã nguồn lên Git
Chạy các lệnh sau trong terminal:
```bash
git add .
git commit -m "feat: complete wedding platform with mongodb and admin auth"
git push origin production
```

Vercel sẽ tự động phát hiện commit mới, kích hoạt lệnh `"postinstall": "prisma generate"`, build ứng dụng và cập nhật website chỉ sau 1-2 phút!

---

## 📡 6. Danh Sách API Endpoints

| Phương thức | Endpoint | Chức năng | Quyền hạn |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Đăng nhập quản trị, cấp cookie HTTP-Only | Public |
| `POST` | `/api/auth/logout` | Đăng xuất, hủy cookie phiên | Public |
| `GET` | `/api/auth/check` | Kiểm tra trạng thái đăng nhập admin | Public |
| `GET` | `/api/rsvp` | Lấy danh sách RSVP (lọc theo bên, trạng thái) | Public |
| `POST` | `/api/rsvp` | Khách gửi xác nhận tham dự | Public |
| `DELETE` | `/api/rsvp/[id]` | Xóa phản hồi RSVP | **Admin** |
| `GET` | `/api/wishes` | Lấy danh sách lời chúc mừng | Public |
| `POST` | `/api/wishes` | Khách gửi lời chúc mừng | Public |
| `POST` | `/api/wishes/[id]/like` | Thả tim cho lời chúc | Public |
| `PATCH` | `/api/wishes/[id]` | Ẩn / Hiện lời chúc | **Admin** |
| `DELETE` | `/api/wishes/[id]` | Xóa lời chúc | **Admin** |
| `GET` | `/api/guests` | Lấy danh sách khách mời cá nhân hóa | Public |
| `POST` | `/api/guests` | Tạo khách mời & sinh link thiệp | **Admin** |
| `DELETE` | `/api/guests` | Xóa khách mời | **Admin** |
| `GET` | `/api/stats` | Thống kê số lượng khách, lời chúc | Public |
