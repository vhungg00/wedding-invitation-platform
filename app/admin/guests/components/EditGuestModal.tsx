"use client";

import { useState, useEffect } from "react";
import { X, UserCheck } from "lucide-react";
import { GuestItem } from "../../types";

interface EditGuestModalProps {
  guest: GuestItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditGuestModal({
  guest,
  isOpen,
  onClose,
  onSuccess,
}: EditGuestModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [side, setSide] = useState<string>("nha-trai");
  const [group, setGroup] = useState<string>("Bạn bè");
  const [table, setTable] = useState<string>("");
  const [isSent, setIsSent] = useState<boolean>(false);
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (guest) {
      setName(guest.name || "");
      setPhone(guest.phone || "");
      setSide(guest.side || "nha-trai");
      setGroup(guest.group || "Bạn bè");
      setTable(guest.table || "");
      setIsSent(Boolean(guest.isSent));
      setNote(guest.note || "");
    }
  }, [guest]);

  if (!isOpen || !guest) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Vui lòng nhập tên khách mời");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/guests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: guest.id,
          name: name.trim(),
          phone: phone.trim() || null,
          side,
          group: group.trim() || null,
          table: table.trim() || null,
          isSent,
          note: note.trim() || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess();
        onClose();
      } else {
        alert(data.message || "Không thể cập nhật khách mời!");
      }
    } catch {
      alert("Đã xảy ra lỗi khi cập nhật!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-rose-600" />
            <h3 className="text-base font-bold text-gray-900">
              Chỉnh Sửa Thông Tin Khách Mời
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Tên khách mời (hiển thị trên thiệp) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-rose-500 font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Số điện thoại</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xxx..."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-rose-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Bên tiệc</label>
              <select
                value={side}
                onChange={(e) => setSide(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-rose-500 bg-white"
              >
                <option value="nha-trai">🤵 Nhà Trai (06.12)</option>
                <option value="nha-gai">👰 Nhà Gái (05.12)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Nhóm khách</label>
              <input
                type="text"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder="Ví dụ: Bạn Cấp 3, Họ hàng..."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Số bàn tiệc</label>
              <input
                type="text"
                value={table}
                onChange={(e) => setTable(e.target.value)}
                placeholder="Ví dụ: Bàn 01, Bàn VIP..."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-rose-500"
              />
            </div>
          </div>

          {/* Toggle trạng thái đã gửi thiệp */}
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-800 text-xs">Trạng thái gửi thiệp</div>
              <div className="text-[11px] text-gray-500">
                Đánh dấu nếu đã gửi link thiệp này qua Zalo hoặc Messenger
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSent(!isSent)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                isSent ? "bg-rose-600 justify-end" : "bg-gray-300 justify-start"
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Ghi chú riêng</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú thêm..."
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-rose-500 resize-none text-xs"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2.5 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 font-medium cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer shadow-md disabled:opacity-50"
            >
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
