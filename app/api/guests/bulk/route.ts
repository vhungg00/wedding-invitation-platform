import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { generateGuestSlug } from "../route";

// POST /api/guests/bulk - Tạo hàng loạt khách mời (Smart Paste / Excel)
export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json(
        { success: false, message: "Bạn cần đăng nhập quyền quản trị" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { guests } = body;

    if (!Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json(
        { success: false, message: "Danh sách khách mời không hợp lệ" },
        { status: 400 }
      );
    }

    // Lọc các bản ghi hợp lệ và gán slug
    const validGuests = guests
      .filter((g) => g && typeof g.name === "string" && g.name.trim())
      .map((g) => ({
        name: g.name.trim(),
        slug: generateGuestSlug(g.name),
        side: g.side || "nha-trai",
        group: g.group ? g.group.trim() : "Bạn bè",
        table: g.table ? g.table.trim() : null,
        isSent: Boolean(g.isSent),
        phone: g.phone ? g.phone.trim() : null,
        note: g.note ? g.note.trim() : null,
      }));

    if (validGuests.length === 0) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy tên khách mời nào hợp lệ" },
        { status: 400 }
      );
    }

    // Insert hàng loạt
    await prisma.guest.createMany({
      data: validGuests,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Đã tạo thành công ${validGuests.length} khách mời`,
        count: validGuests.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error bulk creating guests:", error);
    return NextResponse.json(
      { success: false, message: "Không thể tạo danh sách khách mời hàng loạt" },
      { status: 500 }
    );
  }
}

// PATCH /api/guests/bulk - Cập nhật hàng loạt (Đánh dấu đã gửi, gán bàn, gán nhóm)
export async function PATCH(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json(
        { success: false, message: "Bạn cần đăng nhập quyền quản trị" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ids, isSent, group, table } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "Danh sách ID không hợp lệ" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (isSent !== undefined) updateData.isSent = Boolean(isSent);
    if (group !== undefined) updateData.group = group ? group.trim() : null;
    if (table !== undefined) updateData.table = table ? table.trim() : null;

    const result = await prisma.guest.updateMany({
      where: { id: { in: ids } },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật ${result.count} khách mời`,
      count: result.count,
    });
  } catch (error) {
    console.error("Error bulk updating guests:", error);
    return NextResponse.json(
      { success: false, message: "Không thể cập nhật khách mời hàng loạt" },
      { status: 500 }
    );
  }
}

// DELETE /api/guests/bulk - Xóa hàng loạt khách mời đã chọn
export async function DELETE(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json(
        { success: false, message: "Bạn cần đăng nhập quyền quản trị" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "Danh sách ID không hợp lệ" },
        { status: 400 }
      );
    }

    const result = await prisma.guest.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa ${result.count} khách mời`,
      count: result.count,
    });
  } catch (error) {
    console.error("Error bulk deleting guests:", error);
    return NextResponse.json(
      { success: false, message: "Không thể xóa khách mời hàng loạt" },
      { status: 500 }
    );
  }
}
