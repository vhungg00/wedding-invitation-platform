"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Users,
  CreditCard,
  Quote,
  RotateCcw,
  Building,
} from "lucide-react";
import defaultWeddingData from "@/data/wedding-data.json";

export interface WeddingFormData {
  // 1. Nhà Trai (Lễ Thành Hôn)
  traiTitle: string;
  traiTime: string;
  traiDayOfWeek: string;
  traiSolarDay: number;
  traiSolarMonth: number;
  traiSolarYear: number;
  traiLunarDate: string;
  traiVenueName: string;
  traiAddress: string;
  traiMapUrl: string;

  // 2. Nhà Gái (Lễ Vu Quy)
  gaiTitle: string;
  gaiTime: string;
  gaiDayOfWeek: string;
  gaiSolarDay: number;
  gaiSolarMonth: number;
  gaiSolarYear: number;
  gaiLunarDate: string;
  gaiVenueName: string;
  gaiAddress: string;
  gaiMapUrl: string;

  // 3. Gia Đình & Cô Dâu - Chú Rể
  groomName: string;
  groomFatherName: string;
  groomMotherName: string;
  groomAddress: string;

  brideName: string;
  brideNhaTraiName: string;
  brideFatherName: string;
  brideMotherName: string;
  brideAddress: string;

  // 4. Tài khoản Ngân hàng
  traiBankName: string;
  traiAccountNo: string;
  traiAccountName: string;

  gaiBankName: string;
  gaiAccountNo: string;
  gaiAccountName: string;

  // 5. Câu trích dẫn & Lời cảm ơn
  quoteLine1: string;
  quoteLine2: string;
  thankYouMessage: string;
}

// Trích xuất dữ liệu thô từ API hoặc default JSON thành formData chuẩn
const extractFormData = (d: any): WeddingFormData => {
  const ntEvent = d.nhaTrai?.events?.[0] || d.events?.[0];
  const ngEvent = d.nhaGai?.events?.[0];
  const traiBank = d.nhaTrai?.donation?.bankAccount || d.donation?.bankAccounts?.[0];
  const gaiBank = d.nhaGai?.donation?.bankAccount || d.donation?.bankAccounts?.[1];

  return {
    traiTitle: ntEvent?.title || "LỄ THÀNH HÔN & TIỆC CƯỚI",
    traiTime: ntEvent?.time || "10h00",
    traiDayOfWeek: ntEvent?.dayOfWeek || "Chủ Nhật",
    traiSolarDay: ntEvent?.solarDate?.day ?? 6,
    traiSolarMonth: ntEvent?.solarDate?.month ?? 12,
    traiSolarYear: ntEvent?.solarDate?.year ?? 2026,
    traiLunarDate: ntEvent?.lunarDate || "Tức Ngày 28 Tháng 10 Năm Bính Ngọ",
    traiVenueName: ntEvent?.venueName || "Tại gia đình nhà trai",
    traiAddress: ntEvent?.address || d.groom?.address || "Thôn Na Phả, Xã Bản Lầu, Tỉnh Lào Cai",
    traiMapUrl: ntEvent?.mapUrl || "",

    gaiTitle: ngEvent?.title || "LỄ VU QUY & TIỆC CƯỚI",
    gaiTime: ngEvent?.time || "10h00",
    gaiDayOfWeek: ngEvent?.dayOfWeek || "Thứ Bảy",
    gaiSolarDay: ngEvent?.solarDate?.day ?? 5,
    gaiSolarMonth: ngEvent?.solarDate?.month ?? 12,
    gaiSolarYear: ngEvent?.solarDate?.year ?? 2026,
    gaiLunarDate: ngEvent?.lunarDate || "Tức Ngày 27 Tháng 10 Năm Bính Ngọ",
    gaiVenueName: ngEvent?.venueName || "Tại gia đình nhà gái",
    gaiAddress: ngEvent?.address || d.bride?.address || "1003, Lê Thanh, Nam Cường",
    gaiMapUrl: ngEvent?.mapUrl || "",

    groomName: d.groom?.name || "Việt Hùng",
    groomFatherName: d.groom?.fatherName || "ÔNG TẠ VĂN VƯỢNG",
    groomMotherName: d.groom?.motherName || "BÀ ĐẶNG THỊ XUÂN",
    groomAddress: d.groom?.address || "Thôn Na Phả, Xã Bản Lầu, Tỉnh Lào Cai",

    brideName: d.bride?.name || "Xuân Ly",
    brideNhaTraiName: d.nhaTrai?.bride?.name || "Khánh Ly",
    brideFatherName: d.bride?.fatherName || "ÔNG NGUYỄN VĂN HƯNG",
    brideMotherName: d.bride?.motherName || "BÀ PHẠM THỊ KHUYÊN",
    brideAddress: d.bride?.address || "1003, Lê Thanh, Nam Cường",

    traiBankName: traiBank?.bankName || "MB Bank",
    traiAccountNo: traiBank?.accountNumber || "",
    traiAccountName: traiBank?.accountName || "TẠ VIỆT HÙNG",

    gaiBankName: gaiBank?.bankName || "MB Bank",
    gaiAccountNo: gaiBank?.accountNumber || "",
    gaiAccountName: gaiBank?.accountName || "NGUYỄN XUÂN LY",

    quoteLine1: d.quotes?.line1 || "Hôn nhân là chuyện cả đời",
    quoteLine2: d.quotes?.line2 || "Yêu người vừa ý, cưới người mình thương",
    thankYouMessage:
      d.nhaTrai?.donation?.thankYouMessage ||
      d.donation?.thankYouMessage ||
      "Chân thành cảm ơn quý vị – sự hiện diện của quý vị là niềm vinh hạnh lớn đối với chúng tôi.",
  };
};

