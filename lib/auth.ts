import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "hungly2026";
const AUTH_SECRET = process.env.AUTH_SECRET || "wedding-secret-token-hungly-2026";
const COOKIE_NAME = "wedding_admin_session";

// Chuyển secret key thành Uint8Array cho Web Crypto API
const secretKey = new TextEncoder().encode(AUTH_SECRET);

// Tạo JWT signed bằng thuật toán HS256, thời hạn 7 ngày
export async function generateSessionToken(): Promise<string> {
  return await new SignJWT({
    username: ADMIN_USERNAME,
    role: "admin",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

// Kiểm tra và giải mã JWT
export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    if (payload.username !== ADMIN_USERNAME || payload.role !== "admin") {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// Kiểm tra thông tin đăng nhập
export function verifyCredentials(user: string, pass: string): boolean {
  return (
    user.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase() &&
    pass.trim() === ADMIN_PASSWORD
  );
}

// Helper kiểm tra cookie trong server components / routes
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return await isValidSessionToken(token);
}

export { COOKIE_NAME, ADMIN_USERNAME, ADMIN_PASSWORD };
