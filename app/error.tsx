"use client";

import { useEffect } from "react";
import { AppButton } from "@/app/components/ui/AppButton";
import { RefreshCw, Heart } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50/50 px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl text-center border border-rose-100">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
          <Heart className="w-8 h-8 fill-rose-500 animate-pulse" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          Đang tải thiệp cưới...
        </h2>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Đường truyền hoặc trình duyệt có chút gián đoạn. Vui lòng bấm nút bên dưới để mở lại thiệp cưới nhé!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <AppButton
            variant="primary"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.reload();
              } else {
                reset();
              }
            }}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Tải Lại Thiệp Cưới
          </AppButton>
        </div>
      </div>
    </div>
  );
}
