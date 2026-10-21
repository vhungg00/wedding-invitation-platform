"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { ImageWithFallback } from "./ui/ImageWithFallback";
import {
  Gift,
  Copy,
  Check,
  Download,
  Building2,
  User,
  CreditCard,
  FileText,
  Heart,
  Send,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import weddingData from "@/data/wedding-data.json";
import { useGuest } from "@/lib/useGuest";

// Chuẩn hóa tiếng Việt không dấu cho cú pháp VietQR
function removeVietnameseTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

// Map tên ngân hàng thông dụng sang mã chuẩn VietQR
const BANK_SHORT_NAMES: Record<string, string> = {
  "MB": "MB",
  "MB BANK": "MB",
  "MBBANK": "MB",
  "VIETCOMBANK": "VCB",
  "VCB": "VCB",
  "TECHCOMBANK": "TCB",
  "TCB": "TCB",
  "TPBANK": "TPB",
  "TPB": "TPB",
  "VPBANK": "VPB",
  "BIDV": "BIDV",
  "VIETINBANK": "ICB",
  "ICB": "ICB",
  "ACB": "ACB",
  "AGRIBANK": "VBA",
  "VBA": "VBA",
  "SACOMBANK": "STB",
  "STB": "STB",
  "VIB": "VIB",
  "MSB": "MSB",
  "SHB": "SHB",
  "OCB": "OCB",
};

interface GiftBoxSectionProps {
  defaultSide?: "nha-trai" | "nha-gai";
}

function GiftBoxContent({
  defaultSide = "nha-trai",
}: GiftBoxSectionProps) {
  const [activeSide, setActiveSide] = useState<"nha-trai" | "nha-gai">(defaultSide);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showConfirmForm, setShowConfirmForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Lấy thông tin khách mời nếu vào bằng link cá nhân hóa
  const { guest } = useGuest();

  interface BankAccountDisplay {
    owner: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    qrCodeUrl?: string;
  }

  // Dữ liệu tài khoản Nhà Trai & Nhà Gái
  const nhaTraiAccount: BankAccountDisplay =
    (weddingData.nhaTrai?.donation?.bankAccount as BankAccountDisplay) ||
    (weddingData.donation?.bankAccounts?.[0] as BankAccountDisplay) || {
      owner: "Chú rể Việt Hùng",
      bankName: "MB Bank",
      accountNumber: "0988688888",
      accountName: "TA VIET HUNG",
      qrCodeUrl: "/qr.jpeg",
    };

  const nhaGaiAccount: BankAccountDisplay =
    (weddingData.nhaGai?.donation?.bankAccount as BankAccountDisplay) || {
      owner: "Cô dâu Xuân Ly",
      bankName: "MB Bank",
      accountNumber: "0988888888",
      accountName: "NGUYEN XUAN LY",
      qrCodeUrl: "/qr.jpeg",
    };

  const [dynamicQrTrai, setDynamicQrTrai] = useState<string | null>(null);
  const [dynamicQrGai, setDynamicQrGai] = useState<string | null>(null);

  // Cập nhật QR code động từ Database khi admin đổi ảnh
  useEffect(() => {
    fetch("/api/invitation")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          if (res.data.qrCodeNhaTrai || res.data.nhaTrai?.donation?.bankAccount?.qrCodeUrl) {
            setDynamicQrTrai(res.data.qrCodeNhaTrai || res.data.nhaTrai.donation.bankAccount.qrCodeUrl);
          }
          if (res.data.qrCodeNhaGai || res.data.nhaGai?.donation?.bankAccount?.qrCodeUrl) {
            setDynamicQrGai(res.data.qrCodeNhaGai || res.data.nhaGai.donation.bankAccount.qrCodeUrl);
          }
        }
      })
      .catch(() => {});
  }, []);

  const currentAccount = activeSide === "nha-trai" ? nhaTraiAccount : nhaGaiAccount;

  // Form xác nhận gửi quà mừng
  const [donorName, setDonorName] = useState(guest?.name || "");
  const [donorPhone, setDonorPhone] = useState(guest?.phone || "");
  const [donorAmount, setDonorAmount] = useState("");
  const [donorNote, setDonorNote] = useState("");

  // Chuẩn bị nội dung chuyển khoản động
  const guestCleanName = guest?.name
    ? removeVietnameseTones(guest.name)
    : "";
  const transferContent = guestCleanName
    ? `MUNG CUOI HUNG LY ${guestCleanName}`
    : "MUNG CUOI HUNG LY";

  // Tạo URL VietQR chuẩn
  const rawBankName = (currentAccount.bankName || "MB").toUpperCase().trim();
  const bankCode = BANK_SHORT_NAMES[rawBankName] || "MB";
  const isValidAccountNo =
    currentAccount.accountNumber &&
    currentAccount.accountNumber !== "Đang cập nhật";

  const activeQrCode = activeSide === "nha-trai"
    ? (dynamicQrTrai || currentAccount.qrCodeUrl || "/qr.jpeg")
    : (dynamicQrGai || currentAccount.qrCodeUrl || "/qr.jpeg");

  const qrImageUrl = isValidAccountNo
    ? `https://img.vietqr.io/image/${bankCode}-${currentAccount.accountNumber}-compact2.png?accountName=${encodeURIComponent(
        currentAccount.accountName || ""
      )}&addInfo=${encodeURIComponent(transferContent)}`
    : activeQrCode;

  // Hàm copy vào clipboard
  const handleCopy = (text: string, fieldName: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  // Hàm tải ảnh QR
  const handleDownloadQr = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vietqr-mung-cuoi-${activeSide}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(qrImageUrl, "_blank");
    }
  };

  // Gửi xác nhận đã chuyển khoản
  const handleSubmitConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim()) {
      alert("Vui lòng nhập tên của bạn");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: donorName.trim(),
          amount: Number(donorAmount.replace(/\D/g, "")) || 0,
          side: activeSide,
          method: "QR",
          phone: donorPhone.trim() || null,
          note: donorNote.trim() || null,
          guestId: guest?.id || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFormSubmitted(true);
      } else {
        alert(data.message || "Không thể gửi xác nhận, vui lòng thử lại!");
      }
    } catch {
      alert("Đã xảy ra lỗi khi gửi xác nhận!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="gift-box"
      data-aos="fade-up"
      className="my-14 sm:my-20 px-3 sm:px-6 max-w-4xl mx-auto"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-amber-50/70 via-rose-50/40 to-white border border-amber-200/80 shadow-xl p-6 sm:p-10 text-center">
        {/* Decorative corner accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-rose-200/30 to-transparent pointer-events-none rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-radial from-amber-200/30 to-transparent pointer-events-none rounded-tr-full" />

        {/* Badge Header */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-3 shadow-xs">
          <Gift className="w-4 h-4 text-rose-600" />
          <span>Hộp Mừng Cưới & Chúc Phúc</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-gray-800 tracking-wide mb-3">
          Gửi Quà Mừng Đến Đôi Uyên Ương
        </h2>

        {/* Thank you message */}
        <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed italic mb-8">
          &ldquo;{weddingData.donation?.thankYouMessage ||
            "Sự hiện diện của quý vị là niềm vinh hạnh lớn của chúng tôi. Nếu không thể đến dự trực tiếp, quý vị có thể gửi quà mừng qua đây."}&rdquo;
        </p>

        {/* Tab switch Nhà Trai / Nhà Gái */}
        <div className="inline-flex p-1.5 rounded-2xl bg-amber-100/70 border border-amber-200 max-w-md mx-auto mb-8 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveSide("nha-trai")}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
              activeSide === "nha-trai"
                ? "bg-rose-600 text-white shadow-md font-semibold"
                : "text-gray-700 hover:text-rose-600"
            }`}
          >
            <span>🤵</span>
            <span>Mừng Chú Rể (Nhà Trai)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSide("nha-gai")}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
              activeSide === "nha-gai"
                ? "bg-rose-600 text-white shadow-md font-semibold"
                : "text-gray-700 hover:text-rose-600"
            }`}
          >
            <span>👰</span>
            <span>Mừng Cô Dâu (Nhà Gái)</span>
          </button>
        </div>

        {/* Card Chi tiết Quà Mừng */}
        <div className="bg-white/95 rounded-2xl border border-rose-100 shadow-md p-6 sm:p-8 max-w-2xl mx-auto text-left relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
            {/* Cột 1: Mã VietQR */}
            <div className="flex flex-col items-center">
              <div className="relative p-3 bg-white rounded-2xl border-2 border-dashed border-rose-200 shadow-sm group">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center">
                  <ImageWithFallback
                    src={qrImageUrl}
                    fallbackSrc="/qr.jpeg"
                    alt="VietQR Mừng Cưới"
                    width={224}
                    height={224}
                    className="object-contain w-full h-full"
                    priority
                    unoptimized
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải ảnh QR</span>
                </button>
              </div>
            </div>

            {/* Cột 2: Thông tin chuyển khoản & Nút thao tác */}
            <div className="space-y-4 text-sm text-gray-700">
              {/* Ngân hàng */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-50/50 border border-amber-100">
                <Building2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium uppercase text-gray-400">Ngân hàng</div>
                  <div className="font-semibold text-gray-800 truncate">
                    {currentAccount.bankName || "MB Bank"}
                  </div>
                </div>
              </div>

              {/* Chủ tài khoản */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-rose-50/40 border border-rose-100">
                <User className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium uppercase text-gray-400">Chủ tài khoản</div>
                  <div className="font-bold text-gray-900 tracking-wide uppercase truncate">
                    {currentAccount.accountName || currentAccount.owner}
                  </div>
                </div>
              </div>

              {/* Số tài khoản & Nút copy */}
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-amber-50/50 border border-amber-100">
                <div className="flex items-start gap-3 min-w-0">
                  <CreditCard className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium uppercase text-gray-400">Số tài khoản</div>
                    <div className="font-mono font-bold text-base text-rose-600 truncate">
                      {currentAccount.accountNumber || "Đang cập nhật"}
                    </div>
                  </div>
                </div>

                {currentAccount.accountNumber && (
                  <button
                    type="button"
                    onClick={() => handleCopy(currentAccount.accountNumber, "stk")}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-xs transition cursor-pointer"
                  >
                    {copiedField === "stk" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Đã chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Nội dung chuyển khoản */}
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-start gap-3 min-w-0">
                  <FileText className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium uppercase text-gray-400">
                      Nội dung chuyển khoản
                    </div>
                    <div className="font-mono text-xs font-semibold text-gray-800 break-all">
                      {transferContent}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(transferContent, "nd")}
                  className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition cursor-pointer"
                >
                  {copiedField === "nd" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Chép ND</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Dòng hướng dẫn người dùng điện thoại */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Dùng app ngân hàng bấm <strong>Sao chép số tài khoản</strong> để chuyển tiền nhanh.</span>
            </p>

            {/* Nút mở Form xác nhận */}
            <button
              type="button"
              onClick={() => setShowConfirmForm(!showConfirmForm)}
              className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>{showConfirmForm ? "Ẩn biểu mẫu báo hỷ" : "💌 Bạn đã gửi mừng? Nhấn để báo hỷ"}</span>
            </button>
          </div>

          {/* Form xác nhận đã gửi mừng */}
          {showConfirmForm && (
            <div className="mt-5 p-5 bg-gradient-to-r from-rose-50/70 to-amber-50/50 rounded-xl border border-rose-200 animate-fade-in">
              {formSubmitted ? (
                <div className="py-4 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h4 className="font-semibold text-gray-800 text-base">
                    Cảm ơn bạn rất nhiều!
                  </h4>
                  <p className="text-xs text-gray-600 max-w-sm mx-auto">
                    Cô dâu chú rể đã nhận được thông tin báo hỷ của bạn và sẽ sớm đối soát. Chúc bạn luôn an vui!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitConfirm} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-rose-500" />
                      <span>Xác nhận đã gửi quà mừng</span>
                    </h4>
                    <span className="text-[11px] text-gray-500 italic">
                      (Giúp cô dâu & chú rể đối soát dễ dàng)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-medium text-gray-700 mb-1">
                        Tên người gửi <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Ví dụ: Anh Nam (Bạn cấp 3)"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 focus:outline-rose-500 text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-gray-700 mb-1">
                        Số tiền mừng (VNĐ)
                      </label>
                      <input
                        type="text"
                        value={donorAmount}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setDonorAmount(val ? Number(val).toLocaleString("vi-VN") : "");
                        }}
                        placeholder="Ví dụ: 500,000"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 focus:outline-rose-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-gray-700 mb-1">
                        Số điện thoại (tùy chọn)
                      </label>
                      <input
                        type="tel"
                        value={donorPhone}
                        onChange={(e) => setDonorPhone(e.target.value)}
                        placeholder="0988xxxxxx"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 focus:outline-rose-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-gray-700 mb-1">
                        Lời nhắn / Lời chúc
                      </label>
                      <input
                        type="text"
                        value={donorNote}
                        onChange={(e) => setDonorNote(e.target.value)}
                        placeholder="Chúc hai bạn trăm năm hạnh phúc!"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 focus:outline-rose-500 text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? "Đang gửi..." : "Gửi thông tin mừng cưới"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function GiftBoxSection({
  defaultSide = "nha-trai",
}: GiftBoxSectionProps) {
  return (
    <Suspense fallback={null}>
      <GiftBoxContent defaultSide={defaultSide} />
    </Suspense>
  );
}

