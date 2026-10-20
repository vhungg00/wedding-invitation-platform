# Kế Hoạch & Thiết Kế: Nâng Cấp Hệ Thống Quản Lý Khách Mời & Gửi Thiệp Cá Nhân Hóa

> **Ngày tạo:** 20/10/2026  
> **Dự án:** Wedding Invitation Platform (Việt Hùng & Xuân Ly)  
> **Tài liệu:** Kế hoạch phát triển chức năng Quản lý Khách mời & Điều phối gửi thiệp (Master Guest Management)

---

## 1. BỐI CẢNH & PHÂN TÍCH THỰC TRẠNG

### A. Thực trạng hiện tại của hệ thống:
- Hệ thống đã có cơ chế tạo link thiệp cá nhân hóa: Mỗi khách mời có một `slug` riêng (ví dụ: `anh-nam-8421`).
- Khi khách mở link thiệp:
  - Header hiển thị thư mời trang trọng: *"Kính gửi: Anh Nam"*.
  - Form RSVP tự động điền sẵn tên khách.
  - Hộp mừng cưới VietQR tự động điền cú pháp: `MUNG CUOI HUNG LY ANH NAM`.
- Giao diện Admin Tab "Tạo Link Mời Khách" ([GuestsTab.tsx](file:///Users/hungtv/Documents/workplace/area-react/wedding-invitation-platform/app/admin/components/GuestsTab.tsx)) hiện có:
  - Form thêm từng người (Tên, Bên Nhà Trai/Gái, SĐT).
  - Bảng [TableResize.tsx](file:///Users/hungtv/Documents/workplace/area-react/wedding-invitation-platform/app/components/ui/TableResize.tsx) hiển thị danh sách, tìm kiếm và nút sao chép link.

### B. Những hạn chế lớn khi đưa vào vận hành thực tế:
1. **Tạo từng khách một gây mất thời gian nghiêm trọng:** 
   - Đám cưới thực tế có từ **200 đến 500+ khách mời**. Nếu phải nhập từng tên rồi bấm nút "Tạo link" 300 lần sẽ mất hàng giờ đồng hồ và rất dễ nhầm lẫn.
2. **Chưa có nút chỉnh sửa (Edit):**
   - Chỉ có nút Xóa. Nếu lỡ gõ sai tên, sai SĐT hoặc muốn đổi bên tiệc, bắt buộc phải xóa đi tạo lại, làm thay đổi slug link thiệp đã tạo.
3. **Thiếu mẫu tin nhắn gửi thiệp lịch thiệp (Zalo / SMS / Messenger):**
   - Gửi 1 đường link trần (`https://.../?g=...`) sẽ bị thô và thiếu trang trọng. Cô dâu chú rể phải tự gõ lời nhắn kèm theo cho từng người.
4. **Dữ liệu bị phân mảnh (Silo):**
   - Danh sách khách ở một nơi, phản hồi ai đi/ai nghỉ ở Tab RSVP, ai mừng tiền ở Tab Mừng Cưới. 
   - Người quản lý không có một **Bảng điều khiển trung tâm (Master Dashboard)** để biết: *Khách này đã gửi thiệp chưa? Đã xác nhận tham dự chưa? Đi mấy người? Đã mừng bao nhiêu tiền?*
5. **Không có phân loại nhóm khách (Group / Tag):**
   - Chưa phân biệt được: *Họ hàng nội, Họ hàng ngoại, Bạn Chú rể, Bạn Cô dâu, Đồng nghiệp, Bạn cấp 3, Bạn đại học, Khách của bố mẹ*.

---

## 2. MỤC TIÊU PHÁT TRIỂN

1. **Tiết kiệm 95% thời gian tạo thiệp:** Cho phép dán cả danh sách 50–200 người từ Excel/Zalo/Notes để hệ thống tự tạo toàn bộ link trong 2 giây.
2. **Gửi thiệp chuyên nghiệp 1-chạm:** Copy ngay tin nhắn mời chuẩn mực, trang trọng có sẵn tên khách và đường link riêng để dán vào Zalo/Messenger/SMS.
3. **Theo dõi tiến độ gửi thiệp:** Đánh dấu rõ ràng ai *Chưa gửi*, ai *Đã gửi link*, ai *Đã phản hồi*.
4. **Bảng tổng hợp Master 3-trong-1:** Nhìn vào 1 dòng là biết toàn bộ hành trình của khách (Thông tin -> Gửi thiệp -> RSVP tham dự -> Mừng cưới).
5. **Sẵn sàng cho việc đón tiếp & Xếp bàn tiệc:** Gán nhóm khách, gán số bàn tiệc và xuất file Excel hoàn chỉnh để in ra bàn lễ tân tại hôn trường.

---

## 3. CHI TIẾT CÁC TÍNH NĂNG "ĐỈNH CAO" CHO MÀN RIÊNG `/admin/guests`

### 🌟 Tính năng 1: Thước đo Mâm Cỗ & Bàn Tiệc Tự Động (Quy chuẩn "Ngồi 8")
> **Quy chuẩn hôn lễ:** Nhà hàng tiệc cưới phục vụ theo **mâm 8 người ("ngồi 8")**.
- **Hệ thống tự động tính toán thời gian thực theo RSVP:**
  - `Tổng khách xác nhận đi` (gồm khách chính + số người đi cùng).
  - `Số mâm chính thức` = `Math.ceil(Tổng khách / 8)`.
  - `Số mâm dự phòng (+10%)` = `Math.ceil(Số mâm chính * 0.1)`.
  - `Số mâm chốt nhà hàng` = `Số mâm chính + Số mâm dự phòng`.
- **Ví dụ thực tế:** 
  - Có 204 khách xác nhận đi ➔ **26 mâm chính (204 / 8 = 25.5)** + **3 mâm dự phòng** ➔ **Chốt 29 mâm với nhà hàng**.
  - Không bao giờ lo thiếu cỗ làm mất mặt gia đình, cũng không lo thừa mâm gây lãng phí hàng chục triệu đồng!

---

### 🌟 Tính năng 2: Sơ đồ Xếp Bàn Tiệc Trực Quan (Seating Planner - Bàn 8 Chỗ)
- Mỗi bàn tiệc được gán cố định **8 ghế ("ngồi 8")**:
  - **Bàn 01 (Họ nội chú rể):** 8/8 chỗ ➔ [Đã đủ bàn - Xanh lá]
  - **Bàn 02 (Bạn ĐH Bách Khoa):** 7/8 chỗ ➔ [Còn 1 chỗ trống - Cam]
  - **Bàn 03 (Đồng nghiệp):** 5/8 chỗ ➔ [Còn 3 chỗ trống - Cam]
- **Khu vực "Chờ xếp bàn":** Danh sách khách đã xác nhận đi nhưng chưa xếp số bàn, click 1 chạm để đẩy vào các bàn còn trống ghế.

---

### 🌟 Tính năng 3: Nhập danh sách hàng loạt (Smart Bulk Import)
Cho phép cô dâu chú rể đưa danh sách khách mời vào hệ thống bằng 2 phương thức:

#### Phương thức A: Dán văn bản thông minh (Quick Textarea Paste)
Người dùng chỉ cần copy danh sách từ Zalo, Note hoặc bảng tính và dán vào ô Textarea:
```text
Anh Nam - 0988123456 - Bạn C3
Chị Thảo - 0912333444 - Đồng nghiệp
Gia đình Bác Hùng - 0912345678 - Họ hàng
Bạn Tuấn Anh - 0905123456 - Bạn chú rể
Nguyễn Văn A
```
- **Bộ bóc tách thông minh (Smart Parser):**
  - Tự động nhận diện Tên khách.
  - Tự động lọc ra Số điện thoại (chuỗi 10 số).
  - Tự động gán Nhóm khách nếu có ghi chú.
- Xem trước (Preview) danh sách đã bóc tách trước khi bấm **"Xác nhận tạo hàng loạt"**.

#### Phương thức B: Nhập từ file Excel / CSV (File Upload)
- Hỗ trợ tải file mẫu `.xlsx` / `.csv` và import trực tiếp danh sách hàng trăm khách.

---

### 🌟 Tính năng 4: 1-Click Bắn Tin Nhắn Zalo Cá Nhân Hóa (Zalo Direct Chat)
Bên cạnh nút "Sao chép link", bổ sung nút **"💬 Gửi Zalo"**:
- Bấm 1 phát, hệ thống tự động mở Zalo (`https://zalo.me/{phone}`) kèm tin nhắn đã soạn sẵn cực kỳ trang trọng:
  ```text
  Trân gửi [TÊN_KHÁCH],
  
  Hôn lễ của Việt Hùng & Xuân Ly sẽ chính thức diễn ra vào ngày 06.12.2026.
  Sự hiện diện của [TÊN_KHÁCH] là niềm vinh hạnh to lớn và trọn vẹn nhất cho ngày vui của gia đình chúng mình.
  
  Chúng mình trân trọng gửi thiệp mời trực tiếp tới [TÊN_KHÁCH] tại đường dẫn:
  👉 [LINK_THIEP_RIENG]
  
  Rất mong được đón tiếp [TÊN_KHÁCH] cùng chung vui!
  Thân ái,
  Việt Hùng & Xuân Ly.
  ```
- Cho phép chỉnh sửa template tin nhắn mời trong phần cài đặt.

---

### 🌟 Tính năng 5: Khung mô phỏng điện thoại Live Preview (Mobile Simulator Drawer)
- Click vào nút "Xem thiệp" của bất kỳ khách nào:
- Màn hình trượt ra một chiếc điện thoại iPhone ảo bên phải:
  - Hiển thị trực tiếp giao diện thiệp của riêng khách đó (*"Kính gửi: Anh Nam"*, QR mừng cưới có sẵn tên anh Nam...).
  - Giúp cô dâu chú rể kiểm tra xem thiệp hiển thị có đẹp không mà không cần mở tab mới hay lấy điện thoại thật ra quét.

---

### 🌟 Tính năng 6: Bảng Master 3-trong-1 & Thanh thao tác nổi (Floating Multi-Select Bar)
- **Hợp nhất dữ liệu:** Khách mời + Trạng thái gửi thiệp + Phản hồi RSVP (Số người đi cùng) + Tiền mừng cưới.
- **Thanh thao tác nổi (Floating Bar):** Khi tick chọn 10, 20 hay 50 khách cùng lúc:
  - Hiện thanh công cụ nổi dưới đáy: *“Đã chọn 20 khách”* ➔ `[Đánh dấu Đã gửi]` `[Chuyển nhóm]` `[Gán vào Bàn X]` `[Copy toàn bộ link]` `[Xóa]`.

---

## 4. BẢN VẼ THIẾT KẾ MÀN HÌNH MỚI `/admin/guests`

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  WEDDING ADMIN  >  ĐIỀU PHỐI KHÁCH MỜI & XẾP BÀN TIỆC                                                  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [📊 Tổng khách: 280]  [📤 Đã gửi: 195/280]  [✅ Đi: 160 khách]  [🍲 Cỗ (ngồi 8): 20 mâm chính + 2 dp] │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [🔍 Tìm kiếm tên, SĐT...]  [Lọc Bên ▼]  [Lọc Nhóm ▼]  [Lọc Bàn ▼]  [Lọc Gửi ▼]  [Lọc RSVP ▼]          │
│                                                                                                        │
│  [ ➕ Thêm 1 khách ]   [ 📋 Nhập nhanh (Dán text) ]   [ 💬 Cài đặt Zalo ]   [ 📥 Xuất danh sách Excel ] │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [ ] | STT | Khách Mời          | Bên      | Nhóm      | Bàn (8) | Đã Gửi | Phản Hồi RSVP  | Mừng Cưới   | Thao Tác      │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [ ] |  1  | Anh Nguyễn Văn Nam | Nhà Trai | Bạn Cấp 3 | Bàn 01  |  [v]   | ✅ Đi (2 người)| 500k (QR)   | [Zalo][📱][✎][🗑]│
│ [ ] |  2  | Chị Lê Thị Thảo    | Nhà Trai | Đồng nghiệp| Bàn 02 |  [v]   | ⏳ Chưa rep    | Chưa mừng   | [Zalo][📱][✎][🗑]│
│ [ ] |  3  | Gia đình Bác Hùng  | Nhà Gái  | Họ hàng   | Bàn 03  |  [ ]   | ❌ Không đến   | 1.000k (TM) | [Zalo][📱][✎][🗑]│
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
│ Floating Bar (Khi tick chọn): [ Đã chọn 15 khách ]  [ Đánh dấu đã gửi ]  [ Xếp vào Bàn... ]  [ Copy link ] │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. THIẾT KẾ KỸ THUẬT (TECHNICAL ARCHITECTURE)

### A. Cập nhật Model trong `prisma/schema.prisma`
Mở rộng model `Guest` để bổ sung các thuộc tính phân loại và theo dõi:

```prisma
model Guest {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  slug      String?  @unique
  side      String   @default("nha-trai") // "nha-trai" | "nha-gai"
  group     String?  @default("Bạn bè")   // "Họ hàng", "Bạn Cấp 3", "Đồng nghiệp",...
  table     String?                       // "Bàn 01", "Bàn VIP",...
  isSent    Boolean  @default(false)      // Trạng thái đã gửi link cho khách
  phone     String?
  note      String?
  createdAt DateTime @default(now())
  rsvps     Rsvp[]
  gifts     Gift[]
}
```

### B. Thiết kế API Endpoints
1. `GET /api/guests`:
   - Trả về danh sách khách kèm theo relations `rsvps` và `gifts` để giao diện hiển thị ngay cột RSVP và Tiền mừng cưới.
   - Hỗ trợ tham số lọc: `side`, `group`, `isSent`, `attending`, `search`.
2. `POST /api/guests/bulk`:
   - Payload: `{ guests: Array<{ name: string, phone?: string, side: string, group?: string, table?: string }> }`.
   - Xử lý tạo slug tự động hàng loạt và insert trong 1 batch transaction.
3. `PATCH /api/guests`:
   - Payload: `{ id: string, name?, phone?, side?, group?, table?, isSent?, note? }`.
   - Cập nhật thông tin nhanh cho khách mà không đổi slug cũ.
4. `PATCH /api/guests/bulk`:
   - Payload: `{ ids: string[], isSent?: boolean, group?: string, table?: string }`.
   - Đánh dấu đã gửi hoặc xếp bàn hàng loạt cho nhiều khách đã chọn.

---

## 6. LỘ TRÌNH THỰC HIỆN (PHASED ROADMAP)

### Giai đoạn 1: Nền tảng dữ liệu & Nhập liệu siêu tốc
- **Bước 1.1:** Cập nhật `prisma/schema.prisma` (thêm `group`, `table`, `isSent`) và đồng bộ CSDL `npx prisma db push`.
- **Bước 1.2:** Xây dựng API `POST /api/guests/bulk` và `PATCH /api/guests`.
- **Bước 1.3:** Xây dựng Modal **"Dán danh sách nhanh (Smart Paste)"** tự bóc tách tên, SĐT, nhóm.
- **Bước 1.4:** Modal **"Chỉnh sửa thông tin khách"** (Edit Modal) và công tắc gạt **"Đã gửi thiệp"**.

### Giai đoạn 2: Xây dựng Màn hình Chuyên Sâu `/admin/guests` (Full Workspace)
- **Bước 2.1:** Dựng trang chuyên dụng `/admin/guests` toàn màn hình, có breadcrumb quay về `/admin`.
- **Bước 2.2:** Tích hợp **Thước đo Mâm cỗ (Quy chuẩn ngồi 8)** tự động tính số mâm chính + mâm dự phòng theo RSVP thực tế.
- **Bước 2.3:** Tích hợp **Sơ đồ Xếp bàn tiệc (Bàn 8 chỗ)** hiển thị trực quan sức chứa từng bàn (8/8, 7/8...).
- **Bước 2.4:** Tính năng **1-Click Gửi Zalo** & **Khung iPhone Live Preview** thiệp cưới.
- **Bước 2.5:** **Thanh thao tác nổi (Floating Multi-Select Bar)** khi chọn nhiều khách và **Xuất Excel toàn diện**.

---

## 7. KẾT LUẬN & ĐÁNH GIÁ

Kế hoạch nâng cấp này giải quyết trọn vẹn điểm nghẽn lớn nhất trong khâu chuẩn bị cưới: **nhập liệu danh sách hàng trăm khách mời** và **kiểm soát xem đã gửi thiệp cho ai, ai đã nhận lời đi, ai đã mừng tiền**.

Sau khi nâng cấp, hệ thống không chỉ là một trang web thiệp cưới đơn thuần mà sẽ trở thành một **nền tảng điều phối tiệc cưới toàn diện (Wedding Management Suite)** cho cô dâu chú rể.
