"use client";
import React, { useState, useEffect } from "react";
import { X, MessageCircle, Copy, Check, Phone, Send, Image as ImageIcon, Download, Sparkles } from "lucide-react";
import { GuestItem } from "../../types";
import { getInvitationMessage, sendZaloOneClick } from "@/lib/zaloInvite";
import {
  generateInvitationCardBlob,
  downloadInvitationCardImage,
  copyInvitationCardImageToClipboard,
} from "@/lib/generateInvitationCard";

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

  // Trạng thái tạo ảnh thiệp mời in tên khách
  const [cardPreviewUrl, setCardPreviewUrl] = useState<string | null>(null);
  const [generatingCard, setGeneratingCard] = useState(false);
  const [cardCopied, setCardCopied] = useState(false);
  const [cardDownloaded, setCardDownloaded] = useState(false);

  useEffect(() => {
    if (!isOpen || !guest) {
      setCardPreviewUrl(null);
      setCardCopied(false);
      setCardDownloaded(false);
      return;
    }

    let active = true;
    setGeneratingCard(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    generateInvitationCardBlob(guest, origin)
      .then(({ dataUrl }) => {
        if (active) setCardPreviewUrl(dataUrl);
      })
      .catch((err) => {
        console.error("Lỗi tạo ảnh thiệp mời:", err);
      })
      .finally(() => {
        if (active) setGeneratingCard(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, guest]);

  if (!isOpen || !guest) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const invitationMessage = getInvitationMessage(guest, origin);
  const cleanPhone = (guest.phone || phoneInput).replace(/\D/g, "");

  const handleCopyOnly = () => {
    navigator.clipboard.writeText(invitationMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadCard = async () => {
    try {
      await downloadInvitationCardImage(guest, origin);
      setCardDownloaded(true);
      setTimeout(() => setCardDownloaded(false), 2500);
    } catch (err) {
      console.error("Lỗi tải ảnh thiệp:", err);
    }
  };

  const handleCopyCardImage = async () => {
    try {
      await copyInvitationCardImageToClipboard(guest, origin, invitationMessage);
      setCardCopied(true);
      setTimeout(() => setCardCopied(false), 2500);
    } catch {
      await handleDownloadCard();
    }
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
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl relative border border-gray-100 my-auto max-h-[92vh] overflow-y-auto"
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
                <span>Gửi Thiệp & Ảnh Thiệp Mời In Tên</span>
                <span className="bg-blue-50 text-blue-600 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                  1-Click
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Khách mời: <strong className="text-gray-900">{guest.name}</strong>
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

        {/* Personalized Invitation Card Preview & Actions */}
        <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-rose-50/40 to-amber-50/50 border border-amber-200/80">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Ảnh Thiệp Mời In Tên Riêng (Đính kèm Zalo/Messenger)</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyCardImage}
                disabled={generatingCard}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition cursor-pointer disabled:opacity-50"
                title="Copy ảnh vào bộ nhớ tạm để Ctrl+V dán thẳng vào Zalo/Messenger"
              >
                {cardCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Đã copy ảnh! (Ctrl+V)</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Ảnh (Dán Zalo)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadCard}
                disabled={generatingCard}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {cardDownloaded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã tải!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>🖼️ Tải ảnh thiệp mời</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-amber-200 bg-white aspect-16/9 flex items-center justify-center shadow-inner">
            {generatingCard || !cardPreviewUrl ? (
              <div className="flex flex-col items-center gap-2 text-xs text-gray-400">
                <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                <span>Đang vẽ thiệp mời cho {guest.name}...</span>
              </div>
            ) : (
              <img
                src={cardPreviewUrl}
                alt={`Thiệp mời ${guest.name}`}
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>

        {/* Message Content Preview */}
        <div className="my-4">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Nội dung tin nhắn tự động
            </span>
            <span className="text-[11px] text-gray-400 italic">
              (Tự động copy khi bấm gửi)
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/40 via-rose-50/20 to-amber-50/30 border border-blue-100 font-sans text-xs text-gray-800 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
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
