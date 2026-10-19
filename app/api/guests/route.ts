import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

// GET /api/guests - Lấy danh sách khách mời hoặc tìm thông tin khách theo slug/id
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");

    // Nếu có slug hoặc id, trả về thông tin khách mời đơn lẻ (công khai để trang thiệp hiển thị tên)
    if (slug || id) {
      const guest = await prisma.guest.findFirst({
        where: slug ? { slug } : { id: id! },
        select: {
          id: true,
          name: true,
          slug: true,
          side: true,
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

    const guests = await prisma.guest.findMany({
      include: {
        rsvps: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: guests });
  } catch (error) {
    console.error("Error fetching guests:", error);
    return NextResponse.json(
      { success: false, message: "Không thể lấy danh sách khách mời" },
      { status: 500 }
    );
  }
}

// POST /api/guests - Tạo khách mời mới
export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json(
        { success: false, message: "Bạn cần đăng nhập quyền quản trị" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, side, phone, note } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập tên khách mời" },
        { status: 400 }
      );
    }

    // Tạo slug đơn giản không dấu
    const slugBase = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = `${slugBase}-${uniqueSuffix}`;

    const guest = await prisma.guest.create({
      data: {
        name: name.trim(),
        slug,
        side: side || "nha-trai",
        phone: phone ? phone.trim() : null,
        note: note ? note.trim() : null,
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
