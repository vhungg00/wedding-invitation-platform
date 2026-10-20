import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

// Tạo slug không dấu đơn giản
export function generateGuestSlug(name: string): string {
  const slugBase = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${slugBase || "khach"}-${uniqueSuffix}`;
}

// GET /api/guests - Lấy danh sách khách mời (kèm RSVP và Gift) hoặc tìm theo slug/id
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");

    // Nếu có slug hoặc id, trả về thông tin khách mời đơn lẻ
    if (slug || id) {
      const guest = await prisma.guest.findFirst({
        where: slug ? { slug } : { id: id! },
        select: {
          id: true,
          name: true,
          slug: true,
          side: true,
          group: true,
          table: true,
          isSent: true,
          phone: true,
          note: true,
        },
      });

      if (!guest) {
        return NextResponse.json(
          { success: false, message: "Không tìm thấy khách mời" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: guest });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    const side = searchParams.get("side");
    const group = searchParams.get("group");
    const isSent = searchParams.get("isSent");
    const rsvp = searchParams.get("rsvp");
    const search = searchParams.get("search")?.trim() || searchParams.get("q")?.trim();
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit") || searchParams.get("pageSize");
    const all = searchParams.get("all") === "true";
    const sortKey = searchParams.get("sortKey") || "createdAt";
    const sortType =
      (searchParams.get("sortType") || "desc").toLowerCase() === "asc"
        ? "asc"
        : "desc";

    if (side && side !== "all") where.side = side;
    if (group && group !== "all") where.group = group;
    if (isSent && isSent !== "all") where.isSent = isSent === "true";

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { group: { contains: search, mode: "insensitive" } },
        { table: { contains: search, mode: "insensitive" } },
        { note: { contains: search, mode: "insensitive" } },
      ];
    }

    if (rsvp && rsvp !== "all") {
      if (rsvp === "attending") {
        where.rsvps = { some: { attending: true } };
      } else if (rsvp === "declined") {
        where.rsvps = { some: { attending: false } };
      } else if (rsvp === "none") {
        where.rsvps = { none: {} };
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: any = {};
    if (["name", "createdAt", "side", "group", "table", "isSent"].includes(sortKey)) {
      orderBy[sortKey] = sortType;
    } else {
      orderBy.createdAt = "desc";
    }

    // Nếu có tham số page và không phải lấy tất cả
    if (pageParam && !all) {
      const page = Math.max(1, parseInt(pageParam, 10) || 1);
      const limit = Math.max(1, parseInt(limitParam || "20", 10) || 20);
      const skip = (page - 1) * limit;

      const [total, guests] = await Promise.all([
        prisma.guest.count({ where }),
        prisma.guest.findMany({
          where,
          include: {
            rsvps: true,
            gifts: true,
          },
          orderBy,
          skip,
          take: limit,
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({
        success: true,
        data: guests,
        total,
        page,
        limit,
        totalPages,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      });
    }

    // Lấy toàn bộ danh sách khi all=true hoặc không truyền page
    const [total, guests] = await Promise.all([
      prisma.guest.count({ where }),
      prisma.guest.findMany({
        where,
        include: {
          rsvps: true,
          gifts: true,
        },
        orderBy,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: guests,
      total,
      page: 1,
      limit: guests.length,
      totalPages: 1,
      pagination: {
        total,
        page: 1,
        limit: guests.length,
        totalPages: 1,
      },
    });
  } catch (error) {
    console.error("Error fetching guests:", error);
    return NextResponse.json(
      { success: false, message: "Không thể lấy danh sách khách mời" },
      { status: 500 }
    );
  }
}

// POST /api/guests - Tạo 1 khách mời mới
export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json(
        { success: false, message: "Bạn cần đăng nhập quyền quản trị" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, side, phone, note, group, table, isSent } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập tên khách mời" },
        { status: 400 }
      );
    }

    const slug = generateGuestSlug(name);

    const guest = await prisma.guest.create({
      data: {
        name: name.trim(),
        slug,
        side: side || "nha-trai",
        group: group ? group.trim() : "Bạn bè",
        table: table ? table.trim() : null,
        isSent: Boolean(isSent),
        phone: phone ? phone.trim() : null,
        note: note ? note.trim() : null,
      },
      include: {
        rsvps: true,
        gifts: true,
      },
    });

    return NextResponse.json({ success: true, data: guest }, { status: 201 });
  } catch (error) {
    console.error("Error creating guest:", error);
    return NextResponse.json(
      { success: false, message: "Không thể thêm khách mời" },
      { status: 500 }
    );
  }
}

// PATCH /api/guests - Cập nhật thông tin khách mời
export async function PATCH(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json(
        { success: false, message: "Bạn cần đăng nhập quyền quản trị" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, side, phone, note, group, table, isSent } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Thiếu ID khách mời" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (side !== undefined) updateData.side = side;
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (group !== undefined) updateData.group = group ? group.trim() : null;
    if (table !== undefined) updateData.table = table ? table.trim() : null;
    if (isSent !== undefined) updateData.isSent = Boolean(isSent);
    if (note !== undefined) updateData.note = note ? note.trim() : null;

    const updated = await prisma.guest.update({
      where: { id },
      data: updateData,
      include: {
        rsvps: true,
        gifts: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating guest:", error);
    return NextResponse.json(
      { success: false, message: "Không thể cập nhật khách mời" },
      { status: 500 }
    );
  }
}

// DELETE /api/guests - Xóa khách mời
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
        { success: false, message: "Thiếu ID khách mời" },
        { status: 400 }
      );
    }

    await prisma.guest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa khách mời" });
  } catch (error) {
    console.error("Error deleting guest:", error);
    return NextResponse.json(
      { success: false, message: "Không thể xóa khách mời" },
      { status: 500 }
    );
  }
}
