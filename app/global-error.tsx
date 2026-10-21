"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="vi">
      <body className="min-h-screen flex items-center justify-center bg-rose-50 px-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl p-6 text-center shadow-lg border border-rose-100">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Đang mở thiệp cưới...</h2>
          <p className="text-sm text-gray-600 mb-6">
            Hệ thống đang làm mới để hiển thị thiệp cưới tốt nhất.
          </p>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="w-full py-2.5 px-4 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition"
          >
            Tải Lại Trang
          </button>
        </div>
      </body>
    </html>
  );
}
