import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME || "").trim();
const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();

export const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

/**
 * Upload image buffer to Cloudinary (3rd party) with local public/uploads fallback
 */
export async function uploadBufferToStorage(
  buffer: Buffer,
  originalName: string,
  folder = "wedding_invitation"
): Promise<string> {
  if (isCloudinaryConfigured) {
    try {
      return await new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "auto",
          },
          (error, result) => {
            if (error || !result) {
              return reject(error || new Error("Không nhận được phản hồi từ Cloudinary"));
            }
            resolve(result.secure_url);
          }
        );
        stream.end(buffer);
      });
    } catch (err) {
      console.warn("Upload Cloudinary không thành công, chuyển sang lưu nội bộ public/uploads:", err);
    }
  }

  // Fallback: Lưu vào thư mục public/uploads
  const uploadsDir = path.join(process.cwd(), "public/uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const cleanName = `${Date.now()}-${originalName.replace(/\s+/g, "_")}`;
  const filePath = path.join(uploadsDir, cleanName);
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${cleanName}`;
}

/**
 * Trích xuất public_id từ đường dẫn URL Cloudinary
 * Ví dụ: https://res.cloudinary.com/hungf/image/upload/v1792558259/wedding_invitation/album/xyz.png
 * -> wedding_invitation/album/xyz
 */
export function getCloudinaryPublicId(url: string): string | null {
  if (!url || !url.includes("res.cloudinary.com")) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    let afterUpload = parts[1];
    // Xóa query parameters nếu có (?_a=...)
    afterUpload = afterUpload.split("?")[0];
    // Loại bỏ version (v1234567890/) hoặc các chuỗi transformation (c_scale,w_500/v123/...)
    const vMatch = afterUpload.match(/(?:^|\/)v\d+\/(.+)$/);
    if (vMatch && vMatch[1]) {
      afterUpload = vMatch[1];
    } else {
      const segments = afterUpload.split("/");
      if (segments.length > 1 && (segments[0].includes(",") || segments[0].includes("_"))) {
        segments.shift();
        afterUpload = segments.join("/");
      }
    }
    // Bỏ phần đuôi mở rộng file (.png, .jpg, .webp...)
    const lastDotIndex = afterUpload.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      afterUpload = afterUpload.substring(0, lastDotIndex);
    }
    return decodeURIComponent(afterUpload);
  } catch {
    return null;
  }
}

/**
 * Xóa vĩnh viễn file trên Cloudinary CDN hoặc thư mục local public/uploads
 */
export async function deleteImageFromStorage(url: string): Promise<boolean> {
  if (!url) return false;

  // Bảo vệ: Tuyệt đối không xóa các ảnh hệ thống mặc định trong public
  if (
    url.startsWith("/album/") ||
    url === "/chu-re.JPG" ||
    url === "/co-dau.JPG" ||
    url === "/tach-nen.png" ||
    url === "/qr.jpeg"
  ) {
    return false;
  }

  // 1. Nếu là ảnh trên Cloudinary
  if (isCloudinaryConfigured && url.includes("res.cloudinary.com")) {
    const publicId = getCloudinaryPublicId(url);
    if (publicId) {
      try {
        const result = await cloudinary.uploader.destroy(publicId, {
          invalidate: true,
          resource_type: "image",
        });
        console.log(`>>> Đã xóa vĩnh viễn trên Cloudinary (${publicId}):`, result);
        return result.result === "ok" || result.result === "not found";
      } catch (err) {
        console.error("Lỗi xóa ảnh Cloudinary:", err);
      }
    }
  }

  // 2. Nếu là ảnh nội bộ trong public/uploads
  if (url.startsWith("/uploads/")) {
    try {
      const localPath = path.join(process.cwd(), "public", url);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        console.log(`>>> Đã xóa file ảnh local: ${localPath}`);
        return true;
      }
    } catch (err) {
      console.error("Lỗi xóa file ảnh local:", err);
    }
  }

  return false;
}

export default cloudinary;