export default function WeddingInfoAdminPage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Toàn bộ form lưu trữ trong 1 object duy nhất
  const [formData, setFormData] = useState<WeddingFormData>(() =>
    extractFormData(defaultWeddingData)
  );

  // Helper cập nhật từng trường và bật cờ unsaved changes
  const handleChange = <K extends keyof WeddingFormData>(
    field: K,
    value: WeddingFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (!hasUnsavedChanges) setHasUnsavedChanges(true);
  };

  // Tải dữ liệu từ API
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/invitation");
      const json = await res.json();
      const d = json.data || defaultWeddingData;
      setFormData(extractFormData(d));
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Lỗi khi tải thông tin cưới:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/check");
        const data = await res.json();
        if (data.authenticated) {
          loadData();
        } else {
          router.replace("/admin/login");
        }
      } catch {
        router.replace("/admin/login");
      } finally {
        setAuthChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  // Cảnh báo khi người dùng tắt tab mà chưa lưu thay đổi
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Lưu toàn bộ vào Database MongoDB
  const handleSaveAll = async () => {
    setSaving(true);
    setStatusMessage(null);

    try {
      const {
        traiTitle,
        traiTime,
        traiDayOfWeek,
        traiSolarDay,
        traiSolarMonth,
        traiSolarYear,
        traiLunarDate,
        traiVenueName,
        traiAddress,
        traiMapUrl,
        gaiTitle,
        gaiTime,
        gaiDayOfWeek,
        gaiSolarDay,
        gaiSolarMonth,
        gaiSolarYear,
        gaiLunarDate,
        gaiVenueName,
        gaiAddress,
        gaiMapUrl,
        groomName,
        groomFatherName,
        groomMotherName,
        groomAddress,
        brideName,
        brideNhaTraiName,
        brideFatherName,
        brideMotherName,
        brideAddress,
        traiBankName,
        traiAccountNo,
        traiAccountName,
        gaiBankName,
        gaiAccountNo,
        gaiAccountName,
        quoteLine1,
        quoteLine2,
        thankYouMessage,
      } = formData;

      const effectiveBrideTrai = brideNhaTraiName.trim() || brideName.trim();

      // Chuẩn bị payload đồng bộ
      const payload = {
        groom: {
          name: groomName,
          shortName: groomName,
          fatherName: groomFatherName,
          motherName: groomMotherName,
          address: groomAddress,
        },
        bride: {
          name: brideName,
          shortName: brideName,
          fatherName: brideFatherName,
          motherName: brideMotherName,
          address: brideAddress,
        },
        nhaTrai: {
          title: `Lễ Thành Hôn - Thiệp Cưới ${groomName} & ${effectiveBrideTrai}`,
          description: `Thư mời tiệc mừng Lễ Thành Hôn ${groomName} & ${effectiveBrideTrai} - ${String(traiSolarDay).padStart(2, "0")}.${String(traiSolarMonth).padStart(2, "0")}.${traiSolarYear}`,
          bride: {
            name: effectiveBrideTrai,
            shortName: effectiveBrideTrai,
          },
          hero: {
            title: "THƯ MỜI TIỆC CƯỚI",
            weddingDateText: `${traiDayOfWeek.toUpperCase()} - ${traiTime.toUpperCase()}`,
            dateFormatted: `${String(traiSolarDay).padStart(2, "0")} . ${String(traiSolarMonth).padStart(2, "0")} . ${traiSolarYear}`,
          },
          events: [
            {
              title: traiTitle,
              subtitle: "Tại gia đình nhà trai",
              time: traiTime,
              dayOfWeek: traiDayOfWeek,
              solarDate: {
                day: Number(traiSolarDay),
                month: Number(traiSolarMonth),
                year: Number(traiSolarYear),
              },
              lunarDate: traiLunarDate,
              venueName: traiVenueName,
              timeRange: traiTime.toUpperCase(),
              address: traiAddress,
              mapUrl: traiMapUrl,
            },
          ],
          donation: {
            thankYouMessage,
            bankAccount: {
              owner: `Chú rể ${groomName}`,
              bankName: traiBankName,
              accountNumber: traiAccountNo,
              accountName: traiAccountName,
            },
          },
        },
        nhaGai: {
          title: `Lễ Vu Quy - Thiệp Cưới ${brideName} & ${groomName}`,
          description: `Thư mời tiệc mừng Lễ Vu Quy ${brideName} & ${groomName} - ${String(gaiSolarDay).padStart(2, "0")}.${String(gaiSolarMonth).padStart(2, "0")}.${gaiSolarYear}`,
          hero: {
            title: "THƯ MỜI TIỆC CƯỚI",
            weddingDateText: `${gaiDayOfWeek.toUpperCase()} - ${gaiTime.toUpperCase()}`,
            dateFormatted: `${String(gaiSolarDay).padStart(2, "0")} . ${String(gaiSolarMonth).padStart(2, "0")} . ${gaiSolarYear}`,
          },
          events: [
            {
              title: gaiTitle,
              subtitle: "Tại gia đình nhà gái",
              time: gaiTime,
              dayOfWeek: gaiDayOfWeek,
              solarDate: {
                day: Number(gaiSolarDay),
                month: Number(gaiSolarMonth),
                year: Number(gaiSolarYear),
              },
              lunarDate: gaiLunarDate,
              venueName: gaiVenueName,
              timeRange: gaiTime.toUpperCase(),
              address: gaiAddress,
              mapUrl: gaiMapUrl,
            },
          ],
          donation: {
            thankYouMessage,
            bankAccount: {
              owner: `Cô dâu ${brideName}`,
              bankName: gaiBankName,
              accountNumber: gaiAccountNo,
              accountName: gaiAccountName,
            },
          },
        },
        quotes: {
          line1: quoteLine1,
          line2: quoteLine2,
        },
      };

      const res = await fetch("/api/invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.savedToDb !== false) {
        setHasUnsavedChanges(false);
        setStatusMessage({
          type: "success",
          text: "✨ Đã lưu thông tin giờ, ngày cưới, địa chỉ và ngân hàng vào Database MongoDB thành công!",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: json.message || "Lưu thất bại, vui lòng thử lại!",
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: "Lỗi kết nối máy chủ: " + err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  // Khôi phục giá trị mặc định ban đầu
  const handleResetToDefault = () => {
    if (confirm("Bạn có chắc muốn khôi phục lại toàn bộ thông tin về mặc định ban đầu?")) {
      setFormData(extractFormData(defaultWeddingData));
      setHasUnsavedChanges(true);
      setStatusMessage({
        type: "success",
        text: "Đã đưa thông tin về mặc định. Hãy bấm 'Lưu Thay Đổi' để cập nhật Database!",
      });
    }
  };

  if (authChecking || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50/50 via-white to-pink-50/30 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          <p className="text-sm text-gray-500 font-medium">Đang tải thông tin hôn lễ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/40 via-white to-amber-50/30 pb-20">
      {/* Thanh Topbar Cố định */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Quay lại Bảng điều khiển"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Bảng Điều Khiển</span>
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-rose-100 text-rose-600">
                  <Calendar className="w-4 h-4" />
                </span>
                <h1 className="text-base sm:text-lg font-bold text-gray-900">
                  Quản Lý Giờ, Ngày Cưới & Địa Chỉ Hôn Lễ
                </h1>
              </div>
              <p className="text-[11px] text-gray-500">
                Lưu vào MongoDB Atlas • Tự động hiển thị tức thì trên cả 2 trang thiệp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium transition"
            >
              <span>Xem Thiệp Nhà Trai</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/nha-gai"
              target="_blank"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium transition"
            >
              <span>Xem Thiệp Nhà Gái</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={handleResetToDefault}
              disabled={saving}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-xs font-medium transition cursor-pointer"
              title="Khôi phục thông tin gốc mặc định"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Khôi Phục Gốc</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition shadow-sm cursor-pointer ${
                hasUnsavedChanges
                  ? "bg-rose-600 hover:bg-rose-700 animate-pulse ring-2 ring-rose-400"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu vào DB...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu Thay Đổi</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Thông báo trạng thái hoặc cảnh báo thay đổi chưa lưu */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-2">
          {statusMessage && (
            <div
              className={`p-2.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2 transition ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="text-xs opacity-60 hover:opacity-100 font-bold px-1"
              >
                ✕
              </button>
            </div>
          )}

          {hasUnsavedChanges && !statusMessage && (
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Bạn có thay đổi chưa lưu. Hãy nhớ ấn nút <strong>&ldquo;Lưu Thay Đổi&rdquo;</strong> ở trên để cập nhật vào Database!
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Nội dung Form chính */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* PHẦN 1: NHÀ TRAI (LỄ THÀNH HÔN) */}
        <section className="bg-white/95 backdrop-blur-md rounded-3xl border border-rose-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600 font-bold">
                <Building className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  1. Thông Tin Hôn Lễ Nhà Trai (Lễ Thành Hôn)
                </h2>
                <p className="text-xs text-gray-500">
                  Áp dụng trên trang chủ thiệp Nhà Trai (/)
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              Nhà Trai
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Tiêu đề sự kiện
              </label>
              <input
                type="text"
                value={formData.traiTitle}
                onChange={(e) => handleChange("traiTitle", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs text-gray-800 outline-hidden transition"
                placeholder="VD: LỄ THÀNH HÔN & TIỆC CƯỚI"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Giờ tổ chức
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.traiTime}
                  onChange={(e) => handleChange("traiTime", e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs text-gray-800 outline-hidden transition"
                  placeholder="VD: 10h00"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Thứ trong tuần
              </label>
              <input
                type="text"
                value={formData.traiDayOfWeek}
                onChange={(e) => handleChange("traiDayOfWeek", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs text-gray-800 outline-hidden transition"
                placeholder="VD: Chủ Nhật"
              />
            </div>

            {/* Ngày Dương Lịch */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Ngày Dương Lịch (Ngày / Tháng / Năm)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.traiSolarDay}
                  onChange={(e) => handleChange("traiSolarDay", Number(e.target.value))}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs text-center text-gray-800 font-bold outline-hidden transition"
                  placeholder="Ngày"
                />
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.traiSolarMonth}
                  onChange={(e) => handleChange("traiSolarMonth", Number(e.target.value))}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs text-center text-gray-800 font-bold outline-hidden transition"
                  placeholder="Tháng"
                />
                <input
                  type="number"
                  min="2024"
                  max="2030"
                  value={formData.traiSolarYear}
                  onChange={(e) => handleChange("traiSolarYear", Number(e.target.value))}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs text-center text-gray-800 font-bold outline-hidden transition"
                  placeholder="Năm"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Ngày Âm Lịch (Hiển thị trong ngoặc)
              </label>
              <input
                type="text"
                value={formData.traiLunarDate}
                onChange={(e) => handleChange("traiLunarDate", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs text-gray-800 outline-hidden transition"
                placeholder="VD: Tức Ngày 28 Tháng 10 Năm Bính Ngọ"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Tên nơi tổ chức (Venue)
              </label>
              <input
                type="text"
                value={formData.traiVenueName}
                onChange={(e) => handleChange("traiVenueName", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs text-gray-800 outline-hidden transition"
                placeholder="VD: Tại gia đình nhà trai"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Địa chỉ chi tiết Nhà Trai
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.traiAddress}
                  onChange={(e) => handleChange("traiAddress", e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs text-gray-800 outline-hidden transition"
                  placeholder="VD: Thôn Na Phả, Xã Bản Lầu, Tỉnh Lào Cai"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Link bản đồ Google Maps (Link nhúng embed hoặc link dẫn đường)
              </label>
              <input
                type="text"
                value={formData.traiMapUrl}
                onChange={(e) => handleChange("traiMapUrl", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs text-gray-800 outline-hidden transition font-mono"
                placeholder="https://maps.google.com/maps?q=...&output=embed"
              />
            </div>
          </div>
        </section>

        {/* PHẦN 2: NHÀ GÁI (LỄ VU QUY) */}
        <section className="bg-white/95 backdrop-blur-md rounded-3xl border border-amber-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600 font-bold">
                <Building className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  2. Thông Tin Hôn Lễ Nhà Gái (Lễ Vu Quy)
                </h2>
                <p className="text-xs text-gray-500">
                  Áp dụng trên trang thiệp Nhà Gái (/nha-gai)
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
              Nhà Gái
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Tiêu đề sự kiện
              </label>
              <input
                type="text"
                value={formData.gaiTitle}
                onChange={(e) => handleChange("gaiTitle", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-xs text-gray-800 outline-hidden transition"
                placeholder="VD: LỄ VU QUY & TIỆC CƯỚI"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Giờ tổ chức
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.gaiTime}
                  onChange={(e) => handleChange("gaiTime", e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-xs text-gray-800 outline-hidden transition"
                  placeholder="VD: 10h00"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Thứ trong tuần
              </label>
              <input
                type="text"
                value={formData.gaiDayOfWeek}
                onChange={(e) => handleChange("gaiDayOfWeek", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-xs text-gray-800 outline-hidden transition"
                placeholder="VD: Thứ Bảy"
              />
            </div>

            {/* Ngày Dương Lịch */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Ngày Dương Lịch (Ngày / Tháng / Năm)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.gaiSolarDay}
                  onChange={(e) => handleChange("gaiSolarDay", Number(e.target.value))}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-xs text-center text-gray-800 font-bold outline-hidden transition"
                  placeholder="Ngày"
                />
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.gaiSolarMonth}
                  onChange={(e) => handleChange("gaiSolarMonth", Number(e.target.value))}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-xs text-center text-gray-800 font-bold outline-hidden transition"
                  placeholder="Tháng"
                />
                <input
                  type="number"
                  min="2024"
                  max="2030"
                  value={formData.gaiSolarYear}
                  onChange={(e) => handleChange("gaiSolarYear", Number(e.target.value))}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-xs text-center text-gray-800 font-bold outline-hidden transition"
                  placeholder="Năm"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Ngày Âm Lịch (Hiển thị trong ngoặc)
              </label>
              <input
                type="text"
                value={formData.gaiLunarDate}
                onChange={(e) => handleChange("gaiLunarDate", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-xs text-gray-800 outline-hidden transition"
                placeholder="VD: Tức Ngày 27 Tháng 10 Năm Bính Ngọ"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Tên nơi tổ chức (Venue)
              </label>
              <input
                type="text"
                value={formData.gaiVenueName}
                onChange={(e) => handleChange("gaiVenueName", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-xs text-gray-800 outline-hidden transition"
                placeholder="VD: Tại gia đình nhà gái"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Địa chỉ chi tiết Nhà Gái
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.gaiAddress}
                  onChange={(e) => handleChange("gaiAddress", e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-xs text-gray-800 outline-hidden transition"
                  placeholder="VD: 1003, Lê Thanh, Nam Cường"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Link bản đồ Google Maps (Link nhúng embed hoặc link dẫn đường)
              </label>
              <input
                type="text"
                value={formData.gaiMapUrl}
                onChange={(e) => handleChange("gaiMapUrl", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-xs text-gray-800 outline-hidden transition font-mono"
                placeholder="https://maps.google.com/maps?q=...&output=embed"
              />
            </div>
          </div>
        </section>

        {/* PHẦN 3: GIA ĐÌNH & CÔ DÂU - CHÚ RỂ */}
        <section className="bg-white/95 backdrop-blur-md rounded-3xl border border-rose-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-rose-100">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600 font-bold">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                3. Thông Tin Gia Đình Hai Bên & Cô Dâu - Chú Rể
              </h2>
              <p className="text-xs text-gray-500">
                Hiển thị trong mục Nhà Trai - Nhà Gái và tên Chú Rể - Cô Dâu
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cột Chú Rể & Nhà Trai */}
            <div className="p-5 rounded-2xl border border-blue-100 bg-blue-50/20 space-y-4">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">
                  🤵 Phía Chú Rể & Nhà Trai
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Họ tên Chú Rể
                </label>
                <input
                  type="text"
                  value={formData.groomName}
                  onChange={(e) => handleChange("groomName", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-xs text-gray-800 font-semibold outline-hidden transition"
                  placeholder="VD: Việt Hùng"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tên Bố Chú Rể
                </label>
                <input
                  type="text"
                  value={formData.groomFatherName}
                  onChange={(e) => handleChange("groomFatherName", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-xs text-gray-800 outline-hidden transition"
                  placeholder="VD: ÔNG TẠ VĂN VƯỢNG"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tên Mẹ Chú Rể
                </label>
                <input
                  type="text"
                  value={formData.groomMotherName}
                  onChange={(e) => handleChange("groomMotherName", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-xs text-gray-800 outline-hidden transition"
                  placeholder="VD: BÀ ĐẶNG THỊ XUÂN"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Địa chỉ Quê Quán Nhà Trai
                </label>
                <input
                  type="text"
                  value={formData.groomAddress}
                  onChange={(e) => handleChange("groomAddress", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-xs text-gray-800 outline-hidden transition"
                  placeholder="VD: Thôn Na Phả, Xã Bản Lầu, Tỉnh Lào Cai"
                />
              </div>
            </div>

            {/* Cột Cô Dâu & Nhà Gái */}
            <div className="p-5 rounded-2xl border border-rose-100 bg-rose-50/20 space-y-4">
              <div className="flex items-center justify-between border-b border-rose-100 pb-2">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wide">
                  👰 Phía Cô Dâu & Nhà Gái
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Họ tên Cô Dâu (Nhà Gái)
                </label>
                <input
                  type="text"
                  value={formData.brideName}
                  onChange={(e) => handleChange("brideName", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs text-gray-800 font-semibold outline-hidden transition"
                  placeholder="VD: Xuân Ly"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Tên Cô Dâu hiển thị bên Nhà Trai
                  </label>
                  <span className="text-[10px] text-amber-700 bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-md font-semibold">
                    Hiện tại: Khánh Ly
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.brideNhaTraiName}
                  onChange={(e) => handleChange("brideNhaTraiName", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs text-gray-800 font-semibold outline-hidden transition"
                  placeholder="VD: Khánh Ly"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  💡 Thiệp Nhà Trai sẽ hiển thị tên này. Thiệp Nhà Gái sẽ hiển thị theo &quot;Họ tên Cô Dâu&quot; ở trên.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tên Bố Cô Dâu
                </label>
                <input
                  type="text"
                  value={formData.brideFatherName}
                  onChange={(e) => handleChange("brideFatherName", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs text-gray-800 outline-hidden transition"
                  placeholder="VD: ÔNG NGUYỄN VĂN HƯNG"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tên Mẹ Cô Dâu
                </label>
                <input
                  type="text"
                  value={formData.brideMotherName}
                  onChange={(e) => handleChange("brideMotherName", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs text-gray-800 outline-hidden transition"
                  placeholder="VD: BÀ PHẠM THỊ KHUYÊN"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Địa chỉ Quê Quán Nhà Gái
                </label>
                <input
                  type="text"
                  value={formData.brideAddress}
                  onChange={(e) => handleChange("brideAddress", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs text-gray-800 outline-hidden transition"
                  placeholder="VD: 1003, Lê Thanh, Nam Cường"
                />
              </div>
            </div>
          </div>
        </section>

        {/* PHẦN 4: TÀI KHOẢN NGÂN HÀNG MỪNG CƯỚI */}
        <section className="bg-white/95 backdrop-blur-md rounded-3xl border border-rose-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-rose-100">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 font-bold">
              <CreditCard className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                4. Tài Khoản Ngân Hàng Mừng Cưới (Hộp Mừng Cưới)
              </h2>
              <p className="text-xs text-gray-500">
                Dùng để sao chép số tài khoản và tạo mã chuyển khoản VietQR tự động
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* TK Nhà Trai */}
            <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/40 space-y-4">
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wide block border-b pb-2">
                🏦 Tài Khoản Nhà Trai (Chú Rể)
              </span>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tên Ngân Hàng
                </label>
                <input
                  type="text"
                  value={formData.traiBankName}
                  onChange={(e) => handleChange("traiBankName", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs text-gray-800 outline-hidden transition"
                  placeholder="VD: MB Bank, Vietcombank, TPBank,..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Số Tài Khoản
                </label>
                <input
                  type="text"
                  value={formData.traiAccountNo}
                  onChange={(e) => handleChange("traiAccountNo", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs text-gray-800 font-mono font-bold outline-hidden transition"
                  placeholder="VD: 0988688888"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tên Chủ Tài Khoản (Không dấu)
                </label>
                <input
                  type="text"
                  value={formData.traiAccountName}
                  onChange={(e) => handleChange("traiAccountName", e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs text-gray-800 font-bold uppercase outline-hidden transition"
                  placeholder="VD: TA VIET HUNG"
                />
              </div>
            </div>

            {/* TK Nhà Gái */}
            <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/40 space-y-4">
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wide block border-b pb-2">
                🏦 Tài Khoản Nhà Gái (Cô Dâu)
              </span>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tên Ngân Hàng
                </label>
                <input
                  type="text"
                  value={formData.gaiBankName}
                  onChange={(e) => handleChange("gaiBankName", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs text-gray-800 outline-hidden transition"
                  placeholder="VD: MB Bank, Vietcombank, TPBank,..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Số Tài Khoản
                </label>
                <input
                  type="text"
                  value={formData.gaiAccountNo}
                  onChange={(e) => handleChange("gaiAccountNo", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs text-gray-800 font-mono font-bold outline-hidden transition"
                  placeholder="VD: 0988888888"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tên Chủ Tài Khoản (Không dấu)
                </label>
                <input
                  type="text"
                  value={formData.gaiAccountName}
                  onChange={(e) => handleChange("gaiAccountName", e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs text-gray-800 font-bold uppercase outline-hidden transition"
                  placeholder="VD: NGUYEN XUAN LY"
                />
              </div>
            </div>
          </div>
        </section>

        {/* PHẦN 5: CÂU TRÍCH DẪN & LỜI CẢM ƠN */}
        <section className="bg-white/95 backdrop-blur-md rounded-3xl border border-rose-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-rose-100">
            <span className="p-2 rounded-xl bg-pink-50 text-pink-600 font-bold">
              <Quote className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                5. Câu Trích Dẫn & Lời Cảm Ơn
              </h2>
              <p className="text-xs text-gray-500">
                Hiển thị trong khối thơ tình yêu và chân trang thiệp
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Câu trích dẫn - Dòng 1
              </label>
              <input
                type="text"
                value={formData.quoteLine1}
                onChange={(e) => handleChange("quoteLine1", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs text-gray-800 outline-hidden transition"
                placeholder="Hôn nhân là chuyện cả đời"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Câu trích dẫn - Dòng 2
              </label>
              <input
                type="text"
                value={formData.quoteLine2}
                onChange={(e) => handleChange("quoteLine2", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs text-gray-800 outline-hidden transition"
                placeholder="Yêu người vừa ý, cưới người mình thương"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Lời cảm ơn quý khách (Hộp quà & Chân trang)
              </label>
              <textarea
                rows={2}
                value={formData.thankYouMessage}
                onChange={(e) => handleChange("thankYouMessage", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs text-gray-800 outline-hidden transition"
                placeholder="Chân thành cảm ơn quý vị..."
              />
            </div>
          </div>
        </section>

        {/* Nút Lưu Cố định dưới chân trang */}
        <div className="flex items-center justify-end gap-3 pt-4 pb-8">
          <Link
            href="/admin"
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100 transition"
          >
            Quay Lại Bảng Điều Khiển
          </Link>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-md flex items-center gap-2 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang lưu vào Database...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu Toàn Bộ Thay Đổi Vào Database</span>
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
