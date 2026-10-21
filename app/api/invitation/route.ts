import { NextResponse } from "next/server";
import prisma, { InvitationContent } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import defaultWeddingData from "@/data/wedding-data.json";

const WEDDING_DATA_PATH = path.join(process.cwd(), "data/wedding-data.json");

function getMergedData(dbRecord: any) {
  let fileData = defaultWeddingData as any;
  try {
    if (fs.existsSync(WEDDING_DATA_PATH)) {
      const raw = fs.readFileSync(WEDDING_DATA_PATH, "utf-8");
      fileData = JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read local wedding-data.json, using imported fallback:", err);
  }

  const merged = { ...fileData };

  // Đảm bảo có sẵn qrCodeNhaTrai & qrCodeNhaGai mặc định
  merged.qrCodeNhaTrai =
    fileData.nhaTrai?.donation?.bankAccount?.qrCodeUrl ||
    fileData.donation?.bankAccounts?.[0]?.qrCodeUrl ||
    "/qr.jpeg";
  merged.qrCodeNhaGai =
    fileData.nhaGai?.donation?.bankAccount?.qrCodeUrl ||
    "/qr.jpeg";

  if (!dbRecord) return merged;

  // 1. Merge content JSON lưu trong DB (giờ, ngày, địa chỉ, gia đình, ngân hàng...)
  if (dbRecord.content && typeof dbRecord.content === "object") {
    const c = dbRecord.content;
    if (c.groom) merged.groom = { ...merged.groom, ...c.groom };
    if (c.bride) merged.bride = { ...merged.bride, ...c.bride };
    if (c.nhaTrai) merged.nhaTrai = { ...merged.nhaTrai, ...c.nhaTrai };
    if (c.nhaGai) merged.nhaGai = { ...merged.nhaGai, ...c.nhaGai };
    if (c.quotes) merged.quotes = { ...merged.quotes, ...c.quotes };
    if (c.hero) merged.hero = { ...merged.hero, ...c.hero };
    if (c.calendar) merged.calendar = { ...merged.calendar, ...c.calendar };
    if (c.events) merged.events = c.events;
  }

  // 2. Merge DB record overrides
  if (dbRecord.groomAvatar) merged.groom.avatar = dbRecord.groomAvatar;
  if (dbRecord.brideAvatar) merged.bride.avatar = dbRecord.brideAvatar;
  if (dbRecord.heroBackground) merged.hero.backgroundImage = dbRecord.heroBackground;

  // QR Nhà Trai
  const traiQr = dbRecord.qrCodeNhaTrai || dbRecord.qrCodeUrl;
  if (traiQr) {
    merged.qrCodeNhaTrai = traiQr;
    if (merged.donation?.bankAccounts?.[0]) {
      merged.donation.bankAccounts[0].qrCodeUrl = traiQr;
    }
    if (merged.nhaTrai?.donation?.bankAccount) {
      merged.nhaTrai.donation.bankAccount.qrCodeUrl = traiQr;
    }
  }

  // QR Nhà Gái
  if (dbRecord.qrCodeNhaGai) {
    merged.qrCodeNhaGai = dbRecord.qrCodeNhaGai;
    if (merged.nhaGai?.donation?.bankAccount) {
      merged.nhaGai.donation.bankAccount.qrCodeUrl = dbRecord.qrCodeNhaGai;
    }
    if (merged.donation?.bankAccounts?.[1]) {
      merged.donation.bankAccounts[1].qrCodeUrl = dbRecord.qrCodeNhaGai;
    }
  }

  if (Array.isArray(dbRecord.album) && dbRecord.album.length > 0) {
    merged.album = dbRecord.album;
  }
  if (Array.isArray(dbRecord.invitationImages) && dbRecord.invitationImages.length > 0) {
    merged.invitationImages = dbRecord.invitationImages;
  }

  return merged;
}

export async function GET() {
  try {
    let dbRecord = null;
    try {
      dbRecord = await prisma.invitation.findUnique({
        where: { slug: "default" },
      });
    } catch (dbErr) {
      console.warn("Prisma invitation query warning, falling back to local file:", dbErr);
    }

    const data = getMergedData(dbRecord);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("GET /api/invitation error:", error);
    return NextResponse.json({ success: true, data: defaultWeddingData });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      groomAvatar,
      brideAvatar,
      heroBackground,
      qrCodeUrl,
      qrCodeNhaTrai,
      qrCodeNhaGai,
      album,
      invitationImages,
      content,
      nhaTrai,
      nhaGai,
      groom,
      bride,
      quotes,
    } = body;

    const resolvedTraiQr = qrCodeNhaTrai || qrCodeUrl;
    const resolvedGaiQr = qrCodeNhaGai;

    // Chuẩn bị content object để lưu trữ vào DB
    let contentToSave: InvitationContent | undefined = undefined;
    if (content && typeof content === "object") {
      contentToSave = content as InvitationContent;
    } else if (nhaTrai || nhaGai || groom || bride || quotes) {
      contentToSave = {};
      if (nhaTrai) contentToSave.nhaTrai = nhaTrai;
      if (nhaGai) contentToSave.nhaGai = nhaGai;
      if (groom) contentToSave.groom = groom;
      if (bride) contentToSave.bride = bride;
      if (quotes) contentToSave.quotes = quotes;
    }

    // 1. Lưu vào MongoDB qua Prisma
    let updatedRecord = null;
    let dbErrorMessage = null;
    try {
      updatedRecord = await prisma.invitation.upsert({
        where: { slug: "default" },
        update: {
          groomAvatar: groomAvatar ?? undefined,
          brideAvatar: brideAvatar ?? undefined,
          heroBackground: heroBackground ?? undefined,
          qrCodeUrl: resolvedTraiQr ?? undefined,
          qrCodeNhaTrai: resolvedTraiQr ?? undefined,
          qrCodeNhaGai: resolvedGaiQr ?? undefined,
          album: album ?? undefined,
          invitationImages: invitationImages ?? undefined,
          content: contentToSave ?? undefined,
        },
        create: {
          slug: "default",
          groomAvatar: groomAvatar || null,
          brideAvatar: brideAvatar || null,
          heroBackground: heroBackground || null,
          qrCodeUrl: resolvedTraiQr || null,
          qrCodeNhaTrai: resolvedTraiQr || null,
          qrCodeNhaGai: resolvedGaiQr || null,
          album: album || null,
          invitationImages: invitationImages || null,
          content: contentToSave || null,
        },
      });
      console.log(">>> [API/INVITATION] ĐÃ LƯU VÀO MONGODB THÀNH CÔNG:", updatedRecord.id);
    } catch (dbErr: any) {
      console.warn(">>> [API/INVITATION] Thử lưu tương thích ngược (nếu server cũ chưa nạp schema mới):", dbErr?.message);
      try {
        // Fallback tương thích ngược nếu tiến trình Node.js chưa nạp schema mới
        updatedRecord = await prisma.invitation.upsert({
          where: { slug: "default" },
          update: {
            groomAvatar: groomAvatar ?? undefined,
            brideAvatar: brideAvatar ?? undefined,
            heroBackground: heroBackground ?? undefined,
            qrCodeUrl: resolvedTraiQr ?? undefined,
            album: album ?? undefined,
            invitationImages: invitationImages ?? undefined,
          },
          create: {
            slug: "default",
            groomAvatar: groomAvatar || null,
            brideAvatar: brideAvatar || null,
            heroBackground: heroBackground || null,
            qrCodeUrl: resolvedTraiQr || null,
            album: album || null,
            invitationImages: invitationImages || null,
          },
        });
        console.log(">>> [API/INVITATION] ĐÃ LƯU VÀO MONGODB (tương thích ngược):", updatedRecord.id);
      } catch (retryErr: any) {
        console.error(">>> [API/INVITATION] LỖI LƯU MONGODB:", retryErr?.message || retryErr);
        dbErrorMessage = retryErr?.message;
      }
    }

    // 2. Đồng bộ luôn vào data/wedding-data.json để local luôn đồng nhất
    try {
      if (fs.existsSync(WEDDING_DATA_PATH)) {
        const raw = fs.readFileSync(WEDDING_DATA_PATH, "utf-8");
        const json = JSON.parse(raw);

        if (groomAvatar) json.groom.avatar = groomAvatar;
        if (brideAvatar) json.bride.avatar = brideAvatar;
        if (heroBackground) json.hero.backgroundImage = heroBackground;

        if (resolvedTraiQr) {
          if (json.donation?.bankAccounts?.[0]) json.donation.bankAccounts[0].qrCodeUrl = resolvedTraiQr;
          if (json.nhaTrai?.donation?.bankAccount) json.nhaTrai.donation.bankAccount.qrCodeUrl = resolvedTraiQr;
        }

        if (resolvedGaiQr) {
          if (json.nhaGai?.donation?.bankAccount) json.nhaGai.donation.bankAccount.qrCodeUrl = resolvedGaiQr;
          if (json.donation?.bankAccounts?.[1]) {
            json.donation.bankAccounts[1].qrCodeUrl = resolvedGaiQr;
          }
        }

        if (Array.isArray(album) && album.length > 0) json.album = album;
        if (Array.isArray(invitationImages) && invitationImages.length > 0) json.invitationImages = invitationImages;

        // Đồng bộ content chi tiết vào wedding-data.json
        if (contentToSave) {
          if (contentToSave.groom) json.groom = { ...json.groom, ...contentToSave.groom };
          if (contentToSave.bride) json.bride = { ...json.bride, ...contentToSave.bride };
          if (contentToSave.nhaTrai) json.nhaTrai = { ...json.nhaTrai, ...contentToSave.nhaTrai };
          if (contentToSave.nhaGai) json.nhaGai = { ...json.nhaGai, ...contentToSave.nhaGai };
          if (contentToSave.quotes) json.quotes = { ...json.quotes, ...contentToSave.quotes };
          if (contentToSave.hero) json.hero = { ...json.hero, ...contentToSave.hero };
        }

        fs.writeFileSync(WEDDING_DATA_PATH, JSON.stringify(json, null, 2), "utf-8");
      }
    } catch (fileErr) {
      console.warn("Could not sync to wedding-data.json:", fileErr);
    }

    return NextResponse.json({
      success: true,
      savedToDb: Boolean(updatedRecord),
      dbError: dbErrorMessage,
      message: updatedRecord
        ? "Đã lưu vào Database MongoDB và đồng bộ cấu hình thành công"
        : `Đã lưu vào cấu hình (Cảnh báo DB: ${dbErrorMessage || "Không xác định"})`,
      data: updatedRecord,
    });
  } catch (error: any) {
    console.error("POST /api/invitation error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi lưu thông tin thiệp" },
      { status: 500 }
    );
  }
}
