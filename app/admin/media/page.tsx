"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Image as ImageIcon,
  Upload,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  QrCode,
  User,
  Layers,
  ExternalLink,
  Eye,
  RefreshCw,
  X,
  Mail,
  Calendar,
} from "lucide-react";
import { ImageWithFallback } from "@/app/components/ui/ImageWithFallback";

interface PhotoItem {
  src?: string;
  url?: string;
  alt?: string;
  aos?: string;
}

interface InvitationImageItem {
  url: string;
  alt?: string;
}

export default function MediaStudioPage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState<{ src: string; title: string } | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // State các ảnh
  const [groomAvatar, setGroomAvatar] = useState("/chu-re.JPG");
  const [brideAvatar, setBrideAvatar] = useState("/co-dau.JPG");
  const [heroBg, setHeroBg] = useState("/tach-nen.png");
  const [qrCodeNhaTrai, setQrCodeNhaTrai] = useState("/qr.jpeg");
  const [qrCodeNhaGai, setQrCodeNhaGai] = useState("/qr.jpeg");
  const [invitationImages, setInvitationImages] = useState<InvitationImageItem[]>([
    { url: "/album/anh-phu-2.JPG", alt: "thu-moi-1" },
    { url: "/album/anh-phu.JPG", alt: "thu-moi-2" },
    { url: "/album/anhphu-3.JPG", alt: "thu-moi-3" },
  ]);
  const [album, setAlbum] = useState<PhotoItem[]>([]);

  // Kiểm tra quyền đăng nhập
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/check");
        const data = await res.json();
        if (data.authenticated) {
          setAuthChecking(false);
          loadMediaData();
        } else {
          router.replace("/admin/login");
        }
      } catch {
        router.replace("/admin/login");
      }
    };
    checkAuth();
  }, [router]);

  // Tải dữ liệu ảnh hiện tại từ API
  const loadMediaData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/invitation");
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (d.groom?.avatar) setGroomAvatar(d.groom.avatar);
        if (d.bride?.avatar) setBrideAvatar(d.bride.avatar);
        if (d.hero?.backgroundImage) setHeroBg(d.hero.backgroundImage);

        // QR Nhà Trai
        if (d.qrCodeNhaTrai) {
          setQrCodeNhaTrai(d.qrCodeNhaTrai);
        } else if (d.nhaTrai?.donation?.bankAccount?.qrCodeUrl) {
          setQrCodeNhaTrai(d.nhaTrai.donation.bankAccount.qrCodeUrl);
        } else if (d.donation?.bankAccounts?.[0]?.qrCodeUrl) {
          setQrCodeNhaTrai(d.donation.bankAccounts[0].qrCodeUrl);
        }

        // QR Nhà Gái
        if (d.qrCodeNhaGai) {
          setQrCodeNhaGai(d.qrCodeNhaGai);
        } else if (d.nhaGai?.donation?.bankAccount?.qrCodeUrl) {
          setQrCodeNhaGai(d.nhaGai.donation.bankAccount.qrCodeUrl);
        }

        // Bộ 3 Ảnh Thiệp Mời
        if (Array.isArray(d.invitationImages) && d.invitationImages.length > 0) {
          setInvitationImages(d.invitationImages);
        }

        if (Array.isArray(d.album)) {
          setAlbum(d.album);
        }
      }
    } catch (err) {
      console.error("Lỗi tải thông tin ảnh:", err);
    } finally {
      setLoading(false);
    }
  };

  // Upload 1 ảnh thiệp mời (invitationImages: index 0, 1, 2)
  const handleInvitationImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(`invitationImage_${index}`);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `wedding_invitation/invitation_images`);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.url) {
        setInvitationImages((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], url: json.url, alt: `thu-moi-${index + 1}` };
          return next;
        });
        setHasUnsavedChanges(true);
        setStatusMessage({
          type: "success",
          text: `Đã tải ảnh thiệp mời #${index + 1} lên xem trước. Vui lòng bấm 'Lưu Thay Đổi' để cập nhật Database!`,
        });
      } else {
        setStatusMessage({ type: "error", text: json.message || "Tải ảnh thất bại" });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "Lỗi kết nối upload: " + err.message });
    } finally {
      setUploadingField(null);
      e.target.value = "";
    }
  };

  // Khôi phục 1 ảnh thiệp mời về mặc định
  const handleResetInvitationImage = (index: number) => {
    const defaultUrls = ["/album/anh-phu-2.JPG", "/album/anh-phu.JPG", "/album/anhphu-3.JPG"];
    setInvitationImages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], url: defaultUrls[index] || "/album/anh-phu.JPG" };
      return next;
    });
    setHasUnsavedChanges(true);
    setStatusMessage({
      type: "success",
      text: `Đã đưa ảnh thiệp mời #${index + 1} về ảnh mặc định. Hãy bấm 'Lưu Thay Đổi' để cập nhật Database!`,
    });
  };

  // Upload 1 ảnh đơn lẻ (Avatar, Hero, QR Nhà Trai, QR Nhà Gái)
  const handleSingleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(field);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `wedding_invitation/${field}`);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.url) {
        if (field === "groomAvatar") setGroomAvatar(json.url);
        if (field === "brideAvatar") setBrideAvatar(json.url);
        if (field === "heroBg") setHeroBg(json.url);
        if (field === "qrCodeNhaTrai") setQrCodeNhaTrai(json.url);
        if (field === "qrCodeNhaGai") setQrCodeNhaGai(json.url);

        setHasUnsavedChanges(true);

        const fieldLabels: Record<string, string> = {
          groomAvatar: "ảnh chú rể",
          brideAvatar: "ảnh cô dâu",
          heroBg: "ảnh nền bìa",
          qrCodeNhaTrai: "mã QR Nhà Trai",
          qrCodeNhaGai: "mã QR Nhà Gái",
        };

        setStatusMessage({
          type: "success",
          text: `Đã tải ${fieldLabels[field] || field} lên xem trước (${json.provider === "cloudinary" ? "Cloudinary CDN" : "Bộ nhớ máy"}). Hãy bấm 'Lưu Thay Đổi' để ghi vào Database!`,
        });
      } else {
        setStatusMessage({ type: "error", text: json.message || "Tải ảnh thất bại" });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "Lỗi kết nối upload: " + err.message });
    } finally {
      setUploadingField(null);
      e.target.value = "";
    }
  };

  // Upload nhiều ảnh vào Album cưới
  const handleMultipleAlbumUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingField("album");
    setStatusMessage(null);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      formData.append("folder", "wedding_invitation/album");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success && Array.isArray(json.urls)) {
        const newPhotos: PhotoItem[] = json.urls.map((url: string, idx: number) => ({
          src: url,
          url: url,
          alt: `Ảnh cưới ${album.length + idx + 1}`,
          aos: idx % 2 === 0 ? "zoom-in" : "fade-up",
        }));

        setAlbum((prev) => [...prev, ...newPhotos]);
        setHasUnsavedChanges(true);
        setStatusMessage({
          type: "success",
          text: `Đã thêm ${newPhotos.length} ảnh vào Album xem trước. Hãy bấm 'Lưu Thay Đổi' để ghi vào Database!`,
        });
      } else {
        setStatusMessage({ type: "error", text: json.message || "Tải ảnh album thất bại" });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "Lỗi upload album: " + err.message });
    } finally {
      setUploadingField(null);
      e.target.value = "";
    }
  };

  // Xóa ảnh khỏi album (đồng thời xóa vĩnh viễn trên Cloudinary nếu là ảnh upload)
  const handleDeleteAlbumPhoto = async (index: number) => {
    const photo = album[index];
    const photoUrl = photo?.url || photo?.src;
    const isCloudinary = Boolean(photoUrl && photoUrl.includes("res.cloudinary.com"));
    const isUpload = Boolean(photoUrl && (photoUrl.startsWith("/uploads/") || isCloudinary));

    const confirmMsg = isCloudinary
      ? `Bạn có chắc muốn xóa ảnh #${index + 1}? Ảnh này sẽ được XÓA VĨNH VIỄN khỏi Cloudinary để giải phóng dung lượng!`
      : `Bạn có chắc muốn xóa ảnh #${index + 1} khỏi album?`;

    if (!confirm(confirmMsg)) return;

    try {
      if (isUpload && photoUrl) {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: photoUrl }),
        });
      }

      setAlbum((prev) => prev.filter((_, idx) => idx !== index));
      setHasUnsavedChanges(true);
      setStatusMessage({
        type: "success",
        text: `Đã xóa ảnh #${index + 1}${isCloudinary ? " vĩnh viễn khỏi Cloudinary" : ""}! Hãy bấm 'Lưu Thay Đổi' để cập nhật Database.`,
      });
    } catch (err: any) {
      console.error("Lỗi khi xóa ảnh:", err);
      setAlbum((prev) => prev.filter((_, idx) => idx !== index));
      setHasUnsavedChanges(true);
    }
  };

  // Khôi phục về 12 ảnh album mặc định
  const handleResetDefaultAlbum = () => {
    if (confirm("Bạn có muốn đặt lại album về 12 ảnh gốc mặc định trong thư mục public/album?")) {
      const defaultPhotos: PhotoItem[] = Array.from({ length: 12 }, (_, i) => ({
        src: `/album/anh-${i + 1}.JPG`,
        url: `/album/anh-${i + 1}.JPG`,
        alt: `Ảnh cưới ${i + 1}`,
        aos: i % 2 === 0 ? "zoom-in" : "fade-up",
      }));
      setAlbum(defaultPhotos);
      setHasUnsavedChanges(true);
      setStatusMessage({
        type: "success",
        text: "Đã đưa album về danh sách 12 ảnh mặc định. Hãy bấm 'Lưu Thay Đổi' để ghi vào Database!",
      });
    }
  };

  // Lưu toàn bộ dữ liệu ảnh vào Database MongoDB & Local config (CHỈ KHI ẤN NÚT NÀY)
  const handleSaveAll = async () => {
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groomAvatar,
          brideAvatar,
          heroBackground: heroBg,
          qrCodeUrl: qrCodeNhaTrai,
          qrCodeNhaTrai,
          qrCodeNhaGai,
          invitationImages,
          album,
        }),
      });

      const json = await res.json();
      if (json.success && json.savedToDb !== false) {
        setHasUnsavedChanges(false);
        setStatusMessage({
          type: "success",
          text: "✨ Đã lưu tất cả ảnh và mã QR (Nhà Trai & Nhà Gái) vào Database MongoDB thành công!",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: json.message || "Lưu vào Database thất bại, vui lòng thử lại!",
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: "Không thể kết nối đến máy chủ: " + err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (authChecking || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-white to-amber-50/50 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
        <span className="text-sm font-semibold text-gray-600">Đang tải Studio Quản Lý Ảnh Cưới...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/40 via-amber-50/20 to-white pb-28">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-rose-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-gray-100 hover:bg-rose-50 text-gray-600 hover:text-rose-600 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Quay lại trang quản trị"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Bảng Điều Khiển</span>
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-xs">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h1 className="text-base sm:text-lg font-bold text-gray-800">
                  Studio Quản Lý Ảnh & Mã QR
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Cloudinary CDN
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 hidden sm:block">
                Tải ảnh lên lưu trữ đám mây & Database MongoDB. Tự động dự phòng ảnh tĩnh trong <code className="font-mono text-rose-600 bg-rose-50 px-1 py-0.5 rounded">public/</code>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Link xem trước web */}
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/"
                target="_blank"
                className="px-3 py-2 rounded-xl bg-gray-50 hover:bg-rose-50 text-gray-600 hover:text-rose-600 border border-gray-200 text-xs font-medium flex items-center gap-1 transition"
              >
                <span>Thiệp Nhà Trai</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <Link
                href="/nha-gai"
                target="_blank"
                className="px-3 py-2 rounded-xl bg-gray-50 hover:bg-amber-50 text-gray-600 hover:text-amber-700 border border-gray-200 text-xs font-medium flex items-center gap-1 transition"
              >
                <span>Thiệp Nhà Gái</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <Link
                href="/admin/info"
                className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Sửa Giờ, Ngày & Địa Chỉ</span>
              </Link>
            </div>

            {/* Nút Lưu Thay Đổi - CHÍNH */}
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                hasUnsavedChanges
                  ? "bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 hover:opacity-95 text-white shadow-rose-200 animate-pulse"
                  : "bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-white shadow-rose-200"
              }`}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? "Đang lưu vào Database..." : "Lưu Thay Đổi"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Banner thông báo trạng thái */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 text-sm shadow-xs transition ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                : "bg-rose-50 text-rose-900 border border-rose-200"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="flex-1 font-medium">{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* NHÓM 1: ẢNH CHÂN DUNG CÔ DÂU - CHÚ RỂ & NỀN BÌA HERO */}
        <section className="bg-white/95 backdrop-blur-md rounded-3xl border border-rose-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-rose-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                <User className="w-5 h-5 text-rose-500" />
                <span>1. Ảnh Đại Diện & Nền Bìa Chính</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Hiển thị ở phần giới thiệu đầu trang và thông tin thiệp cưới.
              </p>
            </div>
            <span className="text-xs text-gray-400 italic">Fallback: /chu-re.JPG, /co-dau.JPG, /tach-nen.png</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Chú rể */}
            <div className="rounded-2xl border border-gray-200/80 bg-gradient-to-b from-rose-50/30 to-white p-5 flex flex-col items-center text-center space-y-4 hover:border-rose-300 transition shadow-xs group">
              <div className="w-full flex items-center justify-between pb-2 border-b text-xs font-bold text-gray-700">
                <span className="flex items-center gap-1.5">
                  <span>🤵</span>
                  <span>Chú Rể (Việt Hùng)</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">3:4</span>
              </div>

              <div className="w-40 h-52 relative rounded-2xl overflow-hidden border-2 border-dashed border-rose-200 bg-gray-50 flex items-center justify-center shadow-inner group">
                <ImageWithFallback
                  src={groomAvatar}
                  fallbackSrc="/chu-re.JPG"
                  alt="Ảnh Chú Rể"
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />

                {uploadingField === "groomAvatar" && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 text-white text-xs">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                    <span>Đang tải lên...</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setPreviewModalImg({ src: groomAvatar, title: "Ảnh Chú Rể Việt Hùng" })}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer"
                  title="Xem to ảnh"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-full space-y-2">
                <label className="w-full block">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingField === "groomAvatar"}
                    onChange={(e) => handleSingleUpload(e, "groomAvatar")}
                  />
                  <div className="w-full py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Đổi Ảnh Chú Rể</span>
                  </div>
                </label>

                {groomAvatar !== "/chu-re.JPG" && (
                  <button
                    type="button"
                    onClick={() => {
                      setGroomAvatar("/chu-re.JPG");
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full py-1.5 text-[11px] text-gray-500 hover:text-rose-600 font-medium transition cursor-pointer"
                  >
                    Khôi phục ảnh gốc (/chu-re.JPG)
                  </button>
                )}
              </div>
            </div>

            {/* Cô dâu */}
            <div className="rounded-2xl border border-gray-200/80 bg-gradient-to-b from-rose-50/30 to-white p-5 flex flex-col items-center text-center space-y-4 hover:border-rose-300 transition shadow-xs group">
              <div className="w-full flex items-center justify-between pb-2 border-b text-xs font-bold text-gray-700">
                <span className="flex items-center gap-1.5">
                  <span>👰</span>
                  <span>Cô Dâu (Xuân Ly)</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">3:4</span>
              </div>

              <div className="w-40 h-52 relative rounded-2xl overflow-hidden border-2 border-dashed border-rose-200 bg-gray-50 flex items-center justify-center shadow-inner group">
                <ImageWithFallback
                  src={brideAvatar}
                  fallbackSrc="/co-dau.JPG"
                  alt="Ảnh Cô Dâu"
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />

                {uploadingField === "brideAvatar" && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 text-white text-xs">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                    <span>Đang tải lên...</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setPreviewModalImg({ src: brideAvatar, title: "Ảnh Cô Dâu Xuân Ly" })}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer"
                  title="Xem to ảnh"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-full space-y-2">
                <label className="w-full block">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingField === "brideAvatar"}
                    onChange={(e) => handleSingleUpload(e, "brideAvatar")}
                  />
                  <div className="w-full py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Đổi Ảnh Cô Dâu</span>
                  </div>
                </label>

                {brideAvatar !== "/co-dau.JPG" && (
                  <button
                    type="button"
                    onClick={() => {
                      setBrideAvatar("/co-dau.JPG");
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full py-1.5 text-[11px] text-gray-500 hover:text-rose-600 font-medium transition cursor-pointer"
                  >
                    Khôi phục ảnh gốc (/co-dau.JPG)
                  </button>
                )}
              </div>
            </div>

            {/* Nền bìa Hero */}
            <div className="rounded-2xl border border-gray-200/80 bg-gradient-to-b from-amber-50/30 to-white p-5 flex flex-col items-center text-center space-y-4 hover:border-amber-300 transition shadow-xs group">
              <div className="w-full flex items-center justify-between pb-2 border-b text-xs font-bold text-gray-700">
                <span className="flex items-center gap-1.5">
                  <span>🖼️</span>
                  <span>Ảnh Nền Bìa (Hero)</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Tách nền</span>
              </div>

              <div className="w-full h-52 relative rounded-2xl overflow-hidden border-2 border-dashed border-amber-200 bg-gray-50 flex items-center justify-center shadow-inner group">
                <ImageWithFallback
                  src={heroBg}
                  fallbackSrc="/tach-nen.png"
                  alt="Hero Background"
                  fill
                  className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                />

                {uploadingField === "heroBg" && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 text-white text-xs">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                    <span>Đang tải lên...</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setPreviewModalImg({ src: heroBg, title: "Ảnh Bìa Hero Chính" })}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer"
                  title="Xem to ảnh"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-full space-y-2">
                <label className="w-full block">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingField === "heroBg"}
                    onChange={(e) => handleSingleUpload(e, "heroBg")}
                  />
                  <div className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Đổi Ảnh Nền Bìa</span>
                  </div>
                </label>

                {heroBg !== "/tach-nen.png" && (
                  <button
                    type="button"
                    onClick={() => {
                      setHeroBg("/tach-nen.png");
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full py-1.5 text-[11px] text-gray-500 hover:text-amber-700 font-medium transition cursor-pointer"
                  >
                    Khôi phục ảnh gốc (/tach-nen.png)
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* NHÓM 2: BỘ 3 ẢNH THIỆP MỜI CƯỚI (invitationImages) */}
        <section className="bg-white/95 backdrop-blur-md rounded-3xl border border-rose-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-rose-100">
            <div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-rose-500" />
                <h2 className="text-base sm:text-lg font-bold text-gray-800">
                  2. Bộ 3 Ảnh Thiệp Mời Cưới (Thư Mời Tham Dự)
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Hiển thị trong mục &ldquo;TRÂN TRỌNG KÍNH MỜI / THAM DỰ LỄ CƯỚI&rdquo; trên trang chủ Nhà Trai và trang Nhà Gái.
              </p>
            </div>
            <span className="text-xs text-gray-400 italic">
              Fallback: /album/anh-phu-2.JPG, /album/anh-phu.JPG, /album/anhphu-3.JPG
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* Ảnh 1 - Trái */}
            <div className="rounded-2xl border border-gray-200/80 bg-gradient-to-b from-rose-50/20 to-white p-5 flex flex-col items-center text-center space-y-4 hover:border-rose-300 transition shadow-xs group">
              <div className="w-full flex items-center justify-between pb-2 border-b text-xs font-bold text-gray-700">
                <span>💌 Ảnh Thiệp 1 (Bên Trái)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">Đứng</span>
              </div>

              <div className="w-36 h-56 relative rounded-2xl overflow-hidden border-2 border-dashed border-rose-200 bg-gray-50 flex items-center justify-center shadow-inner group">
                <ImageWithFallback
                  src={invitationImages[0]?.url || "/album/anh-phu-2.JPG"}
                  fallbackSrc="/album/anh-phu-2.JPG"
                  alt="Ảnh Thiệp 1"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {uploadingField === "invitationImage_0" && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 text-white text-xs">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                    <span>Đang tải lên...</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setPreviewModalImg({ src: invitationImages[0]?.url || "/album/anh-phu-2.JPG", title: "Ảnh Thiệp Mời 1 (Bên Trái)" })}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer"
                  title="Xem to ảnh"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-full space-y-2">
                <label className="w-full block">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingField === "invitationImage_0"}
                    onChange={(e) => handleInvitationImageUpload(e, 0)}
                  />
                  <div className="w-full py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Đổi Ảnh Thiệp 1</span>
                  </div>
                </label>

                {invitationImages[0]?.url !== "/album/anh-phu-2.JPG" && (
                  <button
                    type="button"
                    onClick={() => handleResetInvitationImage(0)}
                    className="w-full py-1.5 text-[11px] text-gray-500 hover:text-rose-600 font-medium transition cursor-pointer"
                  >
                    Khôi phục ảnh gốc
                  </button>
                )}
              </div>
            </div>

            {/* Ảnh 2 - Giữa (Nổi bật hơn) */}
            <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50/40 via-white to-rose-50/20 p-5 flex flex-col items-center text-center space-y-4 shadow-md group relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                ⭐ Ảnh Chính Giữa
              </div>

              <div className="w-full flex items-center justify-between pb-2 border-b text-xs font-bold text-gray-700">
                <span>💌 Ảnh Thiệp 2 (Ở Giữa)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">To & Cao</span>
              </div>

              <div className="w-40 h-64 relative rounded-2xl overflow-hidden border-2 border-dashed border-amber-300 bg-gray-50 flex items-center justify-center shadow-inner group">
                <ImageWithFallback
                  src={invitationImages[1]?.url || "/album/anh-phu.JPG"}
                  fallbackSrc="/album/anh-phu.JPG"
                  alt="Ảnh Thiệp 2"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {uploadingField === "invitationImage_1" && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 text-white text-xs">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                    <span>Đang tải lên...</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setPreviewModalImg({ src: invitationImages[1]?.url || "/album/anh-phu.JPG", title: "Ảnh Thiệp Mời 2 (Ở Giữa - Chính)" })}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer"
                  title="Xem to ảnh"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-full space-y-2">
                <label className="w-full block">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingField === "invitationImage_1"}
                    onChange={(e) => handleInvitationImageUpload(e, 1)}
                  />
                  <div className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Đổi Ảnh Thiệp Giữa</span>
                  </div>
                </label>

                {invitationImages[1]?.url !== "/album/anh-phu.JPG" && (
                  <button
                    type="button"
                    onClick={() => handleResetInvitationImage(1)}
                    className="w-full py-1.5 text-[11px] text-gray-500 hover:text-amber-700 font-medium transition cursor-pointer"
                  >
                    Khôi phục ảnh gốc
                  </button>
                )}
              </div>
            </div>

            {/* Ảnh 3 - Phải */}
            <div className="rounded-2xl border border-gray-200/80 bg-gradient-to-b from-rose-50/20 to-white p-5 flex flex-col items-center text-center space-y-4 hover:border-rose-300 transition shadow-xs group">
              <div className="w-full flex items-center justify-between pb-2 border-b text-xs font-bold text-gray-700">
                <span>💌 Ảnh Thiệp 3 (Bên Phải)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">Đứng</span>
              </div>

              <div className="w-36 h-56 relative rounded-2xl overflow-hidden border-2 border-dashed border-rose-200 bg-gray-50 flex items-center justify-center shadow-inner group">
                <ImageWithFallback
                  src={invitationImages[2]?.url || "/album/anhphu-3.JPG"}
                  fallbackSrc="/album/anhphu-3.JPG"
                  alt="Ảnh Thiệp 3"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {uploadingField === "invitationImage_2" && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 text-white text-xs">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                    <span>Đang tải lên...</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setPreviewModalImg({ src: invitationImages[2]?.url || "/album/anhphu-3.JPG", title: "Ảnh Thiệp Mời 3 (Bên Phải)" })}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer"
                  title="Xem to ảnh"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-full space-y-2">
                <label className="w-full block">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingField === "invitationImage_2"}
                    onChange={(e) => handleInvitationImageUpload(e, 2)}
                  />
                  <div className="w-full py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Đổi Ảnh Thiệp 3</span>
                  </div>
                </label>

                {invitationImages[2]?.url !== "/album/anhphu-3.JPG" && (
                  <button
                    type="button"
                    onClick={() => handleResetInvitationImage(2)}
                    className="w-full py-1.5 text-[11px] text-gray-500 hover:text-rose-600 font-medium transition cursor-pointer"
                  >
                    Khôi phục ảnh gốc
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* NHÓM 3: MÃ QR MỪNG CƯỚI - NHÀ TRAI & NHÀ GÁI */}
        <section className="bg-white/95 backdrop-blur-md rounded-3xl border border-rose-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-rose-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600" />
                <span>3. Mã QR Mừng Cưới (Tách Biệt Nhà Trai & Nhà Gái)</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Hiển thị trong mục &ldquo;Hộp Mừng Cưới&rdquo; khi khách mời chuyển đổi tab Nhà Trai hoặc Nhà Gái.
              </p>
            </div>
            <span className="text-xs text-gray-400 italic">Fallback mặc định: /qr.jpeg</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mã QR Nhà Trai */}
            <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/50 via-white to-rose-50/20 p-6 flex flex-col sm:flex-row items-center gap-6 shadow-xs hover:shadow-md transition">
              <div className="w-40 h-40 relative rounded-2xl overflow-hidden border-2 border-dashed border-rose-300 bg-white p-2 flex items-center justify-center shadow-inner shrink-0 group">
                <ImageWithFallback
                  src={qrCodeNhaTrai}
                  fallbackSrc="/qr.jpeg"
                  alt="Mã QR Nhà Trai"
                  fill
                  className="object-contain p-2"
                />

                {uploadingField === "qrCodeNhaTrai" && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 text-white text-xs">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                    <span>Đang tải lên...</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setPreviewModalImg({ src: qrCodeNhaTrai, title: "Mã QR Nhà Trai (Chú rể Việt Hùng)" })}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer"
                  title="Xem to mã QR"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 min-w-0 space-y-3 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                  <span>🤵</span>
                  <span>MÃ QR NHÀ TRAI</span>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 text-base">Tài Khoản Chú Rể Việt Hùng</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Khách mời chọn mừng phía Nhà Trai sẽ quét mã này để gửi tiền mừng trực tiếp.
                  </p>
                </div>

                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <label className="inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingField === "qrCodeNhaTrai"}
                      onChange={(e) => handleSingleUpload(e, "qrCodeNhaTrai")}
                    />
                    <div className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Đổi Mã QR Nhà Trai</span>
                    </div>
                  </label>

                  {qrCodeNhaTrai !== "/qr.jpeg" && (
                    <button
                      type="button"
                      onClick={() => {
                        setQrCodeNhaTrai("/qr.jpeg");
                        setHasUnsavedChanges(true);
                      }}
                      className="py-2 px-3 rounded-xl border border-gray-200 text-gray-600 hover:text-rose-600 text-xs font-medium transition cursor-pointer"
                    >
                      Dùng /qr.jpeg
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Mã QR Nhà Gái */}
            <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20 p-6 flex flex-col sm:flex-row items-center gap-6 shadow-xs hover:shadow-md transition">
              <div className="w-40 h-40 relative rounded-2xl overflow-hidden border-2 border-dashed border-amber-300 bg-white p-2 flex items-center justify-center shadow-inner shrink-0 group">
                <ImageWithFallback
                  src={qrCodeNhaGai}
                  fallbackSrc="/qr.jpeg"
                  alt="Mã QR Nhà Gái"
                  fill
                  className="object-contain p-2"
                />

                {uploadingField === "qrCodeNhaGai" && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 text-white text-xs">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                    <span>Đang tải lên...</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setPreviewModalImg({ src: qrCodeNhaGai, title: "Mã QR Nhà Gái (Cô dâu Xuân Ly)" })}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer"
                  title="Xem to mã QR"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 min-w-0 space-y-3 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  <span>👰</span>
                  <span>MÃ QR NHÀ GÁI</span>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 text-base">Tài Khoản Cô Dâu Xuân Ly</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Khách mời chọn mừng phía Nhà Gái sẽ quét mã này để gửi tiền mừng trực tiếp.
                  </p>
                </div>

                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <label className="inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingField === "qrCodeNhaGai"}
                      onChange={(e) => handleSingleUpload(e, "qrCodeNhaGai")}
                    />
                    <div className="py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Đổi Mã QR Nhà Gái</span>
                    </div>
                  </label>

                  {qrCodeNhaGai !== "/qr.jpeg" && (
                    <button
                      type="button"
                      onClick={() => {
                        setQrCodeNhaGai("/qr.jpeg");
                        setHasUnsavedChanges(true);
                      }}
                      className="py-2 px-3 rounded-xl border border-gray-200 text-gray-600 hover:text-amber-700 text-xs font-medium transition cursor-pointer"
                    >
                      Dùng /qr.jpeg
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NHÓM 3: STUDIO ALBUM ẢNH CƯỚI */}
        <section className="bg-white/95 backdrop-blur-md rounded-3xl border border-rose-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-rose-100">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-rose-500" />
                <h2 className="text-base sm:text-lg font-bold text-gray-800">
                  3. Album Ảnh Cưới Cao Cấp
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                  {album.length} ảnh
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Kéo chọn nhiều ảnh cùng lúc để tải lên Cloudinary. Tự động hiển thị fallback nếu link ảnh ngoài gặp sự cố.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleResetDefaultAlbum}
                className="px-3.5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>12 Ảnh Gốc</span>
              </button>

              <label className="flex-1 sm:flex-none">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploadingField === "album"}
                  onChange={handleMultipleAlbumUpload}
                />
                <div className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-200 flex items-center justify-center gap-2 transition cursor-pointer">
                  {uploadingField === "album" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{uploadingField === "album" ? "Đang tải ảnh..." : "Tải Thêm Nhiều Ảnh"}</span>
                </div>
              </label>
            </div>
          </div>

          {/* Grid hiển thị Album ảnh */}
          {album.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 space-y-2">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto" />
              <h4 className="text-sm font-bold text-gray-600">Chưa có ảnh nào trong album tùy chỉnh</h4>
              <p className="text-xs text-gray-400">
                Hệ thống đang hiển thị 12 ảnh mặc định trong thư mục public/album. Bạn có thể bấm nút &apos;Tải Thêm Nhiều Ảnh&apos; ở trên để bắt đầu thêm ảnh cưới của bạn.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {album.map((photo, index) => {
                const photoSrc = photo.url || photo.src || `/album/anh-${(index % 12) + 1}.JPG`;
                return (
                  <div
                    key={index}
                    className="group relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 aspect-3/4 shadow-xs hover:shadow-lg transition-all duration-300"
                  >
                    <ImageWithFallback
                      src={photoSrc}
                      fallbackSrc={`/album/anh-${(index % 12) + 1}.JPG`}
                      alt={photo.alt || `Ảnh cưới ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Gradient Overlay khi hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white bg-black/40 px-2 py-0.5 rounded-md">
                          #{index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDeleteAlbumPhoto(index)}
                          className="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-700 text-white shadow-xs transition cursor-pointer"
                          title="Xóa ảnh này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setPreviewModalImg({ src: photoSrc, title: `Ảnh cưới #${index + 1}` })}
                        className="w-full py-1.5 rounded-lg bg-white/20 backdrop-blur-md hover:bg-white/30 text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem chi tiết</span>
                      </button>
                    </div>

                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md group-hover:opacity-0 transition-opacity">
                      #{index + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Floating Sticky Save Bar khi có thay đổi chưa lưu */}
      {hasUnsavedChanges && (
        <aside aria-label="Thanh lưu thay đổi" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-2xl bg-gray-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-amber-300">Bạn có ảnh vừa tải lên xem trước!</span>
              <p className="text-[11px] text-gray-300 hidden sm:block">Đừng quên bấm lưu để ghi dữ liệu vĩnh viễn vào MongoDB.</p>
            </div>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Đang lưu..." : "Lưu Vào Database"}</span>
          </button>
        </aside>
      )}

      {/* Modal phóng to xem ảnh (Zoom Modal) */}
      {previewModalImg && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-modal-title"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewModalImg(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-gray-950 rounded-3xl overflow-hidden p-3 shadow-2xl border border-white/10 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between px-3 py-2 text-white">
              <h3 id="preview-modal-title" className="text-sm font-bold truncate">{previewModalImg.title}</h3>
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-full h-[65vh] sm:h-[75vh] flex items-center justify-center rounded-2xl overflow-hidden bg-black/40">
              <ImageWithFallback
                src={previewModalImg.src}
                fallbackSrc="/tach-nen.png"
                alt={previewModalImg.title}
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
