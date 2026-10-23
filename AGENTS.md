<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Quy Trình Cập Nhật Ảnh Đại Diện Link (Open Graph / `og-image.jpg` cho Zalo & Messenger)

Khi người dùng yêu cầu đổi ảnh đại diện hiển thị khi chia sẻ link thiệp cưới lên **Facebook Messenger** và **Zalo**:

1. **Yêu cầu kỹ thuật bắt buộc (đặc biệt với Facebook Messenger)**:
   - Ảnh đích `public/og-image.jpg` **bắt buộc phải là ảnh ngang kích thước chuẩn `1200×630` (tỉ lệ `1.91:1`)**, định dạng JPEG chuẩn (`sRGB`), đã loại bỏ EXIF nặng và dung lượng `< 300KB` (tối ưu khoảng `120KB–180KB`).
   - *Lưu ý*: Nếu để ảnh dọc (ví dụ `800×1200`), Zalo vẫn hiện nhưng **Facebook Messenger sẽ tự động ẩn ảnh** và chỉ hiện Title + Description.

2. **Lệnh xử lý ảnh bằng `sharp` (có sẵn trong `node_modules`)**:
   - Nếu ảnh gốc là ảnh dọc (ví dụ `W × H`), tính chiều cao vùng cắt theo tỉ lệ `1200:630`: `cropHeight = Math.round(W * 630 / 1200)`, chọn `top` sao cho lấy trọn gương mặt cô dâu chú rể (thường `top = Math.round(H * 0.10)` đến `0.15`), sau đó kiểm tra lại ảnh xuất ra bằng `read_file`:
   ```bash
   node -e '
   const sharp = require("sharp");
   sharp("DUONG_DAN_ANH_GOC")
     .extract({ left: 0, top: Math.round(H * 0.11), width: W, height: Math.round(W * 630 / 1200) })
     .resize(1200, 630)
     .jpeg({ quality: 85, progressive: false, chromaSubsampling: "4:2:0" })
     .toFile("public/og-image.jpg")
     .then(() => console.log("Done 1200x630 og-image.jpg"));
   '
   ```

3. **Tăng version query (`?v=N`) để phá cache của Facebook & Zalo**:
   - Mở `app/layout.tsx` và `app/nha-gai/layout.tsx`.
   - Tại biến `ogImageAbsolute`, tăng số phiên bản ở đuôi `?v=2` lên `?v=3`, `?v=4`,...
   - Đảm bảo `openGraph.images[0]` giữ đúng `width: 1200, height: 630, type: "image/jpeg", secureUrl: ogImageAbsolute` và giữ nguyên `url: siteUrl` (hoặc `${siteUrl}/nha-gai`).

4. **Làm mới cache sau khi deploy lên Vercel**:
   - Sau khi push và Vercel deploy xong, vào [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) nhập URL trang chủ và `/nha-gai`, bấm **Thu thập lại (Scrape Again)** 1–2 lần để Messenger cập nhật ảnh ngay lập tức.

