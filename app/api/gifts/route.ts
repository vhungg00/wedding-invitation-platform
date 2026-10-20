import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

// GET /api/gifts - Lấy danh sách quà mừng và tổng kết
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const side = searchParams.get("side"); // "nha-trai" | "nha-gai"
    const status = searchParams.get("status"); // "RECEIVED" | "PENDING"
    const method = searchParams.get("method"); // "QR" | "CASH"
    const query = searchParams.get("q")?.trim() || searchParams.get("search")?.trim();
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit") || searchParams.get("pageSize");
    const all = searchParams.get("all") === "true";
    const sortKey = searchParams.get("sortKey") || "createdAt";
    const sortType =
      (searchParams.get("sortType") || "desc").toLowerCase() === "asc"
        ? "asc"
        : "desc";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (side && side !== "all") {
      where.side = side;
    }
    if (status && status !== "all") {
      where.status = status;
    }
    if (method && method !== "all") {
      where.method = method;
    }

    if (query) {
      where.OR = [
        { guestName: { contains: query, mode: "insensitive" } },
        { phone: { contains: query } },
        { note: { contains: query, mode: "insensitive" } },
      ];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: any = {};
    if (["guestName", "amount", "createdAt", "side", "method", "status"].includes(sortKey)) {
      orderBy[sortKey] = sortType;
    } else {
      orderBy.createdAt = "desc";
    }

    // Thống kê nhanh toàn bộ DB (không bị filter theo query/status)
    const statsAll = await prisma.gift.findMany({
      select: {
        amount: true,
        side: true,
        status: true,
      },
    });

    const totalAmount = statsAll
      .filter((g) => g.status === "RECEIVED")
      .reduce((sum, g) => sum + (g.amount || 0), 0);

    const nhaTraiAmount = statsAll
      .filter((g) => g.status === "RECEIVED" && g.side === "nha-trai")
      .reduce((sum, g) => sum + (g.amount || 0), 0);

    const nhaGaiAmount = statsAll
      .filter((g) => g.status === "RECEIVED" && g.side === "nha-gai")
      .reduce((sum, g) => sum + (g.amount || 0), 0);

    const receivedCount = statsAll.filter((g) => g.status === "RECEIVED").length;
    const pendingCount = statsAll.filter((g) => g.status === "PENDING").length;

    const summary = {
      totalAmount,
      nhaTraiAmount,
      nhaGaiAmount,
      totalCount: statsAll.length,
      receivedCount,
      pendingCount,
    };

    if (pageParam && !all) {
      const page = Math.max(1, parseInt(pageParam, 10) || 1);
      const limit = Math.max(1, parseInt(limitParam || "10", 10) || 10);
      const skip = (page - 1) * limit;

      const [total, gifts] = await Promise.all([
        prisma.gift.count({ where }),
        prisma.gift.findMany({
          where,
          include: {
            guest: {
              select: {
                id: true,
                name: true,
                slug: true,
                phone: true,
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({
        success: true,
        data: gifts,
        total,
        page,
        limit,
        totalPages,
        pagination: { total, page, limit, totalPages },
        summary,
      });
    }

    const [total, gifts] = await Promise.all([
      prisma.gift.count({ where }),
      prisma.gift.findMany({
        where,
        include: {
          guest: {
            select: {
              id: true,
              name: true,
              slug: true,
              phone: true,
            },
          },
        },
        orderBy,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: gifts,
      total,
      page: 1,
      limit: gifts.length,
      totalPages: 1,
      pagination: { total, page: 1, limit: gifts.length, totalPages: 1 },
      summary,
    });
  } catch (error) {
    console.error("Error fetching gifts:", error);
    return NextResponse.json(
      { success: false, message: "Không thể lấy danh sách mừng cưới" },
      { status: 500 }
    );
  }
}

// POST /api/gifts - Thêm mừng cưới (Khách tự gửi báo hỷ hoặc Admin thêm)
export async function POST(request: Request) {
  try {
    const isAdmin = await isAuthenticated();
    const body = await request.json();
    const {
      guestName,
      amount,
      side = "nha-trai",
      method = "QR",
      phone,
      note,
      guestId,
      status,
    } = body;

    if (!guestName || !guestName.trim()) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập tên người mừng cưới" },
        { status: 400 }
      );
    }

    const parsedAmount = Number(amount) || 0;

    // Nếu không phải admin gửi thì mặc định là PENDING để chờ duyệt
    const initialStatus = isAdmin ? status || "RECEIVED" : "PENDING";

    const gift = await prisma.gift.create({
      data: {
        guestName: guestName.trim(),
        amount: parsedAmount,
        side: side === "nha-gai" ? "nha-gai" : "nha-trai",
        method: method === "CASH" ? "CASH" : "QR",
        status: initialStatus,
        phone: phone ? phone.trim() : null,
        note: note ? note.trim() : null,
        guestId: guestId || null,
      },
      include: {
        guest: true,
      },
    });

    return NextResponse.json({ success: true, data: gift }, { status: 201 });
  } catch (error) {
    console.error("Error creating gift:", error);
    return NextResponse.json(
      { success: false, message: "Không thể tạo bản ghi mừng cưới" },
      { status: 500 }
    );
  }
}

// PATCH /api/gifts - Cập nhật trạng thái / số tiền / ghi chú (Cần quyền Admin)
export async function PATCH(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json(
        { success: false, message: "Bạn cần đăng nhập quyền quản trị" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, status, amount, note, guestName, side, method } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Thiếu ID bản ghi mừng cưới" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (amount !== undefined) updateData.amount = Number(amount) || 0;
    if (note !== undefined) updateData.note = note ? note.trim() : null;
    if (guestName !== undefined) updateData.guestName = guestName.trim();
    if (side !== undefined) updateData.side = side;
    if (method !== undefined) updateData.method = method;

    const updated = await prisma.gift.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating gift:", error);
    return NextResponse.json(
      { success: false, message: "Không thể cập nhật mừng cưới" },
      { status: 500 }
    );
  }
}

// DELETE /api/gifts - Xóa bản ghi (Cần quyền Admin)
export async function DELETE(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json(
        { success: false, message: "Bạn cần đăng nhập quyền quản trị" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Thiếu ID bản ghi mừng cưới" },
        { status: 400 }
      );
    }

    await prisma.gift.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa bản ghi mừng cưới" });
  } catch (error) {
    console.error("Error deleting gift:", error);
    return NextResponse.json(
      { success: false, message: "Không thể xóa bản ghi mừng cưới" },
      { status: 500 }
    );
  }
}
