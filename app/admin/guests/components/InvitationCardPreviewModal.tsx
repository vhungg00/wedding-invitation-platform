"use client";

import React, { useState, useEffect } from "react";
import { X, Download, Copy, Check, Sparkles, Image as ImageIcon, Link2, Send } from "lucide-react";
import { GuestItem } from "../../types";
import {
  generateInvitationCardBlob,
  downloadInvitationCardImage,
  copyInvitationCardImageToClipboard,
} from "@/lib/generateInvitationCard";
import { getInvitationMessage } from "@/lib/zaloInvite";

interface InvitationCardPreviewModalProps {
  guest: GuestItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function InvitationCardPreviewModal({
  guest,
  isOpen,
  onClose,
}: InvitationCardPreviewModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copiedCombo, setCopiedCombo] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!isOpen || !guest) {
      setPreviewUrl(null);
      setCopiedCombo(false);
      setCopiedLink(false);
      setDownloaded(false);
      return;
    }

    let active = true;
    setGenerating(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    generateInvitationCardBlob(guest, origin)
      .then(({ dataUrl }) => {
        if (active) setPreviewUrl(dataUrl);
      })
      .catch((err) => {
        console.error("Lỗi tạo ảnh thiệp:", err);
      })
      .finally(() => {
        if (active) setGenerating(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, guest]);

  if (!isOpen || !guest) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const isNhaGai = guest.side === "nha-gai";
  const path = isNhaGai ? "/nha-gai" : "";
  const guestUrl = `${origin}${path}?g=${guest.slug || encodeURIComponent(guest.name)}`;
  const invitationMessage = getInvitationMessage(guest, origin);

  const handleDownload = async () => {
    try {
      await downloadInvitationCardImage(guest, origin);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } catch (err) {
      console.error("Không thể tải ảnh thiệp:", err);
    }
  };

  // Copy đồng thời CẢ ẢNH THIỆP (image/png) + LỜI MỜI & LINK WEB (text/plain) vào Clipboard
  const handleCopyCardAndLink = async () => {
    try {
      await copyInvitationCardImageToClipboard(guest, origin, invitationMessage);
      setCopiedCombo(true);
      setTimeout(() => setCopiedCombo(false), 3000);
    } catch {
      navigator.clipboard.writeText(invitationMessage);
      await handleDownload();
    }
  };

  // Copy riêng lời mời + link web (khi muốn gửi kèm thẻ preview website của Zalo)
  const handleCopyTextLinkOnly = () => {
    navigator.clipboard.writeText(invitationMessage);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-rose-100 relative my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <span>Ảnh Thiệp Mời & Link Cá Nhân Hóa</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                  {guest.side === "nha-gai" ? "Nhà Gái • 05.12" : "Nhà Trai • 06.12"}
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Khách mời: <strong className="text-gray-900">{guest.name}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Khung Preview Ảnh */}
        <div className="mt-4 p-3 rounded-2xl bg-gradient-to-br from-amber-50/70 via-rose-50/30 to-amber-50/50 border border-amber-200/80">
          <div className="relative rounded-xl overflow-hidden border border-amber-200 bg-white aspect-16/9 flex items-center justify-center shadow-sm">
            {generating || !previewUrl ? (
              <div className="flex flex-col items-center gap-2 text-xs text-gray-500">
                <div className="w-7 h-7 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
                <span>Đang thiết kế thiệp mời cho {guest.name}...</span>
              </div>
            ) : (
              <img
                src={previewUrl}
                alt={`Thiệp mời ${guest.name}`}
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>

        {/* Khung Link Website & Lời mời đi kèm */}
        <div className="mt-3 p-3 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-blue-700 flex items-center gap-1">
              <Link2 className="w-3.5 h-3.5 shrink-0" />
              <span>Link thiệp website của {guest.name}:</span>
            </div>
            <div className="text-xs font-mono text-gray-700 truncate mt-0.5 select-all">
              {guestUrl}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyTextLinkOnly}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Đã chép lời mời + Link!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Chép Lời Mời + Link Web</span>
              </>
            )}
          </button>
        </div>

        <p className="mt-2.5 text-[11px] text-gray-500 flex items-center gap-1.5 px-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            Bấm <strong>Copy Thiệp + Link Web</strong> bên dưới để nạp đồng thời cả{" "}
            <strong>Ảnh thiệp</strong> lẫn <strong>Lời mời chứa Link</strong> vào bộ nhớ tạm (bấm{" "}
            <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px] font-mono">
              Ctrl + V
            </kbd>{" "}
            vào Zalo/Messenger).
          </span>
        </p>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleDownload}
            disabled={generating}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            {downloaded ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Đã tải file .png!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-gray-500" />
                <span>Tải file ảnh (.png)</span>
              </>
            )}
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCardAndLink}
              disabled={generating}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:opacity-95 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-md shadow-rose-200 transition cursor-pointer disabled:opacity-50"
            >
              {copiedCombo ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã Copy Ảnh Thiệp + Link! (Ctrl+V)</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Ảnh Thiệp + Link Web</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
