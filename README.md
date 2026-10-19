# Thiệp Cưới Online & Nền Tảng Quản Lý Khách Mời (Việt Hùng & Xuân Ly)

Nền tảng thiệp cưới điện tử hiện đại, cá nhân hóa và quản trị khách mời toàn diện.

🌐 **Website đã triển khai**: [https://damcuoihungly.vercel.app/](https://damcuoihungly.vercel.app/)  
🛡️ **Trang Quản trị (Admin)**: [https://damcuoihungly.vercel.app/admin](https://damcuoihungly.vercel.app/admin)

---

## 📖 Tài Liệu Hướng Dẫn Chi Tiết
Vui lòng xem file [HUONG_DAN_SU_DUNG.md](file:///Users/hungtv/Desktop/wedding-invitation-platform/HUONG_DAN_SU_DUNG.md) để xem đầy đủ hướng dẫn về:
* Cách tạo link thiệp cá nhân hóa cho từng khách mời (`/?to=Tên+Khách`)
* Cách quản lý RSVP và xuất danh sách ra file Excel/CSV
* Cấu hình database MongoDB Atlas
* Hướng dẫn thiết lập biến môi trường trên Vercel
* Danh sách API endpoints và tài khoản Admin

---

## 🛠️ Công Nghệ Sử Dụng
* **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
* **Frontend**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [AOS](https://michalsnik.github.io/aos/) (Scroll Animation)
* **Database & ORM**: [Prisma ORM](https://www.prisma.io/) kết nối [MongoDB Atlas](https://www.mongodb.com/atlas)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Hosting**: [Vercel](https://vercel.com/)

---

## 🚀 Khởi Chạy Nhanh (Local Development)

```bash
# 1. Cài đặt thư viện
npm install

# 2. Khởi động môi trường phát triển
npm run dev
```

Mở trình duyệt:
* Trang thiệp Nhà Trai: [http://localhost:3000](http://localhost:3000)
* Trang thiệp Nhà Gái: [http://localhost:3000/nha-gai](http://localhost:3000/nha-gai)
* Dashboard Quản trị: [http://localhost:3000/admin](http://localhost:3000/admin) *(Tài khoản: `admin` / Mật khẩu: `hungly2026`)*
* Prisma Studio (Quản lý Database trực quan): `npm run db:studio`
