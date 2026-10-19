import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

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
    await prisma.rsvp.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa bản ghi RSVP" });
  } catch (error) {
    console.error("Error deleting RSVP:", error);
    return NextResponse.json(
      { success: false, message: "Không thể xóa bản ghi RSVP" },
      { status: 500 }
    );
  }
}
