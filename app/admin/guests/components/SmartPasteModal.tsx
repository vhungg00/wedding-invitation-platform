"use client";

import { useState, useMemo } from "react";
import { X, Sparkles, Check, AlertCircle, Users, Copy } from "lucide-react";

interface SmartPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedGuest {
  name: string;
  phone: string;
  side: "nha-trai" | "nha-gai";
  group: string;
}

export default function SmartPasteModal({
  isOpen,
  onClose,
  onSuccess,
}: SmartPasteModalProps) {
  const [rawText, setRawText] = useState("");
  const [defaultSide, setDefaultSide] = useState<"nha-trai" | "nha-gai">("nha-trai");
  const [defaultGroup, setDefaultGroup] = useState<string>("Bạn bè");
  const [submitting, setSubmitting] = useState(false);

  // Parse thông minh danh sách dán vào
  const parsedGuests: ParsedGuest[] = useMemo(() => {
    if (!rawText.trim()) return [];

    const lines = rawText.split("\n");
    const results: ParsedGuest[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // 1. Tìm số điện thoại (10 chữ số, vd: 0988123456 hoặc 0988.123.456 hoặc 0988 123 456)
      const phoneRegex = /(0[3|5|7|8|9][0-9]{8})/g;
      const cleanPhoneMatch = trimmed.replace(/[\s.-]/g, "").match(phoneRegex);
      const phone = cleanPhoneMatch ? cleanPhoneMatch[0] : "";

      // 2. Tách tên và nhóm
      // Loại bỏ số điện thoại ra khỏi chuỗi để lấy tên & nhóm
      let withoutPhone = trimmed;
      if (phone) {
        withoutPhone = withoutPhone.replace(phone, "").replace(/0[3|5|7|8|9][0-9\s.-]{8,12}/g, "");
      }

      // Tách theo dấu gạch ngang hoặc phẩy hoặc tab
      const parts = withoutPhone
        .split(/[-–—,\t]/)
        .map((p) => p.trim())
        .filter(Boolean);

      let name = parts[0] || withoutPhone.trim();
      // Bỏ số thứ tự ở đầu dòng nếu có (ví dụ: "1. Anh Nam" -> "Anh Nam")
      name = name.replace(/^[0-9]+[.\s)]+/, "").trim();

      // Nhóm khách (nếu có phần thứ 2 hoặc trong ngoặc đơn)
      let group = defaultGroup;
      if (parts.length > 1) {
        group = parts[1];
      } else {
        const bracketMatch = name.match(/\((.*?)\)/);
        if (bracketMatch) {
          group = bracketMatch[1];
        }
      }

      if (name) {
        results.push({
          name,
          phone,
          side: defaultSide,
          group: group || defaultGroup,
        });
      }
    });

    return results;
  }, [rawText, defaultSide, defaultGroup]);

  // Submit tạo hàng loạt
  const handleSubmit = async () => {
    if (parsedGuests.length === 0) {
      alert("Chưa có khách mời nào được bóc tách hợp lệ.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/guests/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guests: parsedGuests }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Đã thêm thành công ${parsedGuests.length} khách mời!`);
        setRawText("");
        onSuccess();
        onClose();
      } else {
        alert(data.message || "Lỗi khi tạo danh sách hàng loạt!");
      }
    } catch {
      alert("Đã xảy ra lỗi kết nối khi tạo khách mời hàng loạt!");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasteSample = () => {
    setRawText(`Anh Nguyễn Văn Nam - 0988123456 - Bạn Cấp 3
Chị Lê Thị Thảo - 0912333444 - Đồng nghiệp
Gia đình Bác Hùng - 0912345678 - Họ hàng
Bạn Tuấn Anh - 0905123456 - Bạn Chú Rể
Nguyễn Hoàng Long
Chị Mai Hương (Bạn Đại học)`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Nhập Danh Sách Khách Hàng Loạt (Smart Paste)
              </h3>
              <p className="text-xs text-gray-500">
                Dán danh sách từ Zalo, Excel hoặc Notes – Tự bóc tách Tên, SĐT và sinh link thiệp trong 2 giây.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cấu hình chung cho đợt dán này */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Bên tiệc mặc định
            </label>
            <select
              value={defaultSide}
              onChange={(e) => setDefaultSide(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-rose-500 bg-white"
            >
              <option value="nha-trai">🤵 Nhà Trai (Lễ Thành Hôn - 06.12.2026)</option>
              <option value="nha-gai">👰 Nhà Gái (Lễ Vu Quy - 05.12.2026)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nhóm khách mặc định
            </label>
            <select
              value={defaultGroup}
              onChange={(e) => setDefaultGroup(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-rose-500 bg-white"
            >
              <option value="Bạn bè">Bạn bè</option>
              <option value="Bạn Cấp 3">Bạn Cấp 3</option>
              <option value="Bạn Đại học">Bạn Đại học</option>
              <option value="Đồng nghiệp">Đồng nghiệp</option>
              <option value="Họ hàng Nhà Trai">Họ hàng Nhà Trai</option>
              <option value="Họ hàng Nhà Gái">Họ hàng Nhà Gái</option>
              <option value="Khách Bố Mẹ">Khách Bố Mẹ</option>
            </select>
          </div>
        </div>

        {/* Ô Textarea dán danh sách */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-700">
              Dán danh sách văn bản (Mỗi dòng một người):
            </span>
            <button
              type="button"
              onClick={handlePasteSample}
              className="text-rose-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Dán danh sách mẫu</span>
            </button>
          </div>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Dán danh sách tại đây...&#10;Ví dụ:&#10;Anh Nam - 0988123456&#10;Chị Thảo - Đồng nghiệp&#10;Gia đình Bác Hùng"
            rows={5}
            className="w-full p-3.5 rounded-2xl border border-gray-300 focus:outline-rose-500 text-xs font-mono resize-none bg-gray-50/50"
          />
        </div>

        {/* Bảng xem trước kết quả bóc tách */}
        <div className="mt-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between pb-2 text-xs">
            <span className="font-semibold text-gray-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-rose-500" />
              <span>Xem trước kết quả ({parsedGuests.length} khách):</span>
            </span>
            {parsedGuests.length > 0 && (
              <span className="text-[11px] text-emerald-600 font-medium">
                ✓ Sẵn sàng tạo {parsedGuests.length} link thiệp cá nhân hóa
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white max-h-48 text-xs">
            {parsedGuests.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                Hãy dán danh sách vào ô phía trên để xem kết quả bóc tách tự động.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="p-2 w-12 text-center text-gray-500">STT</th>
                    <th className="p-2 text-gray-700">Tên khách mời</th>
                    <th className="p-2 text-gray-700">Số điện thoại</th>
                    <th className="p-2 text-gray-700">Bên</th>
                    <th className="p-2 text-gray-700">Nhóm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {parsedGuests.map((g, idx) => (
                    <tr key={idx} className="hover:bg-rose-50/30">
                      <td className="p-2 text-center text-gray-400">{idx + 1}</td>
                      <td className="p-2 font-semibold text-gray-900">{g.name}</td>
                      <td className="p-2 font-mono text-gray-600">{g.phone || "-"}</td>
                      <td className="p-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                          {g.side === "nha-trai" ? "Nhà Trai" : "Nhà Gái"}
                        </span>
                      </td>
                      <td className="p-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-50 text-amber-700 border border-amber-200">
                          {g.group}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500 italic">
            * Mỗi khách sẽ được sinh một mã slug duy nhất để tạo link thiệp riêng.
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-medium hover:bg-gray-100 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={submitting || parsedGuests.length === 0}
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200 transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Đang tạo..." : `Tạo ${parsedGuests.length} Khách Mời`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
