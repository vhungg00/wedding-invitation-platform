"use client";
import React, { useState } from "react";
import { X, MessageCircle, Copy, Check, ExternalLink, Phone, Send } from "lucide-react";
import { GuestItem } from "../../types";
import { getInvitationMessage, sendZaloOneClick } from "@/lib/zaloInvite";

interface ZaloMessageModalProps {
  guest: GuestItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSentUpdated?: (guestId: string) => void;
}

export default function ZaloMessageModal({
  guest,
  isOpen,
  onClose,
  onSentUpdated,
}: ZaloMessageModalProps) {
  const [copied, setCopied] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);

  if (!isOpen || !guest) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const invitationMessage = getInvitationMessage(guest, origin);
  const cleanPhone = (guest.phone || phoneInput).replace(/\D/g, "");

  const handleCopyOnly = () => {
    navigator.clipboard.writeText(invitationMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendZalo = async () => {
    // If phone was entered in modal, save it first
    if (!guest.phone && cleanPhone) {
      setSavingPhone(true);
      try {
        await fetch("/api/guests", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: guest.id, phone: cleanPhone, isSent: true }),
        });
        guest.phone = cleanPhone;
        guest.isSent = true;
      } catch (err) {
        console.error("Failed to save phone:", err);
      } finally {
        setSavingPhone(false);
      }
    }

    await sendZaloOneClick(
      { ...guest, phone: cleanPhone || guest.phone },
      onSentUpdated
    );

    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <span>Gửi Thiệp Mời Qua Zalo</span>
                <span className="bg-blue-50 text-blue-600 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                  1-Click
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Gửi tới: <strong className="text-gray-900">{guest.name}</strong>
                {guest.phone && (
                  <span className="ml-1 text-blue-600 font-mono font-medium">({guest.phone})</span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Missing Phone Number Alert & Quick Input */}
        {!guest.phone && (
          <div className="mt-3.5 p-3 rounded-2xl bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-800 font-medium flex items-center gap-1.5 mb-2">
              <Phone className="w-3.5 h-3.5" />
              <span>Khách này chưa có SĐT để mở Zalo trực tiếp:</span>
            </p>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="Nhập SĐT (vd: 0912345678)..."
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
              />
            </div>
          </div>
        )}

        {/* Message Content Preview */}
        <div className="my-4">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Nội dung tin nhắn tự động
            </span>
            <span className="text-[11px] text-gray-400 italic">
              (Tự động copy vào bộ nhớ tạm)
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/40 via-rose-50/20 to-amber-50/30 border border-blue-100 font-sans text-xs sm:text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
            {invitationMessage}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100">
          <button
            type="button"
            onClick={handleCopyOnly}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Đã chép tin nhắn!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-gray-500" />
                <span>Chỉ sao chép tin nhắn</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSendZalo}
            disabled={savingPhone}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Mở Zalo &amp; Tự Động Sao Chép</span>
          </button>
        </div>
      </div>
    </div>
  );
}
