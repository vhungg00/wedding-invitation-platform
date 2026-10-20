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

    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit") || searchParams.get("pageSize");
    const fetchAll = searchParams.get("fetchAll") === "true";
    const sortKey = searchParams.get("sortKey") || "createdAt";
    const sortType =
      (searchParams.get("sortType") || "desc").toLowerCase() === "asc"
        ? "asc"
        : "desc";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: any = {};
    if (["name", "createdAt", "hearts"].includes(sortKey)) {
      orderBy[sortKey] = sortType;
    } else {
      orderBy.createdAt = "desc";
    }

    if (pageParam && !fetchAll) {
      const page = Math.max(1, parseInt(pageParam, 10) || 1);
      const limit = Math.max(1, parseInt(limitParam || "9", 10) || 9);
      const skip = (page - 1) * limit;

      const [total, wishes] = await Promise.all([
        prisma.wish.count({ where }),
        prisma.wish.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({
        success: true,
        data: wishes,
        total,
        page,
        limit,
        totalPages,
        pagination: { total, page, limit, totalPages },
      });
    }

    const [total, wishes] = await Promise.all([
      prisma.wish.count({ where }),
      prisma.wish.findMany({
        where,
        orderBy,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: wishes,
      total,
      page: 1,
      limit: wishes.length,
      totalPages: 1,
      pagination: { total, page: 1, limit: wishes.length, totalPages: 1 },
    });
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
