"use client";

import { useState } from "react";
import { X, ExternalLink, Copy, Check, Smartphone, RefreshCw } from "lucide-react";
import { GuestItem } from "../../types";

interface MobilePreviewDrawerProps {
  guest: GuestItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MobilePreviewDrawer({
  guest,
  isOpen,
  onClose,
}: MobilePreviewDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  if (!isOpen || !guest) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const path = guest.side === "nha-gai" ? "/nha-gai" : "";
  const guestUrl = `${origin}${path}?g=${guest.slug || encodeURIComponent(guest.name)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(guestUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-fade-in flex justify-end">
      <div
        className="w-full max-w-md sm:max-w-lg bg-white h-full shadow-2xl flex flex-col animate-slide-left relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="font-bold text-sm text-gray-900 truncate max-w-[240px]">
                Xem Thiệp: {guest.name}
              </h3>
              <p className="text-[11px] text-gray-500 font-mono">
                {guest.side === "nha-trai" ? "Nhà Trai (06.12)" : "Nhà Gái (05.12)"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIframeKey((k) => k + 1)}
              title="Tải lại thiệp"
              className="p-1.5 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-200 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <a
              href={guestUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Mở tab mới"
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={onClose}
              title="Đóng"
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Link bar & Quick Copy */}
        <div className="p-3 bg-amber-50/60 border-b border-amber-100 flex items-center justify-between gap-2 text-xs">
          <span className="font-mono text-gray-600 truncate text-[11px]" title={guestUrl}>
            {guestUrl}
          </span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-rose-600 text-white font-medium text-xs flex items-center gap-1 shadow-xs hover:bg-rose-700 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Chép link</span>
              </>
            )}
          </button>
        </div>

        {/* Phone Mockup Body */}
        <div className="flex-1 bg-gradient-to-b from-gray-100 to-gray-200 p-3 sm:p-5 flex items-center justify-center overflow-hidden">
          <div className="relative w-full max-w-[340px] h-[95%] bg-black rounded-[44px] p-2.5 shadow-2xl border-4 border-gray-800 flex flex-col">
            {/* Phone Speaker & Dynamic Island */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-gray-900" />
            </div>

            {/* Screen Iframe */}
            <div className="relative w-full h-full bg-white rounded-[34px] overflow-hidden">
              <iframe
                key={iframeKey}
                src={guestUrl}
                title={`Preview ${guest.name}`}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
