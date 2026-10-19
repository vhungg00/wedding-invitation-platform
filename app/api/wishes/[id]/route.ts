import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

// PATCH /api/wishes/[id] - Toggle duyệt/ẩn lời chúc
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json(
        { success: false, message: "Bạn cần đăng nhập quyền quản trị" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { isApproved } = body;

    const wish = await prisma.wish.update({
      where: { id },
      data: {
        isApproved: Boolean(isApproved),
      },
    });

    return NextResponse.json({ success: true, data: wish });
  } catch (error) {
    console.error("Error updating wish:", error);
    return NextResponse.json(
      { success: false, message: "Không thể cập nhật lời chúc" },
      { status: 500 }
    );
  }
}

// DELETE /api/wishes/[id] - Xóa lời chúc
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json(
        { success: false, message: "Bạn cần đăng nhập quyền quản trị" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await prisma.wish.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa lời chúc" });
  } catch (error) {
    console.error("Error deleting wish:", error);
    return NextResponse.json(
      { success: false, message: "Không thể xóa lời chúc" },
      { status: 500 }
    );
  }
}
