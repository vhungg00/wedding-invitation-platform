import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/wishes - Lấy danh sách lời chúc
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const side = searchParams.get("side");
    const all = searchParams.get("all") === "true"; // admin lấy tất cả bao gồm chưa duyệt

    const where: any = {};
    if (!all) {
      where.isApproved = true;
    }

    if (side && side !== "all") {
      where.OR = [{ side }, { side: "both" }];
    }

    const wishes = await prisma.wish.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: wishes });
  } catch (error) {
    console.error("Error fetching wishes:", error);
    return NextResponse.json(
      { success: false, message: "Không thể lấy danh sách lời chúc" },
      { status: 500 }
    );
  }
}

// POST /api/wishes - Gửi lời chúc mới
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, relationship, content, side } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập tên của bạn" },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập nội dung lời chúc" },
        { status: 400 }
      );
    }

    const wish = await prisma.wish.create({
      data: {
        name: name.trim(),
        relationship: relationship ? relationship.trim() : null,
        content: content.trim(),
        side: side || "both",
        isApproved: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Cảm ơn lời chúc thân thương của bạn!",
        data: wish,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating wish:", error);
    return NextResponse.json(
      { success: false, message: "Đã có lỗi xảy ra khi gửi lời chúc" },
      { status: 500 }
    );
  }
}
