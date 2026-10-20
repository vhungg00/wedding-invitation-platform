import * as XLSX from "xlsx";
import { GuestItem, GiftItem, RsvpItem } from "@/app/admin/types";

/**
 * Xuất file Excel (.xlsx) chuẩn, đẹp mắt cho Danh Sách Khách Mời & Điều Phối Bàn Tiệc
 */
export function exportGuestsToExcel(guests: GuestItem[]) {
  // Thống kê nhanh
  const totalGuests = guests.length;
  let totalAttending = 0;
  let sentCount = 0;
  let totalGiftAmount = 0;

  guests.forEach((g) => {
    if (g.isSent) sentCount++;
    const rsvp = g.rsvps?.[0];
    if (rsvp && rsvp.attending) {
      totalAttending += rsvp.guestCount || 1;
    }
    const gifts = g.gifts || [];
    totalGiftAmount += gifts.reduce((s, gift) => s + (gift.amount || 0), 0);
  });

  const mainTables = Math.ceil((totalAttending || totalGuests) / 8);
  const backupTables = Math.ceil(mainTables * 0.1);
  const totalTables = mainTables + backupTables;

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  // Dữ liệu dạng AOA (Array of Arrays)
  const aoaData: (string | number)[][] = [
    ["HÔN LỄ VIỆT HÙNG & XUÂN LY - 06.12.2026"],
    ["DANH SÁCH KHÁCH MỜI, ĐIỀU PHỐI GỬI THIỆP & XẾP BÀN TIỆC (QUY CHUẨN NGỒI 8)"],
    [
      `Ngày xuất: ${new Date().toLocaleDateString("vi-VN")} | Tổng khách: ${totalGuests} | Đã gửi thiệp: ${sentCount}/${totalGuests} | Xác nhận đi: ${totalAttending} người | Dự toán cỗ (ngồi 8): ${mainTables} mâm chính + ${backupTables} dự phòng = ${totalTables} mâm | Tổng mừng: ${totalGiftAmount.toLocaleString("vi-VN")} đ`,
    ],
    [], // Dòng trống ngăn cách
    [
      "STT",
      "Họ và Tên Khách Mời",
      "Số Điện Thoại",
      "Bên Tiệc",
      "Nhóm Khách",
      "Bàn Tiệc (Ngồi 8)",
      "Trạng Thái Gửi Thiệp",
      "Phản Hồi RSVP",
      "Số Người Đi",
      "Tiền Mừng Cưới (VNĐ)",
      "Link Thiệp Cá Nhân Hóa",
      "Ghi Chú",
      "Ngày Tạo",
    ],
  ];

  // Thêm từng dòng khách mời
  guests.forEach((g, idx) => {
    const rsvp = g.rsvps?.[0];
    const rsvpText = !rsvp
      ? "Chưa phản hồi"
      : rsvp.attending
      ? "Xác nhận tham dự"
      : "Không thể đến";
    const guestCount = rsvp && rsvp.attending ? rsvp.guestCount || 1 : 0;
    const gifts = g.gifts || [];
    const giftTotal = gifts.reduce((s, item) => s + (item.amount || 0), 0);
    const path = g.side === "nha-gai" ? "/nha-gai" : "";
    const guestUrl = `${origin}${path}?g=${g.slug || encodeURIComponent(g.name)}`;

    aoaData.push([
      idx + 1,
      g.name,
      g.phone || "",
      g.side === "nha-trai" ? "Nhà Trai (06.12)" : "Nhà Gái (05.12)",
      g.group || "Bạn bè",
      g.table || "Chưa xếp",
      g.isSent ? "Đã gửi thiệp" : "Chưa gửi",
      rsvpText,
      guestCount,
      giftTotal,
      guestUrl,
      g.note || "",
      new Date(g.createdAt).toLocaleDateString("vi-VN"),
    ]);
  });

  // Tạo Worksheet
  const ws = XLSX.utils.aoa_to_sheet(aoaData);

  // Thiết lập độ rộng cột (Column Widths) để chữ không bị che khuất
  ws["!cols"] = [
    { wch: 6 }, // STT
    { wch: 28 }, // Họ và tên
    { wch: 15 }, // SĐT
    { wch: 18 }, // Bên tiệc
    { wch: 18 }, // Nhóm khách
    { wch: 16 }, // Bàn tiệc
    { wch: 18 }, // Trạng thái gửi
    { wch: 20 }, // Phản hồi RSVP
    { wch: 14 }, // Số người đi
    { wch: 22 }, // Tiền mừng cưới
    { wch: 45 }, // Link thiệp
    { wch: 25 }, // Ghi chú
    { wch: 14 }, // Ngày tạo
  ];

  // Merge tiêu đề trên cùng
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } }, // Dòng 1 merge qua 13 cột
    { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } }, // Dòng 2 merge
    { s: { r: 2, c: 0 }, e: { r: 2, c: 12 } }, // Dòng 3 merge
  ];

  // Tạo Workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Danh Sách Khách Mời");

  // Xuất file .xlsx
  const dateStr = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `Danh_Sach_Khach_Moi_VietHung_XuanLy_${dateStr}.xlsx`);
}

