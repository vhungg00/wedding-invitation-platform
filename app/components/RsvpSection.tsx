"use client";

import { useState, useEffect, Suspense } from "react";
import { CheckCircle2, HeartHandshake, Users, User, Phone, MessageSquare, Send, Check } from "lucide-react";
import { useGuest } from "@/lib/useGuest";
import { InputCustom } from "@/app/components/ui/InputCustom";
import { DropdownCustom } from "@/app/components/ui/DropdownCustom";
import { TextareaCustom } from "@/app/components/ui/TextareaCustom";
import { AppButton } from "@/app/components/ui/AppButton";

interface RsvpSectionProps {
  defaultSide?: "nha-trai" | "nha-gai";
}

function RsvpFormInternal({ defaultSide = "nha-trai" }: RsvpSectionProps) {
  const { guest, rawParam } = useGuest();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState<boolean>(true);
  const [guestCount, setGuestCount] = useState<number>(1);
  const [side, setSide] = useState<string>(defaultSide);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (guest) {
      setName(guest.name);
      if (guest.phone) setPhone(guest.phone);
      if (guest.side) setSide(guest.side);
      if (guest.id) setGuestId(guest.id);
    } else if (rawParam && !name) {
      setName(rawParam);
    }
  }, [guest, rawParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Vui lòng nhập họ và tên của bạn");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          attending,
          guestCount: attending ? Number(guestCount) : 0,
          side,
          note: note.trim(),
          guestId: guestId || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(data.message || "Không thể gửi xác nhận, vui lòng thử lại sau.");
      }
    } catch {
      setErrorMessage("Lỗi kết nối máy chủ, vui lòng kiểm tra mạng và thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div suppressHydrationWarning className="w-full max-w-2xl mx-auto my-12 px-4" data-aos="fade-up">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border border-rose-100 relative overflow-hidden">
        {/* Decorative corner florals/accent */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-200/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />

        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 text-rose-500 mb-3 shadow-inner">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Xác Nhận Tham Dự
          </h2>
          <p className="font-imperial-script text-3xl sm:text-4xl text-rose-500 mt-1">
            R.S.V.P
          </p>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-md mx-auto">
            Để giúp gia đình chuẩn bị đón tiếp chu đáo nhất, xin quý khách vui lòng xác nhận trước ngày cưới.
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-8 px-4 bg-rose-50/60 rounded-2xl border border-rose-100">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              Xác Nhận Thành Công!
            </h3>
            <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto mb-6">
              {attending
                ? `Cảm ơn ${name}! Chúng tôi rất vinh hạnh được đón tiếp bạn và người thân trong ngày vui.`
                : `Cảm ơn ${name}! Rất tiếc vì bạn không thể tham dự, chúng tôi xin trân trọng cảm ơn tình cảm của bạn.`}
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
              }}
              className="text-xs sm:text-sm text-rose-600 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Gửi lại hoặc chỉnh sửa thông tin</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center">
                {errorMessage}
              </div>
            )}

            {/* Attendance Toggle */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 p-1.5 bg-gray-100/80 rounded-2xl">
              <button
                type="button"
                onClick={() => setAttending(true)}
                className={`py-3 px-3 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  attending
                    ? "bg-white text-rose-600 shadow-sm font-semibold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>🎉 Sẽ tham dự</span>
                {attending && <Check className="w-4 h-4 text-rose-500" />}
              </button>
              <button
                type="button"
                onClick={() => setAttending(false)}
                className={`py-3 px-3 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  !attending
                    ? "bg-white text-gray-800 shadow-sm font-semibold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>💌 Rất tiếc không thể đến</span>
                {!attending && <Check className="w-4 h-4 text-gray-700" />}
              </button>
            </div>

            {/* Name input */}
            <InputCustom
              label="Họ và tên của bạn"
              required
              icon={<User className="w-4 h-4" />}
              placeholder="Nhập tên của bạn (hoặc gia đình)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* Phone input */}
            <InputCustom
              label="Số điện thoại (để tiện liên lạc)"
              type="tel"
              icon={<Phone className="w-4 h-4" />}
              placeholder="Ví dụ: 0912 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            {/* Side selection & Guest Count (only if attending) */}
            {attending && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <DropdownCustom
                  label="Số người tham dự"
                  prefixIcon={<Users className="w-4 h-4" />}
                  value={guestCount}
                  onSelect={(val) => setGuestCount(Number(val))}
                  options={[
                    { label: "1 người (Chỉ mình tôi)", value: 1 },
                    { label: "2 người (Cùng người yêu/vợ/chồng)", value: 2 },
                    { label: "3 người", value: 3 },
                    { label: "4 người (Gia đình)", value: 4 },
                    { label: "5+ người", value: 5 },
                  ]}
                />

                <DropdownCustom
                  label="Tham dự tiệc mừng bên"
                  value={side}
                  onSelect={(val) => setSide(String(val))}
                  options={[
                    { label: "Nhà Trai (CN, 06.12.2026)", value: "nha-trai" },
                    { label: "Nhà Gái (T7, 05.12.2026)", value: "nha-gai" },
                  ]}
                />
              </div>
            )}

            {/* Note input */}
            <TextareaCustom
              label="Lời nhắn gửi cô dâu chú rể (tùy chọn)"
              rows={3}
              icon={<MessageSquare className="w-4 h-4" />}
              placeholder="Gửi lời chúc hoặc lưu ý đặc biệt cho cô dâu & chú rể..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            {/* Submit Button */}
            <div className="pt-2">
              <AppButton
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                icon={<Send className="w-4 h-4" />}
              >
                Gửi Xác Nhận Tham Dự
              </AppButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function RsvpSection(props: RsvpSectionProps) {
  return (
    <Suspense fallback={null}>
      <RsvpFormInternal {...props} />
    </Suspense>
  );
}
