"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Maximize2,
  Minimize2,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Heart,
  QrCode,
  Columns2,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";
import defaultWeddingData from "@/data/wedding-data.json";
import { triggerCelebration } from "../utils/celebration";

interface WishItem {
  id: string;
  name: string;
  relationship: string | null;
  content: string;
  hearts: number;
  createdAt: string;
}

const DEFAULT_PHOTOS = [
  "/album/anh-chinh.JPG",
  "/album/anh-cuoi.JPG",
  "/album/anh-phu-2.JPG",
  "/album/anh-phu.JPG",
  "/album/anhphu-3.JPG",
  "/album/anhphu-4.JPG",
  "/album/anhphu-5.JPG",
  "/album/anhphu-6.JPG",
  "/chu-re.JPG",
  "/co-dau.JPG",
];

const FALLBACK_WISHES: WishItem[] = [
  {
    id: "tv-fallback-1",
    name: "Gia đình hai bên",
    relationship: "Người thân",
    content: "Chúc hai con trăm năm tình viên mãn, bạc đầu nghĩa phu thê!",
    hearts: 99,
    createdAt: new Date().toISOString(),
  },
  {
    id: "tv-fallback-2",
    name: "Hội bạn thân",
    relationship: "Bạn chung",
    content: "Chúc Việt Hùng & Xuân Ly mãi hạnh phúc, sớm đón thiên thần nhỏ nhé! 💖",
    hearts: 68,
    createdAt: new Date().toISOString(),
  },
];

