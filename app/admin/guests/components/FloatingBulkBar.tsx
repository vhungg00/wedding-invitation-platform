"use client";

import { useState } from "react";
import { CheckCheck, X, Trash2, Send, FolderSync, Armchair, Copy, Check } from "lucide-react";

interface FloatingBulkBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onBulkUpdate: (data: { isSent?: boolean; group?: string; table?: string }) => Promise<void>;
  onBulkDelete: () => Promise<void>;
  onCopyLinks: () => void;
}

export default function FloatingBulkBar({
  selectedIds,
  onClearSelection,
  onBulkUpdate,
  onBulkDelete,
  onCopyLinks,
}: FloatingBulkBarProps) {
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (selectedIds.length === 0) return null;

  const handleMarkSent = async (isSent: boolean) => {
    setSubmitting(true);
    try {
      await onBulkUpdate({ isSent });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignTable = async () => {
    const table = prompt("Nhập số bàn tiệc để gán cho các khách đã chọn (Ví dụ: Bàn 01):");
    if (!table || !table.trim()) return;
    setSubmitting(true);
    try {
      await onBulkUpdate({ table: table.trim() });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignGroup = async () => {
    const group = prompt("Nhập nhóm để chuyển các khách đã chọn (Ví dụ: Bạn Cấp 3):");
    if (!group || !group.trim()) return;
    setSubmitting(true);
    try {
      await onBulkUpdate({ group: group.trim() });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = () => {
    onCopyLinks();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-3xl animate-slide-up">
      <div className="bg-gray-900/95 backdrop-blur-md text-white rounded-2xl p-3 sm:p-4 shadow-2xl border border-gray-700 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Counter */}
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center text-xs">
            {selectedIds.length}
          </span>
          <span className="font-semibold text-gray-200">
            Đã chọn {selectedIds.length} khách
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Đã gửi */}
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleMarkSent(true)}
            className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-emerald-600 transition flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-emerald-400" />
            <span>Đã gửi thiệp</span>
          </button>

          {/* Gán bàn */}
          <button
            type="button"
            disabled={submitting}
            onClick={handleAssignTable}
            className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-amber-600 transition flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <Armchair className="w-3.5 h-3.5 text-amber-400" />
            <span>Xếp Bàn</span>
          </button>

          {/* Gán nhóm */}
          <button
            type="button"
            disabled={submitting}
            onClick={handleAssignGroup}
            className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-blue-600 transition flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <FolderSync className="w-3.5 h-3.5 text-blue-400" />
            <span>Đổi nhóm</span>
          </button>

          {/* Copy link */}
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 transition flex items-center gap-1.5 font-medium cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Đã chép link</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-400" />
                <span>Chép link</span>
              </>
            )}
          </button>

          {/* Xóa */}
          <button
            type="button"
            disabled={submitting}
            onClick={onBulkDelete}
            className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 transition flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa</span>
          </button>

          {/* Bỏ chọn */}
          <button
            type="button"
            onClick={onClearSelection}
            title="Bỏ chọn tất cả"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
