import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/rsvp - Lấy danh sách phản hồi RSVP
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const side = searchParams.get("side");
    const attending = searchParams.get("attending");
    const search = searchParams.get("search");

    const where: any = {};

    if (side && side !== "all") {
      where.side = side;
    }

    if (attending !== null && attending !== undefined && attending !== "all") {
      where.attending = attending === "true";
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { phone: { contains: term } },
      ];
    }

    const rsvps = await prisma.rsvp.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: rsvps });
  } catch (error) {
    console.error("Error fetching RSVPs:", error);
    return NextResponse.json(
      { success: false, message: "Không thể lấy danh sách RSVP" },
      { status: 500 }
    );
  }
}

// POST /api/rsvp - Gửi phản hồi RSVP
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, attending, guestCount, side, note, guestId } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập tên của bạn" },
        { status: 400 }
      );
    }

    const count = parseInt(guestCount, 10) || 1;
    const isAttending = attending === true || attending === "true";

    const rsvp = await prisma.rsvp.create({
      data: {
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        attending: isAttending,
        guestCount: isAttending ? count : 0,
        side: side || "nha-trai",
        note: note ? note.trim() : null,
        guestId: guestId || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Xác nhận tham dự thành công! Chân thành cảm ơn bạn.",
        data: rsvp,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating RSVP:", error);
    return NextResponse.json(
      { success: false, message: "Đã có lỗi xảy ra khi lưu thông tin" },
      { status: 500 }
    );
  }
}