/**
 * Xuất file Excel (.xlsx) chuẩn cho Sổ Mừng Cưới
 */
export function exportGiftsToExcel(gifts: GiftItem[]) {
  const totalAmount = gifts
    .filter((g) => g.status === "RECEIVED")
    .reduce((s, g) => s + (g.amount || 0), 0);
  const nhaTraiAmount = gifts
    .filter((g) => g.status === "RECEIVED" && g.side === "nha-trai")
    .reduce((s, g) => s + (g.amount || 0), 0);
  const nhaGaiAmount = gifts
    .filter((g) => g.status === "RECEIVED" && g.side === "nha-gai")
    .reduce((s, g) => s + (g.amount || 0), 0);
  const receivedCount = gifts.filter((g) => g.status === "RECEIVED").length;
  const pendingCount = gifts.filter((g) => g.status === "PENDING").length;

  const aoaData: (string | number)[][] = [
    ["HÔN LỄ VIỆT HÙNG & XUÂN LY - 06.12.2026"],
    ["SỔ MỪNG CƯỚI & THEO DÕI QUÀ MỪNG TOÀN DIỆN"],
    [
      `Ngày xuất: ${new Date().toLocaleDateString("vi-VN")} | Tổng tiền đã nhận: ${totalAmount.toLocaleString("vi-VN")} đ (${receivedCount} lượt) | Nhà Trai: ${nhaTraiAmount.toLocaleString("vi-VN")} đ | Nhà Gái: ${nhaGaiAmount.toLocaleString("vi-VN")} đ | Chờ đối soát: ${pendingCount}`,
    ],
    [], // Dòng trống
    [
      "STT",
      "Họ và Tên Người Mừng",
      "Số Tiền Mừng (VNĐ)",
      "Bên Tiệc",
      "Hình Thức",
      "Trạng Thái",
      "Số Điện Thoại",
      "Ghi Chú",
      "Thời Gian",
    ],
  ];

  gifts.forEach((g, idx) => {
    aoaData.push([
      idx + 1,
      g.guestName,
      g.amount || 0,
      g.side === "nha-trai" ? "Nhà Trai (06.12)" : "Nhà Gái (05.12)",
      g.method === "CASH" ? "Tiền mặt / Phong bì" : "VietQR / Chuyển khoản",
      g.status === "RECEIVED" ? "Đã nhận tiền" : "Chờ đối soát",
      g.phone || "",
      g.note || "",
      new Date(g.createdAt).toLocaleString("vi-VN"),
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(aoaData);

  ws["!cols"] = [
    { wch: 6 }, // STT
    { wch: 28 }, // Họ tên
    { wch: 22 }, // Số tiền
    { wch: 18 }, // Bên tiệc
    { wch: 22 }, // Hình thức
    { wch: 16 }, // Trạng thái
    { wch: 16 }, // SĐT
    { wch: 30 }, // Ghi chú
    { wch: 20 }, // Thời gian
  ];

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sổ Mừng Cưới");

  const dateStr = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `So_Mung_Cuoi_VietHung_XuanLy_${dateStr}.xlsx`);
}

/**
 * Xuất file Excel (.xlsx) chuẩn cho Danh Sách Khách Tham Dự (Phản hồi RSVP)
 */
export function exportRsvpsToExcel(rsvps: RsvpItem[]) {
  const totalResponses = rsvps.length;
  const attendingList = rsvps.filter((r) => r.attending);
  const attendingResponses = attendingList.length;
  const totalGuestsAttending = attendingList.reduce(
    (sum, r) => sum + (r.guestCount || 1),
    0
  );
  const declinedResponses = rsvps.filter((r) => !r.attending).length;

  const nhaTraiGuests = attendingList
    .filter((r) => r.side === "nha-trai")
    .reduce((sum, r) => sum + (r.guestCount || 1), 0);
  const nhaGaiGuests = attendingList
    .filter((r) => r.side === "nha-gai")
    .reduce((sum, r) => sum + (r.guestCount || 1), 0);

  const mainTables = Math.ceil(totalGuestsAttending / 8);
  const backupTables = Math.ceil(mainTables * 0.1);
  const totalTables = mainTables + backupTables;

  const aoaData: (string | number)[][] = [
    ["HÔN LỄ VIỆT HÙNG & XUÂN LY - 06.12.2026"],
    ["DANH SÁCH PHẢN HỒI THAM DỰ (RSVP) & DỰ TOÁN CỖ TIỆC (QUY CHUẨN NGỒI 8)"],
    [
      `Ngày xuất: ${new Date().toLocaleDateString("vi-VN")} | Tổng phản hồi: ${totalResponses} | Xác nhận đi: ${attendingResponses} phản hồi (${totalGuestsAttending} người) | Không đến: ${declinedResponses} | Nhà Trai: ${nhaTraiGuests} người | Nhà Gái: ${nhaGaiGuests} người | Dự toán cỗ bàn 8: ${mainTables} mâm chính + ${backupTables} dự phòng = ${totalTables} mâm`,
    ],
    [], // Dòng trống ngăn cách
    [
      "STT",
      "Họ và Tên Khách Mời",
      "Số Điện Thoại",
      "Trạng Thái Tham Dự",
      "Số Người Đi",
      "Bên Tiệc",
      "Lời Chúc / Lời Nhắn",
      "Thời Gian Xác Nhận",
    ],
  ];

  rsvps.forEach((r, idx) => {
    aoaData.push([
      idx + 1,
      r.name,
      r.phone || "",
      r.attending ? "Xác nhận tham dự" : "Không thể đến",
      r.attending ? r.guestCount || 1 : 0,
      r.side === "nha-trai" ? "Nhà Trai (06.12)" : "Nhà Gái (05.12)",
      r.note || "",
      new Date(r.createdAt).toLocaleString("vi-VN"),
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(aoaData);

  ws["!cols"] = [
    { wch: 6 }, // STT
    { wch: 28 }, // Họ tên
    { wch: 16 }, // SĐT
    { wch: 22 }, // Trạng thái tham dự
    { wch: 14 }, // Số người đi
    { wch: 20 }, // Bên tiệc
    { wch: 40 }, // Lời nhắn
    { wch: 20 }, // Thời gian
  ];

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Khách Tham Dự (RSVP)");

  const dateStr = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `Danh_Sach_Khach_Tham_Du_RSVP_VietHung_XuanLy_${dateStr}.xlsx`);
}
