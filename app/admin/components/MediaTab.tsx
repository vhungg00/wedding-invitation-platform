"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  Image as ImageIcon,
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
} from "lucide-react";
import { ImageWithFallback } from "@/app/components/ui/ImageWithFallback";
import { AppButton } from "@/app/components/ui/AppButton";

interface PhotoItem {
  src?: string;
  url?: string;
  alt?: string;
  aos?: string;
}

export default function MediaTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // State các ảnh
  const [groomAvatar, setGroomAvatar] = useState("/chu-re.JPG");
  const [brideAvatar, setBrideAvatar] = useState("/co-dau.JPG");
  const [heroBg, setHeroBg] = useState("/tach-nen.png");
  const [qrCodeNhaTrai, setQrCodeNhaTrai] = useState("/qr.jpeg");
  const [qrCodeNhaGai, setQrCodeNhaGai] = useState("/qr.jpeg");
  const [album, setAlbum] = useState<PhotoItem[]>([]);

  // Tải dữ liệu ảnh hiện tại từ API
  useEffect(() => {
    async function loadMediaData() {
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

          if (Array.isArray(d.album)) {
            setAlbum(d.album);
          }
        }
      } catch (err) {
        console.error("Lỗi tải thông tin ảnh:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMediaData();
  }, []);

  // Hàm helper lưu dữ liệu vào Database MongoDB & Local config
  const saveMediaData = async (payload: {
    groomAvatar: string;
    brideAvatar: string;
    heroBackground: string;
    qrCodeUrl: string;
    qrCodeNhaTrai: string;
    qrCodeNhaGai: string;
    album: PhotoItem[];
  }) => {
    try {
      const res = await fetch("/api/invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err: any) {
      console.error("Lỗi lưu Media:", err);
      return { success: false, message: err.message };
    }
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

        const fieldLabels: Record<string, string> = {
          groomAvatar: "ảnh chú rể",
          brideAvatar: "ảnh cô dâu",
          heroBg: "ảnh nền bìa",
          qrCodeNhaTrai: "mã QR Nhà Trai",
          qrCodeNhaGai: "mã QR Nhà Gái",
        };

        setStatusMessage({
          type: "success",
          text: `Đã tải ${fieldLabels[field] || field} lên (${json.provider === "cloudinary" ? "Cloudinary CDN" : "Bộ nhớ máy"}). Vui lòng bấm 'Lưu Thay Đổi' để ghi vào Database!`,
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
        setStatusMessage({
          type: "success",
          text: `Đã thêm ${newPhotos.length} ảnh vào Album xem trước. Vui lòng bấm 'Lưu Thay Đổi' để ghi vào Database!`,
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

  // Xóa ảnh khỏi album
  const handleDeleteAlbumPhoto = (index: number) => {
    if (confirm(`Bạn có chắc muốn xóa ảnh #${index + 1} khỏi album?`)) {
      setAlbum((prev) => prev.filter((_, idx) => idx !== index));
      setStatusMessage({
        type: "success",
        text: `Đã bỏ ảnh #${index + 1} khỏi danh sách. Vui lòng bấm 'Lưu Thay Đổi' để cập nhật Database!`,
      });
    }
  };

  // Lưu toàn bộ dữ liệu ảnh vào Database MongoDB & Local config
  const handleSaveAll = async () => {
    setSaving(true);
    setStatusMessage(null);

    try {
      const json = await saveMediaData({
        groomAvatar,
        brideAvatar,
        heroBackground: heroBg,
        qrCodeUrl: qrCodeNhaTrai,
        qrCodeNhaTrai,
        qrCodeNhaGai,
        album,
      });

      if (json.success && json.savedToDb !== false) {
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

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-rose-100 shadow-sm p-12 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        <span className="text-sm text-gray-500">Đang tải thông tin ảnh và album cưới...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Nút Lưu */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-rose-100 shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-rose-500" />
            <span>Quản Lý Ảnh & Album Cưới</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Hỗ trợ upload ảnh lên Cloudinary CDN, tự động fallback ảnh trong thư mục <code className="bg-rose-50 text-rose-600 px-1 py-0.5 rounded font-mono">public/</code> nếu có lỗi tải.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-white font-semibold text-xs sm:text-sm shadow-md shadow-rose-200 transition cursor-pointer disabled:opacity-50 shrink-0"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
        </button>
      </div>

      {/* Thông báo trạng thái */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm transition ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Phần 1: Ảnh chân dung Cô Dâu - Chú Rể & Nền bìa */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 px-1">
          <User className="w-4 h-4 text-rose-500" />
          <span>1. Ảnh Chân Dung & Nền Bìa</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Chú rể */}
          <div className="bg-white/95 rounded-2xl border border-rose-100 shadow-sm p-4 flex flex-col items-center text-center space-y-3">
            <div className="w-full flex items-center justify-between text-xs font-semibold text-gray-700 pb-2 border-b">
              <span>🤵 Chú Rể (Việt Hùng)</span>
              <span className="text-[11px] text-gray-400">Fallback: /chu-re.JPG</span>
            </div>

            <div className="w-28 h-36 relative rounded-xl overflow-hidden border-2 border-dashed border-rose-200 bg-gray-50 flex items-center justify-center group shadow-inner">
              <ImageWithFallback
                src={groomAvatar}
                fallbackSrc="/chu-re.JPG"
                alt="Avatar Chú Rể"
                fill
                className="object-contain"
              />
              {uploadingField === "groomAvatar" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>

            <label className="w-full">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingField === "groomAvatar"}
                onChange={(e) => handleSingleUpload(e, "groomAvatar")}
              />
              <div className="w-full py-1.5 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Đổi ảnh chú rể</span>
              </div>
            </label>
          </div>

          {/* Cô dâu */}
          <div className="bg-white/95 rounded-2xl border border-rose-100 shadow-sm p-4 flex flex-col items-center text-center space-y-3">
            <div className="w-full flex items-center justify-between text-xs font-semibold text-gray-700 pb-2 border-b">
              <span>👰 Cô Dâu (Xuân Ly)</span>
              <span className="text-[11px] text-gray-400">Fallback: /co-dau.JPG</span>
            </div>

            <div className="w-28 h-36 relative rounded-xl overflow-hidden border-2 border-dashed border-rose-200 bg-gray-50 flex items-center justify-center group shadow-inner">
              <ImageWithFallback
                src={brideAvatar}
                fallbackSrc="/co-dau.JPG"
                alt="Avatar Cô Dâu"
                fill
                className="object-contain"
              />
              {uploadingField === "brideAvatar" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>

            <label className="w-full">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingField === "brideAvatar"}
                onChange={(e) => handleSingleUpload(e, "brideAvatar")}
              />
              <div className="w-full py-1.5 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Đổi ảnh cô dâu</span>
              </div>
            </label>
          </div>

          {/* Nền bìa Hero */}
          <div className="bg-white/95 rounded-2xl border border-rose-100 shadow-sm p-4 flex flex-col items-center text-center space-y-3">
            <div className="w-full flex items-center justify-between text-xs font-semibold text-gray-700 pb-2 border-b">
              <span>🖼️ Ảnh Nền Bìa (Hero)</span>
              <span className="text-[11px] text-gray-400">Fallback: /tach-nen.png</span>
            </div>

            <div className="w-28 h-36 relative rounded-xl overflow-hidden border-2 border-dashed border-rose-200 bg-gray-50 flex items-center justify-center group shadow-inner">
              <ImageWithFallback
                src={heroBg}
                fallbackSrc="/tach-nen.png"
                alt="Hero Background"
                fill
                className="object-contain"
              />
              {uploadingField === "heroBg" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>

            <label className="w-full">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingField === "heroBg"}
                onChange={(e) => handleSingleUpload(e, "heroBg")}
              />
              <div className="w-full py-1.5 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Đổi ảnh nền bìa</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Phần 2: Mã QR Mừng Cưới (Nhà Trai & Nhà Gái riêng biệt) */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 px-1">
          <QrCode className="w-4 h-4 text-emerald-600" />
          <span>2. Mã QR Mừng Cưới (Nhà Trai & Nhà Gái)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mã QR Nhà Trai */}
          <div className="bg-white/95 rounded-2xl border border-rose-100 shadow-sm p-5 flex flex-col sm:flex-row items-center gap-5">
            <div className="w-32 h-32 relative rounded-xl overflow-hidden border-2 border-dashed border-rose-200 bg-gray-50 flex items-center justify-center group shadow-inner shrink-0">
              <ImageWithFallback
                src={qrCodeNhaTrai}
                fallbackSrc="/qr.jpeg"
                alt="Mã QR Nhà Trai"
                fill
                className="object-contain"
              />
              {uploadingField === "qrCodeNhaTrai" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-semibold">
                <span>🤵</span>
                <span>Mã QR Nhà Trai</span>
              </div>
              <h4 className="font-bold text-gray-800 text-sm">Tài khoản Chú rể Việt Hùng</h4>
              <p className="text-xs text-gray-500">
                Hiển thị khi khách quét mã hoặc chọn mừng phía Nhà Trai. Fallback: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">/qr.jpeg</code>.
              </p>

              <label className="inline-block mt-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingField === "qrCodeNhaTrai"}
                  onChange={(e) => handleSingleUpload(e, "qrCodeNhaTrai")}
                />
                <div className="py-2 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Đổi mã QR Nhà Trai</span>
                </div>
              </label>
            </div>
          </div>

          {/* Mã QR Nhà Gái */}
          <div className="bg-white/95 rounded-2xl border border-rose-100 shadow-sm p-5 flex flex-col sm:flex-row items-center gap-5">
            <div className="w-32 h-32 relative rounded-xl overflow-hidden border-2 border-dashed border-amber-200 bg-gray-50 flex items-center justify-center group shadow-inner shrink-0">
              <ImageWithFallback
                src={qrCodeNhaGai}
                fallbackSrc="/qr.jpeg"
                alt="Mã QR Nhà Gái"
                fill
                className="object-contain"
              />
              {uploadingField === "qrCodeNhaGai" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-semibold">
                <span>👰</span>
                <span>Mã QR Nhà Gái</span>
              </div>
              <h4 className="font-bold text-gray-800 text-sm">Tài khoản Cô dâu Xuân Ly</h4>
              <p className="text-xs text-gray-500">
                Hiển thị khi khách quét mã hoặc chọn mừng phía Nhà Gái. Fallback: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">/qr.jpeg</code>.
              </p>

              <label className="inline-block mt-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingField === "qrCodeNhaGai"}
                  onChange={(e) => handleSingleUpload(e, "qrCodeNhaGai")}
                />
                <div className="py-2 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Đổi mã QR Nhà Gái</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Phần 3: Album ảnh cưới */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-rose-100 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-500" />
              <span>3. Album Ảnh Cưới ({album.length} ảnh)</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Bạn có thể tải lên nhiều ảnh cùng một lúc. Khi link ảnh ngoài gặp sự cố, hệ thống sẽ tự động hiển thị ảnh dự phòng trong <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">public/album/</code>.
            </p>
          </div>

          <label className="shrink-0">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploadingField === "album"}
              onChange={handleMultipleAlbumUpload}
            />
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs sm:text-sm shadow-sm transition cursor-pointer">
              {uploadingField === "album" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>Tải thêm ảnh vào Album</span>
            </div>
          </label>
        </div>

        {album.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-500">Chưa có ảnh nào trong album tùy chỉnh.</p>
            <p className="text-xs text-gray-400 mt-1">Hệ thống đang tự động hiển thị 12 ảnh mặc định trong thư mục public/album.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {album.map((photo, index) => {
              const photoSrc = photo.url || photo.src || `/album/anh-${(index % 12) + 1}.JPG`;
              return (
                <div
                  key={index}
                  className="group relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-3/4 shadow-xs"
                >
                  <ImageWithFallback
                    src={photoSrc}
                    fallbackSrc={`/album/anh-${(index % 12) + 1}.JPG`}
                    alt={photo.alt || `Ảnh cưới ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Nút xóa ảnh */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteAlbumPhoto(index)}
                      className="p-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md transition cursor-pointer"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                    #{index + 1}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
