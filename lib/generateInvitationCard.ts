import { GuestItem } from "@/app/admin/types";

function slugifyName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCornerOrnament(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scaleX: number,
  scaleY: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scaleX, scaleY);
  ctx.strokeStyle = "#C59B5F";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(0, 48);
  ctx.lineTo(0, 12);
  ctx.quadraticCurveTo(0, 0, 12, 0);
  ctx.lineTo(48, 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(8, 34);
  ctx.lineTo(8, 14);
  ctx.quadraticCurveTo(8, 8, 14, 8);
  ctx.lineTo(34, 8);
  ctx.stroke();

  ctx.fillStyle = "#C59B5F";
  ctx.beginPath();
  ctx.arc(16, 16, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export async function generateInvitationCardBlob(
  guest: GuestItem,
  origin?: string
): Promise<{ blob: Blob; dataUrl: string; filename: string }> {
  const siteOrigin =
    origin || (typeof window !== "undefined" ? window.location.origin : "https://damcuoihungly.vercel.app");

  const isNhaGai = guest.side === "nha-gai";
  const path = isNhaGai ? "/nha-gai" : "";
  const guestUrl = `${siteOrigin}${path}?g=${guest.slug || encodeURIComponent(guest.name)}`;

  // Đợi font chữ sẵn sàng
  if (typeof document !== "undefined" && (document as any).fonts) {
    try {
      await (document as any).fonts.ready;
    } catch {}
  }

  const width = 1200;
  const height = 675; // Tỉ lệ 16:9 cực đẹp khi gửi qua Zalo/Messenger
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Không thể khởi tạo HTML5 Canvas");
  }

  // 1. Nền kem sang trọng (Cream / Champagne Gradient)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#FFFDF9");
  bgGrad.addColorStop(0.5, "#FFF7EE");
  bgGrad.addColorStop(1, "#FDF1E6");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Họa tiết ánh sáng tròn nhẹ ở góc
  const glowGrad = ctx.createRadialGradient(820, 220, 40, 820, 220, 450);
  glowGrad.addColorStop(0, "rgba(244, 63, 94, 0.06)");
  glowGrad.addColorStop(1, "rgba(244, 63, 94, 0)");
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Viền khung vàng kim kép (Double Gold Border)
  ctx.strokeStyle = "#DEC397";
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 22, 22, width - 44, height - 44, 24);
  ctx.stroke();

  ctx.strokeStyle = "#EAD8BA";
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, 32, 32, width - 64, height - 64, 18);
  ctx.stroke();

  // Họa tiết 4 góc
  drawCornerOrnament(ctx, 36, 36, 1, 1);
  drawCornerOrnament(ctx, width - 36, 36, -1, 1);
  drawCornerOrnament(ctx, 36, height - 36, 1, -1);
  drawCornerOrnament(ctx, width - 36, height - 36, -1, -1);

  // 3. Khung ảnh cưới bên trái
  const photoX = 58;
  const photoY = 58;
  const photoW = 395;
  const photoH = height - 116;

  // Đổ bóng khung ảnh
  ctx.save();
  ctx.shadowColor = "rgba(139, 92, 46, 0.18)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = "#FFFFFF";
  drawRoundedRect(ctx, photoX - 6, photoY - 6, photoW + 12, photoH + 12, 22);
  ctx.fill();
  ctx.restore();

  try {
    const coupleImg = await loadImage("/album/anh-chinh.JPG");
    ctx.save();
    drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 16);
    ctx.clip();

    // Tính toán crop cover giữ trung tâm phía trên
    const imgRatio = coupleImg.width / coupleImg.height;
    const boxRatio = photoW / photoH;
    let drawW = photoW;
    let drawH = photoH;
    let offsetX = photoX;
    let offsetY = photoY;

    if (imgRatio > boxRatio) {
      drawW = photoH * imgRatio;
      offsetX = photoX - (drawW - photoW) / 2;
    } else {
      drawH = photoW / imgRatio;
      offsetY = photoY - (drawH - photoH) * 0.15;
    }

    ctx.drawImage(coupleImg, offsetX, offsetY, drawW, drawH);

    // Lớp phủ gradient nhẹ dưới đáy ảnh
    const photoOverlay = ctx.createLinearGradient(0, photoY + photoH - 140, 0, photoY + photoH);
    photoOverlay.addColorStop(0, "rgba(0,0,0,0)");
    photoOverlay.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = photoOverlay;
    ctx.fillRect(photoX, photoY + photoH - 140, photoW, 140);

    // Chữ nhỏ trên ảnh
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "600 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SAVE THE DATE • 12.2026", photoX + photoW / 2, photoY + photoH - 22);
    ctx.restore();
  } catch {
    ctx.save();
    drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 16);
    ctx.fillStyle = "#FCE7F3";
    ctx.fill();
    ctx.restore();
  }

  // Viền vàng mảnh quanh ảnh
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 16);
  ctx.stroke();

  // 4. Phần nội dung chữ bên phải
  const rightCenterX = 815;

  // Tiêu đề phụ
  const eventTitle = isNhaGai ? "THIỆP MỜI LỄ VU QUY" : "THIỆP MỜI LỄ THÀNH HÔN";
  ctx.fillStyle = "#9A6B3B";
  ctx.font = "700 15px sans-serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "4px";
  ctx.fillText(eventTitle, rightCenterX, 92);
  ctx.letterSpacing = "0px";

  // Tên Cô Dâu & Chú Rể
  const coupleNames = isNhaGai ? "Xuân Ly  &  Việt Hùng" : "Việt Hùng  &  Khánh Ly";
  ctx.fillStyle = "#B91C1C";
  ctx.font = "italic 46px 'Imperial Script', 'Georgia', serif";
  ctx.fillText(coupleNames, rightCenterX, 152);

  // Đường kẻ hoa văn dưới tên cặp đôi
  ctx.strokeStyle = "#D6B88A";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(rightCenterX - 140, 174);
  ctx.lineTo(rightCenterX - 18, 174);
  ctx.moveTo(rightCenterX + 18, 174);
  ctx.lineTo(rightCenterX + 140, 174);
  ctx.stroke();

  ctx.fillStyle = "#E11D48";
  ctx.font = "16px serif";
  ctx.fillText("❤", rightCenterX, 180);

  // Dòng "TRÂN TRỌNG KÍNH MỜI"
  ctx.fillStyle = "#57534E";
  ctx.font = "600 15px sans-serif";
  ctx.letterSpacing = "2.5px";
  ctx.fillText("TRÂN TRỌNG KÍNH MỜI", rightCenterX, 222);
  ctx.letterSpacing = "0px";

  // Hộp nổi bật chứa Tên Khách Mời
  const bannerW = 610;
  const bannerH = 82;
  const bannerX = rightCenterX - bannerW / 2;
  const bannerY = 240;

  ctx.save();
  const bannerGrad = ctx.createLinearGradient(bannerX, bannerY, bannerX + bannerW, bannerY);
  bannerGrad.addColorStop(0, "rgba(255, 241, 242, 0.4)");
  bannerGrad.addColorStop(0.5, "#FFF1F2");
  bannerGrad.addColorStop(1, "rgba(255, 241, 242, 0.4)");
  ctx.fillStyle = bannerGrad;
  drawRoundedRect(ctx, bannerX, bannerY, bannerW, bannerH, 16);
  ctx.fill();

  ctx.strokeStyle = "#FECDD3";
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, bannerX, bannerY, bannerW, bannerH, 16);
  ctx.stroke();
  ctx.restore();

  // Vẽ Tên Khách Mời (Tự động co chữ nếu tên quá dài)
  let nameFontSize = 36;
  ctx.font = `bold ${nameFontSize}px 'Georgia', serif`;
  while (ctx.measureText(guest.name).width > bannerW - 48 && nameFontSize > 22) {
    nameFontSize -= 2;
    ctx.font = `bold ${nameFontSize}px 'Georgia', serif`;
  }
  ctx.fillStyle = "#9F1239";
  ctx.textAlign = "center";
  ctx.fillText(guest.name, rightCenterX, bannerY + 52);

  // Lời dẫn
  ctx.fillStyle = "#57534E";
  ctx.font = "italic 16px 'Georgia', serif";
  ctx.fillText(
    "Đến dự bữa tiệc thân mật chung vui cùng gia đình chúng tôi",
    rightCenterX,
    354
  );

  // 5. Khung Thời gian & Địa điểm + Mã QR bên dưới
  const infoX = 505;
  const infoY = 385;

  ctx.textAlign = "left";

  // Thời gian
  const timeText = isNhaGai
    ? "10h30 • Thứ Bảy, 05.12.2026"
    : "10h00 • Chủ Nhật, 06.12.2026";
  const lunarText = isNhaGai
    ? "(Tức ngày 27 tháng 10 năm Bính Ngọ)"
    : "(Tức ngày 28 tháng 10 năm Bính Ngọ)";
  const venueTitle = isNhaGai ? "Tại: Gia đình Nhà Gái" : "Tại: Gia đình Nhà Trai";
  const addressText = isNhaGai
    ? "1003 Lê Thanh, P. Cam Đường, Lào Cai"
    : "Thôn Na Phả, Xã Bản Lầu, Tỉnh Lào Cai";

  ctx.fillStyle = "#9A6B3B";
  ctx.font = "700 13px sans-serif";
  ctx.fillText("⏰ THỜI GIAN TỔ CHỨC", infoX, infoY);

  ctx.fillStyle = "#1C1917";
  ctx.font = "bold 23px 'Georgia', serif";
  ctx.fillText(timeText, infoX, infoY + 30);

  ctx.fillStyle = "#78716C";
  ctx.font = "italic 14px 'Georgia', serif";
  ctx.fillText(lunarText, infoX, infoY + 52);

  // Địa điểm
  ctx.fillStyle = "#9A6B3B";
  ctx.font = "700 13px sans-serif";
  ctx.fillText("📍 ĐỊA ĐIỂM", infoX, infoY + 92);

  ctx.fillStyle = "#1C1917";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText(venueTitle, infoX, infoY + 118);

  ctx.fillStyle = "#44403C";
  ctx.font = "15px sans-serif";
  ctx.fillText(addressText, infoX, infoY + 142);

  // Dòng chữ ký cảm ơn & Link website trực tiếp
  ctx.fillStyle = "#be123c";
  ctx.font = "italic 14px 'Georgia', serif";
  ctx.fillText("Sự hiện diện của Quý khách là niềm vinh hạnh lớn!", infoX, infoY + 174);

  const shortDisplayUrl = guestUrl.replace(/^https?:\/\//, "");
  ctx.fillStyle = "#9A6B3B";
  ctx.font = "600 12px monospace";
  ctx.fillText(
    shortDisplayUrl.length > 46 ? shortDisplayUrl.slice(0, 46) + "..." : shortDisplayUrl,
    infoX,
    infoY + 196
  );

  // 6. Vẽ Mã QR dẫn thẳng tới thiệp mời cá nhân hóa
  const qrBoxSize = 152;
  const qrBoxX = width - 64 - qrBoxSize;
  const qrBoxY = infoY - 12;

  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
  ctx.shadowBlur = 12;
  drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize + 32, 14);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = "#E7D4B5";
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize + 32, 14);
  ctx.stroke();

  try {
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=1&color=881337&data=${encodeURIComponent(
      guestUrl
    )}`;
    const qrImg = await loadImage(qrApiUrl);
    ctx.drawImage(qrImg, qrBoxX + 12, qrBoxY + 10, qrBoxSize - 24, qrBoxSize - 24);
  } catch {
    ctx.fillStyle = "#9F1239";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Thiệp Điện Tử", qrBoxX + qrBoxSize / 2, qrBoxY + qrBoxSize / 2);
  }

  ctx.fillStyle = "#881337";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("QUÉT MỞ THIỆP MỜI", qrBoxX + qrBoxSize / 2, qrBoxY + qrBoxSize + 15);

  // Xuất ra Blob & DataURL
  const dataUrl = canvas.toDataURL("image/png");
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error("Canvas toBlob thất bại"));
    }, "image/png");
  });

  const cleanSlug = guest.slug || slugifyName(guest.name) || "khach-moi";
  const filename = `thiep-moi-${cleanSlug}.png`;

  return { blob, dataUrl, filename };
}

export async function downloadInvitationCardImage(
  guest: GuestItem,
  origin?: string
): Promise<string> {
  const { blob, filename } = await generateInvitationCardBlob(guest, origin);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return filename;
}

export async function copyInvitationCardImageToClipboard(
  guest: GuestItem,
  origin?: string,
  textMessage?: string
): Promise<boolean> {
  const { blob } = await generateInvitationCardBlob(guest, origin);
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof window !== "undefined" &&
    "ClipboardItem" in window
  ) {
    const clipboardData: Record<string, Blob> = {
      "image/png": blob,
    };
    if (textMessage) {
      clipboardData["text/plain"] = new Blob([textMessage], { type: "text/plain" });
    }
    const item = new ClipboardItem(clipboardData);
    await navigator.clipboard.write([item]);
    return true;
  }
  throw new Error("Trình duyệt không hỗ trợ copy ảnh trực tiếp");
}
