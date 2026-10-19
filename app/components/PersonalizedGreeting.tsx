"use client";

import { Suspense, useState } from "react";
import { Mail, Check, Share2, Heart } from "lucide-react";
import { useGuest } from "@/lib/useGuest";
import { AppButton } from "@/app/components/ui/AppButton";

function GreetingContent({
  defaultSide = "nha-trai",
}: {
  defaultSide?: "nha-trai" | "nha-gai";
}) {
  const { guest, loading, rawParam } = useGuest();
  const [copied, setCopied] = useState(false);

  if (!rawParam) {
    return null;
  }

  const displayName = guest?.name || (loading ? "..." : rawParam);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div data-aos="fade-down" className="max-w-2xl mx-auto my-6 px-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50 border border-amber-200/80 shadow-lg p-5 sm:p-6 text-center">
        {/* Subtle decorative badges */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-medium tracking-wide uppercase mb-3">
          <Mail className="w-3.5 h-3.5" />
          <span>Thư mời trân trọng</span>
        </div>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-gray-800 tracking-wide mb-2">
          Kính gửi:{" "}
          <span className="text-rose-600 font-bold font-imperial-script text-3xl sm:text-4xl md:text-5xl ml-1">
            {displayName}
          </span>
        </h2>

        <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-lg mx-auto">
          Sự hiện diện của bạn là niềm vinh hạnh to lớn và trọn vẹn nhất cho ngày vui trọng đại của gia đình chúng tôi!
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <AppButton
            variant="outline"
            size="sm"
            className="!rounded-full shadow-xs"
            onClick={handleCopyLink}
            icon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          >
            {copied ? (
              <span className="text-emerald-700 font-medium">Đã sao chép link thiệp!</span>
            ) : (
              <span>Sao chép link thiệp của bạn</span>
            )}
          </AppButton>
        </div>

        <div className="absolute top-2 right-2 text-rose-200/60 pointer-events-none">
          <Heart className="w-12 h-12 rotate-12" />
        </div>
      </div>
    </div>
  );
}

export default function PersonalizedGreeting({
  defaultSide = "nha-trai",
}: {
  defaultSide?: "nha-trai" | "nha-gai";
}) {
  return (
    <Suspense fallback={null}>
      <GreetingContent defaultSide={defaultSide} />
    </Suspense>
  );
}