export default function TvSlideshowPage() {
  const [weddingData, setWeddingData] = useState<any>(defaultWeddingData);
  const [side, setSide] = useState<"nha-trai" | "nha-gai">("nha-trai");
  const [layoutMode, setLayoutMode] = useState<"dual" | "single">("dual");
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showQrBox, setShowQrBox] = useState(true);

  // Lời chúc trực tiếp (Live Wishes)
  const [wishes, setWishes] = useState<WishItem[]>(FALLBACK_WISHES);
  const [wishIndex, setWishIndex] = useState(0);
  const [newWishAlert, setNewWishAlert] = useState<WishItem | null>(null);
  const knownWishIdsRef = useRef<Set<string>>(new Set());

  // Lấy dữ liệu thiệp & danh sách ảnh
  useEffect(() => {
    fetch("/api/invitation")
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) {
          setWeddingData((prev: any) => ({ ...prev, ...json.data }));
        }
      })
      .catch(() => {});
  }, []);

  const photos: string[] = React.useMemo(() => {
    const albumList = Array.isArray(weddingData?.album)
      ? weddingData.album.map((item: any) => (typeof item === "string" ? item : item?.src)).filter(Boolean)
      : [];
    const merged = Array.from(new Set([...albumList, ...DEFAULT_PHOTOS]));
    return merged.length > 0 ? merged : DEFAULT_PHOTOS;
  }, [weddingData]);

  // Chuyển ảnh tự động mỗi 6.5 giây
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => {
      const step = layoutMode === "dual" ? 2 : 1;
      return (prev + step) % photos.length;
    });
  }, [layoutMode, photos.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => {
      const step = layoutMode === "dual" ? 2 : 1;
      return (prev - step + photos.length) % photos.length;
    });
  }, [layoutMode, photos.length]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(nextSlide, 6500);
    return () => clearInterval(timer);
  }, [isPlaying, nextSlide]);

  // Bắn pháo hoa định kỳ mỗi 25 giây để màn hình Tivi luôn rực rỡ
  useEffect(() => {
    if (!isPlaying) return;
    const fireworkTimer = setInterval(() => {
      triggerCelebration({ x: 0.5, y: 0.5 });
    }, 25000);
    return () => clearInterval(fireworkTimer);
  }, [isPlaying]);

  // Tự động cập nhật lời chúc mới mỗi 8 giây (Realtime Polling)
  useEffect(() => {
    const fetchWishes = async () => {
      try {
        const res = await fetch("/api/wishes?fetchAll=true");
        const json = await res.json();
        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
          const incoming: WishItem[] = json.data;

          // Kiểm tra xem có lời chúc mới tinh vừa được khách gửi không
          if (knownWishIdsRef.current.size > 0) {
            const brandNew = incoming.find((w) => !knownWishIdsRef.current.has(w.id));
            if (brandNew) {
              setNewWishAlert(brandNew);
              triggerCelebration({ x: 0.5, y: 0.4 });
              setTimeout(() => setNewWishAlert(null), 8000);
            }
          }

          incoming.forEach((w) => knownWishIdsRef.current.add(w.id));
          setWishes(incoming);
        }
      } catch {}
    };

    fetchWishes();
    const pollTimer = setInterval(fetchWishes, 8000);
    return () => clearInterval(pollTimer);
  }, []);

  // Xoay vòng lời chúc ở thanh dưới mỗi 6 giây
  useEffect(() => {
    if (wishes.length <= 1) return;
    const timer = setInterval(() => {
      setWishIndex((prev) => (prev + 1) % wishes.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [wishes.length]);

  // Ẩn thanh điều khiển khi chuột đứng yên sau 4 giây
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 4000);
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === " ") setIsPlaying((p) => !p);
    });
    timeout = setTimeout(() => setShowControls(false), 4000);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      clearTimeout(timeout);
    };
  }, [nextSlide, prevSlide]);

  // Bật / Tắt toàn màn hình (Fullscreen cho Tivi)
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const primaryPhoto = photos[currentIndex % photos.length];
  const secondaryPhoto = photos[(currentIndex + 1) % photos.length];
  const activeWish = newWishAlert || wishes[wishIndex % wishes.length] || FALLBACK_WISHES[0];

  const isNhaGai = side === "nha-gai";
  const eventTitle = isNhaGai ? "LỄ VU QUY" : "LỄ THÀNH HÔN";
  const coupleDisplay = isNhaGai ? "Xuân Ly  &  Việt Hùng" : "Việt Hùng  &  Khánh Ly";
  const dateDisplay = isNhaGai ? "THỨ BẢY • 05 . 12 . 2026" : "CHỦ NHẬT • 06 . 12 . 2026";
  const lunarDisplay = isNhaGai
    ? "Tức ngày 27 tháng 10 năm Bính Ngọ"
    : "Tức ngày 28 tháng 10 năm Bính Ngọ";

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://damcuoihungly.vercel.app";
  const qrTargetUrl = isNhaGai ? `${origin}/nha-gai` : origin;

  return (
    <div className="fixed inset-0 z-30 bg-[#0d090a] text-white overflow-hidden select-none">
      {/* 1. Lớp nền mờ nghệ thuật tràn màn hình 16:9 (Xóa hoàn toàn viền đen trên Tivi 43 inch) */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          key={`bg-${primaryPhoto}`}
          src={primaryPhoto}
          alt="Background Blur"
          className="w-full h-full object-cover scale-110 blur-2xl opacity-45 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/85" />
      </div>

      {/* 2. Viền khung Vàng Kim Sang Trọng (Luxury Wedding Frame) */}
      <div className="absolute inset-4 sm:inset-6 border border-amber-300/35 rounded-3xl pointer-events-none z-20" />
      <div className="absolute inset-6 sm:inset-8 border border-amber-200/15 rounded-2xl pointer-events-none z-20" />

      {/* 3. Header: Tên Lễ Cưới & Cô Dâu Chú Rể */}
      <header className="relative z-20 pt-7 sm:pt-9 px-8 sm:px-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-300/40 text-amber-200 text-xs sm:text-sm font-bold tracking-[0.25em] uppercase">
            ✨ {eventTitle}
          </span>
          <span className="hidden md:inline-block text-xs sm:text-sm text-amber-100/80 font-medium tracking-wider">
            {dateDisplay} ({lunarDisplay})
          </span>
        </div>

        <div className="text-right">
          <h1 className="font-imperial-script text-3xl sm:text-5xl lg:text-6xl text-amber-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            {coupleDisplay}
          </h1>
        </div>
      </header>

      {/* 4. Khu vực trình chiếu ảnh cưới trung tâm (Chuẩn Tivi 43 inch 16:9) */}
      <main className="relative z-10 h-[calc(100vh-195px)] px-8 sm:px-14 py-4 flex items-center justify-center gap-6 lg:gap-10">
        {layoutMode === "dual" ? (
          /* Chế độ 2 ảnh dọc sóng đôi (Cực hợp với Tivi màn hình ngang) */
          <div className="w-full h-full max-w-6xl flex items-center justify-center gap-6 lg:gap-10">
            {[primaryPhoto, secondaryPhoto].map((src, idx) => (
              <div
                key={`${src}-${idx}`}
                className="relative h-full flex-1 max-w-[44%] rounded-2xl overflow-hidden border-2 border-amber-200/40 shadow-[0_20px_50px_rgba(0,0,0,0.75)] bg-black/40 group animate-fade-in"
              >
                <img
                  src={src}
                  alt="Wedding Slide"
                  className="w-full h-full object-cover object-top transition-transform duration-[6500ms] ease-out scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
              </div>
            ))}
          </div>
        ) : (
          /* Chế độ 1 ảnh lớn ở giữa */
          <div
            key={primaryPhoto}
            className="relative h-full w-full max-w-4xl rounded-2xl overflow-hidden border-2 border-amber-200/40 shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-black/40 flex items-center justify-center animate-fade-in"
          >
            <img
              src={primaryPhoto}
              alt="Wedding Slide"
              className="w-full h-full object-contain transition-transform duration-[6500ms] ease-out scale-105"
            />
          </div>
        )}

        {/* Khung QR tương tác ở góc phải màn hình Tivi */}
        {showQrBox && (
          <div className="hidden xl:flex flex-col items-center justify-center bg-white/95 text-gray-900 p-4 rounded-2xl border-2 border-amber-300 shadow-2xl w-52 shrink-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quét Mã Mở Thiệp</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-rose-100">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=1&color=881337&data=${encodeURIComponent(
                  qrTargetUrl
                )}`}
                alt="QR Thiệp Cưới"
                className="w-36 h-36 object-contain"
              />
            </div>
            <p className="mt-2 text-[11px] text-center text-gray-600 leading-snug font-medium">
              Quét mã bằng Zalo/Camera để xem thiệp &amp; <strong>gửi lời chúc lên Tivi</strong>!
            </p>
          </div>
        )}
      </main>

      {/* 5. Thanh Lời Chúc Trực Tiếp (Live Wishes Ticker) dưới đáy màn hình Tivi */}
      <footer className="relative z-20 px-8 sm:px-14 pb-6 flex items-center justify-between gap-4">
        <div
          key={activeWish.id}
          className={`flex-1 max-w-4xl backdrop-blur-md rounded-2xl px-5 py-3 border transition-all animate-fade-in flex items-center gap-3.5 shadow-xl ${
            newWishAlert
              ? "bg-rose-900/85 border-amber-300 ring-2 ring-amber-300/50"
              : "bg-white/12 border-amber-200/30"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-lg shrink-0 shadow-md">
            💌
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {newWishAlert && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-extrabold uppercase tracking-wider animate-pulse">
                  Lời chúc mới!
                </span>
              )}
              <span className="font-bold text-amber-200 text-sm sm:text-base truncate">
                {activeWish.name}
              </span>
              {activeWish.relationship && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/15 text-amber-100">
                  {activeWish.relationship}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-white/95 italic truncate mt-0.5">
              &ldquo;{activeWish.content}&rdquo;
            </p>
          </div>
          <div className="text-xs font-mono text-amber-200/70 shrink-0 hidden sm:block">
            {currentIndex + 1} / {photos.length} ảnh
          </div>
        </div>

        {/* Nút bắn pháo hoa nhanh trên Tivi */}
        <button
          type="button"
          onClick={() => triggerCelebration({ x: 0.5, y: 0.5 })}
          className="px-4 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer shrink-0 border border-amber-300/40"
        >
          <span>🎆</span>
          <span className="hidden sm:inline">Bắn Pháo Hoa</span>
        </button>
      </footer>

      {/* 6. Thanh Điều Khiển Ẩn/Hiện Thông Minh (Tự ẩn sau 4s để màn hình Tivi sạch đẹp) */}
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-opacity duration-500 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/80 backdrop-blur-md border border-white/20 shadow-2xl text-xs">
          {/* Đổi Nhà Trai / Nhà Gái */}
          <button
            type="button"
            onClick={() => setSide(side === "nha-trai" ? "nha-gai" : "nha-trai")}
            className="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold transition cursor-pointer"
          >
            {side === "nha-trai" ? "🤵 Nhà Trai (06.12)" : "👰 Nhà Gái (05.12)"}
          </button>

          {/* Đổi bố cục 2 ảnh / 1 ảnh */}
          <button
            type="button"
            onClick={() => setLayoutMode(layoutMode === "dual" ? "single" : "dual")}
            className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="Đổi chế độ hiển thị 2 ảnh sóng đôi hoặc 1 ảnh"
          >
            {layoutMode === "dual" ? (
              <>
                <Columns2 className="w-3.5 h-3.5" />
                <span>2 Ảnh Sóng Đôi</span>
              </>
            ) : (
              <>
                <Square className="w-3.5 h-3.5" />
                <span>1 Ảnh Lớn</span>
              </>
            )}
          </button>

          {/* Ẩn/Hiện mã QR */}
          <button
            type="button"
            onClick={() => setShowQrBox((q) => !q)}
            className={`px-3 py-1.5 rounded-full font-medium flex items-center gap-1 transition cursor-pointer ${
              showQrBox ? "bg-amber-500/30 text-amber-200" : "bg-white/10 text-gray-400"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR</span>
          </button>

          {/* Lùi / Tạm dừng / Tiến */}
          <div className="flex items-center gap-1 border-l border-r border-white/20 px-2">
            <button
              type="button"
              onClick={prevSlide}
              className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer"
              title="Ảnh trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition cursor-pointer"
              title={isPlaying ? "Tạm dừng" : "Tiếp tục chạy"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer"
              title="Ảnh tiếp theo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Nút Phóng To Toàn Màn Hình Tivi */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-black font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Thoát Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Phóng Toàn Màn Hình Tivi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
