"use client";

import { useState } from "react";
import { X, MessageCircle, Copy, Check, ExternalLink, Sparkles } from "lucide-react";
import { GuestItem } from "../../types";

interface ZaloMessageModalProps {
  guest: GuestItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ZaloMessageModal({
  guest,
  isOpen,
  onClose,
}: ZaloMessageModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !guest) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const path = guest.side === "nha-gai" ? "/nha-gai" : "";
  const guestUrl = `${origin}${path}?g=${guest.slug || encodeURIComponent(guest.name)}`;

  const weddingDate = guest.side === "nha-gai" ? "Thứ Bảy, ngày 05.12.2026" : "Chủ Nhật, ngày 06.12.2026";
  const eventName = guest.side === "nha-gai" ? "Lễ Vu Quy" : "Lễ Thành Hôn";

  // Tin nhắn mẫu trang trọng & thân mật
  const invitationMessage = `Trân gửi ${guest.name},

Hôn lễ của Việt Hùng & Xuân Ly (${eventName}) sẽ chính thức diễn ra vào ${weddingDate}.

Sự hiện diện của ${guest.name} là niềm vinh hạnh to lớn và trọn vẹn nhất cho ngày vui của hai đứa và gia đình chúng mình.

Chúng mình trân trọng gửi thiệp mời trực tiếp tới ${guest.name} tại đường dẫn dưới đây:
👉 ${guestUrl}

Rất mong được đón tiếp ${guest.name} cùng chung vui!
Thân ái,
Việt Hùng & Xuân Ly.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(invitationMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const cleanPhone = guest.phone ? guest.phone.replace(/\D/g, "") : "";
  const zaloUrl = cleanPhone ? `https://zalo.me/${cleanPhone}` : "";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">
                Tin Nhắn Mời Thiệp Cưới (Zalo / SMS)
              </h3>
              <p className="text-xs text-gray-500">
                Gửi tới: <strong className="text-gray-800">{guest.name}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Content Preview */}
        <div className="my-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/50 to-rose-50/40 border border-blue-100 font-sans text-xs sm:text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {invitationMessage}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          {zaloUrl ? (
            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Mở chat Zalo ({cleanPhone})</span>
            </a>
          ) : (
            <span className="text-[11px] text-gray-400 italic">
              * Khách này chưa có SĐT để mở Zalo trực tiếp
            </span>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-medium hover:bg-gray-100 transition cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-rose-200 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép toàn bộ tin nhắn</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
