import { NextResponse } from "next/server";
import { uploadBufferToStorage, isCloudinaryConfigured, deleteImageFromStorage } from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const folder = (formData.get("folder") as string) || "wedding_invitation";

    // Hỗ trợ upload nhiều file cùng lúc (Album ảnh cưới)
    const files = formData.getAll("files") as File[];
    const validFiles = files.filter((f) => f && typeof f.arrayBuffer === "function" && f.size > 0);

    if (validFiles.length > 0) {
      const urls: string[] = [];
      for (const file of validFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const url = await uploadBufferToStorage(buffer, file.name, folder);
        urls.push(url);
      }
      return NextResponse.json({
        success: true,
        message: `Đã tải lên ${urls.length} ảnh thành công`,
        urls,
        provider: isCloudinaryConfigured ? "cloudinary" : "local",
      });
    }

    // Hỗ trợ upload 1 file đơn lẻ (Avatar, Background, QR)
    const singleFile = (formData.get("file") || formData.get("image")) as File | null;
    if (singleFile && typeof singleFile.arrayBuffer === "function" && singleFile.size > 0) {
      const arrayBuffer = await singleFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const url = await uploadBufferToStorage(buffer, singleFile.name, folder);
      return NextResponse.json({
        success: true,
        message: "Tải ảnh lên thành công",
        url,
        originalName: singleFile.name,
        provider: isCloudinaryConfigured ? "cloudinary" : "local",
      });
    }

    return NextResponse.json(
      { success: false, message: "Vui lòng chọn ít nhất 1 file hợp lệ để tải lên" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Lỗi upload API:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi tải ảnh lên hệ thống" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;
    if (!url) {
      return NextResponse.json(
        { success: false, message: "Thiếu đường dẫn url của ảnh cần xóa" },
        { status: 400 }
      );
    }

    const deleted = await deleteImageFromStorage(url);
    return NextResponse.json({
      success: true,
      deleted,
      message: deleted
        ? "Đã xóa vĩnh viễn file ảnh khỏi Cloudinary / bộ nhớ lưu trữ"
        : "Ảnh không thuộc Cloudinary/upload hoặc đã được dọn dẹp trước đó",
    });
  } catch (error: any) {
    console.error("Lỗi xóa ảnh API:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi khi xóa file ảnh" },
      { status: 500 }
    );
  }
}
