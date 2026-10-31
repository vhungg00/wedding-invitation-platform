"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import {
  MessageCircleHeart,
  Heart,
  X,
  PenLine,
  CheckCircle2,
  Lightbulb,
  Smile,
} from "lucide-react";
import { useGuest } from "@/lib/useGuest";

interface WishItem {
  id: string;
  name: string;
  relationship: string | null;
  content: string;
  hearts: number;
  side: string;
  createdAt: string;
}

const FALLBACK_WISHES: WishItem[] = [
  {
    id: "fallback-1",
    name: "Phương Thảo",
    relationship: "Bạn cô dâu",
    content:
      "Thật vui vì cuối cùng ngày này cũng tới với bạn. Tôi thành tâm chúc hai bạn thật nhiều hạnh phúc và sống đời vui vẻ cùng nhau mãi mãi!",
    hearts: 9,
    side: "both",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "fallback-2",
    name: "Hoài Nam",
    relationship: "Bạn chú rể",
    content:
      "Chúc hai bạn sớm có con đàn cháu đống, cửa nhà lúc nào cũng đầm ấm, yên vui nhé!",
    hearts: 6,
    side: "both",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "fallback-3",
    name: "Ngọc Linh",
    relationship: "Bạn chung",
    content:
      "Chúc hai bạn ngày vui hạnh phúc. Hãy yêu thương nhau thật nhiều và sống thật hạnh phúc nha!",
    hearts: 8,
    side: "both",
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "fallback-4",
    name: "Quốc Bảo",
    relationship: "Đồng nghiệp",
    content:
      "Chúc mừng hạnh phúc hai bạn. Chúc hai bạn bên nhau đầu bạc răng long, sớm có thiên thần nhỏ nhé!",
    hearts: 5,
    side: "both",
    createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
  },
];

const SUGGESTED_WISHES = [
  "Chúc hai bạn trăm năm hạnh phúc, trọn vẹn yêu thương! 💖",
  "Chúc mừng hạnh phúc hai bạn. Chúc hai bạn bên nhau đầu bạc răng long, sớm có thiên thần nhỏ nhé!",
  "Thật vui vì cuối cùng ngày này cũng tới với bạn. Chúc hai bạn thật nhiều hạnh phúc và sống đời vui vẻ cùng nhau mãi mãi!",
  "Chúc hai bạn ngày vui hạnh phúc. Hãy yêu thương nhau thật nhiều và sống thật hạnh phúc nha!",
  "Trăm năm tình viên mãn, bạc đầu nghĩa phu thê! 🥂",
];

const QUICK_EMOJIS = ["💖", "🥂", "🎉", "💐", "💍", "🥰", "✨", "❤️"];

const AVATAR_BG_COLORS = [
  "#F2DCA6",
  "#F6B0A8",
  "#F1CBB5",
  "#ECE2A8",
  "#D8E5A7",
];

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return "vừa xong";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "vừa xong";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours === 1) return "một giờ trước";
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return "một ngày trước";
  if (diffDays < 30) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

function getInitialLetter(name: string): string {
  const trimmed = (name || "").trim();
  if (!trimmed) return "K";
  return trimmed.charAt(0).toUpperCase();
}

interface FloatingWishesProps {
  currentSide?: "nha-trai" | "nha-gai";
}

function FloatingWishesContent({ currentSide = "nha-trai" }: FloatingWishesProps) {
  const { guest } = useGuest();

  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [fireworkCount, setFireworkCount] = useState<number>(128);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("wedding_wishes_count");
      if (cached) setFireworkCount(parseInt(cached, 10));
    } catch {}
  }, []);

  const handleTriggerFireworks = () => {
    setFireworkCount((prev) => prev + 1);
    const hiddenBtn = document.getElementById("wedding-firework-trigger-btn");
    if (hiddenBtn) {
      hiddenBtn.click();
    }
  };

  // Form gửi lời chúc
  const [name, setName] = useState("");
  const [relationship] = useState(
    currentSide === "nha-gai" ? "Bạn cô dâu" : "Bạn chú rể"
  );
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Khóa cuộn nền khi mở modal danh sách lời chúc
  useEffect(() => {
    if (!isModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isModalOpen]);

  // Tự động điền tên khách mời nếu vào từ link cá nhân hóa
  useEffect(() => {
    if (guest?.name && !name) {
      setName(guest.name);
    }
  }, [guest]);

  // Tải danh sách lời chúc từ API
  useEffect(() => {
    let active = true;
    fetch(`/api/wishes?side=${currentSide}&fetchAll=true`)
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setWishes(json.data);
        } else {
          setWishes(FALLBACK_WISHES);
        }
      })
      .catch(() => {
        if (active) setWishes(FALLBACK_WISHES);
      });
    return () => {
      active = false;
    };
  }, [currentSide]);

  // Tự động xoay vòng lời chúc mỗi 5 giây
  useEffect(() => {
    if (wishes.length <= 1 || isHidden || isModalOpen) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % wishes.length);
      setFadeKey((k) => k + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, [wishes.length, isHidden, isModalOpen]);

  const activeWish = wishes[currentIndex] || FALLBACK_WISHES[0];

  const handleLike = async (wishId: string) => {
    if (likedMap[wishId] || wishId.startsWith("fallback-")) return;
    setLikedMap((prev) => ({ ...prev, [wishId]: true }));
    setWishes((prev) =>
      prev.map((w) => (w.id === wishId ? { ...w, hearts: (w.hearts || 0) + 1 } : w))
    );
    try {
      await fetch(`/api/wishes/${wishId}/like`, { method: "POST" });
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          relationship,
          content: content.trim(),
          side: currentSide,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success && result.data) {
        setWishes((prev) => {
          const filtered = prev.filter((item) => !item.id.startsWith("fallback-"));
          return [result.data, ...filtered];
        });
        setCurrentIndex(0);
        setContent("");
        setShowSuggestions(false);
        setShowEmojis(false);
        setSuccessNotice(true);
        handleTriggerFireworks();
        if (listContainerRef.current) {
          listContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
        setTimeout(() => {
          setSuccessNotice(false);
        }, 2500);
      }
    } catch (err) {
      console.error("Lỗi gửi lời chúc:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Bong bóng lời chúc tích hợp nút Chúc phúc (🎆) thông minh ở góc dưới bên trái */}
      <div className="fixed bottom-4 left-3 sm:left-4 z-40 max-w-[calc(100vw-88px)] sm:max-w-xs select-none">
        {isHidden ? (
          <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-white/95 backdrop-blur-md border border-rose-200/90 shadow-lg">
            {/* Nút bắn pháo hoa Chúc phúc */}
            <button
              type="button"
              onClick={handleTriggerFireworks}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-2.5 py-1.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white text-xs font-semibold shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer"
              title="Bắn pháo hoa chúc phúc cô dâu chú rể"
            >
              <span className="animate-pulse">🎆</span>
              <span>Chúc phúc</span>
              <span className="bg-white/25 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {fireworkCount}
              </span>
            </button>

            {/* Nút mở lại lời chúc */}
            <button
              type="button"
              onClick={() => setIsHidden(false)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
              title="Hiện lời chúc"
            >
              <MessageCircleHeart className="w-4 h-4 text-rose-500" />
              <span>Lời chúc ({wishes.length})</span>
            </button>
          </div>
        ) : (
          <div className="bg-white/92 backdrop-blur-md border border-rose-200/90 rounded-2xl p-3 shadow-xl shadow-rose-900/10">
            {/* Nội dung lời chúc đang hiển thị */}
            <div key={fadeKey} className="animate-fade-in">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm shrink-0">💌</span>
                  <span className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                    {activeWish.name}
                  </span>
                  {activeWish.relationship && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-600 border border-rose-200/70 shrink-0">
                      {activeWish.relationship}
                    </span>
                  )}
                </div>

                {/* Nút thả tim nhỏ */}
                <button
                  type="button"
                  onClick={() => handleLike(activeWish.id)}
                  className={`inline-flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded-full transition cursor-pointer shrink-0 ${
                    likedMap[activeWish.id]
                      ? "bg-rose-100 text-rose-600 font-semibold"
                      : "text-gray-400 hover:text-rose-500"
                  }`}
                  title="Thả tim lời chúc này"
                >
                  <Heart
                    className={`w-3 h-3 ${
                      likedMap[activeWish.id] ? "fill-rose-500 text-rose-500" : ""
                    }`}
                  />
                  <span>{activeWish.hearts || 0}</span>
                </button>
              </div>

              <p
                onClick={() => setIsModalOpen(true)}
                className="text-xs text-gray-700 leading-snug line-clamp-2 italic pl-5 cursor-pointer hover:text-rose-700 transition"
              >
                &ldquo;{activeWish.content}&rdquo;
              </p>
            </div>

            {/* Thanh điều khiển thông minh dưới đáy bong bóng: [🎆 Chúc phúc] [✍️ Gửi lời chúc] [Ẩn] */}
            <div className="mt-2.5 pt-2 border-t border-rose-100/80 flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleTriggerFireworks}
                  className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white pl-2.5 pr-2 py-1 rounded-full shadow-sm shadow-rose-500/25 inline-flex items-center gap-1 hover:scale-105 active:scale-95 transition-all text-[11px] font-semibold cursor-pointer"
                  title="Bắn pháo hoa chúc phúc cô dâu chú rể"
                >
                  <span className="text-xs animate-pulse">🎆</span>
                  <span>Chúc phúc</span>
                  <span className="bg-white/25 text-white text-[10px] px-1.5 rounded-full font-mono">
                    {fireworkCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-[11px] font-semibold transition cursor-pointer"
                >
                  <PenLine className="w-3 h-3" />
                  <span>Gửi lời chúc</span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                {wishes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="text-[10px] text-gray-400 hover:text-rose-600 font-mono cursor-pointer"
                  >
                    {currentIndex + 1}/{wishes.length}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsHidden(true)}
                  className="text-[11px] text-gray-400 hover:text-gray-700 px-1.5 py-0.5 rounded-md hover:bg-gray-100 transition cursor-pointer"
                  title="Thu gọn bong bóng"
                >
                  Ẩn
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Fullscreen: Danh sách lời chúc cuộn phía trên + Bottom Sheet Gửi lời chúc trượt từ dưới lên */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-md flex flex-col justify-between font-sans animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          {/* Danh sách lời chúc cuộn phía trên */}
          <div
            ref={listContainerRef}
            className="flex-1 overflow-y-auto px-3.5 sm:px-5 pt-5 pb-4 space-y-3.5 max-w-lg w-full mx-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {wishes.map((wish, idx) => {
              const avatarBg = AVATAR_BG_COLORS[idx % AVATAR_BG_COLORS.length];
              return (
                <div
                  key={wish.id}
                  className="bg-[#FAF8F5]/95 backdrop-blur-sm rounded-2xl px-4 py-3.5 shadow-md border border-white/80 transition hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        style={{ backgroundColor: avatarBg }}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-gray-800 shrink-0"
                      >
                        {getInitialLetter(wish.name)}
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0 truncate">
                        <span className="font-bold text-gray-900 text-sm sm:text-[15px] truncate">
                          {wish.name}
                        </span>
                        <span className="text-xs text-gray-400 shrink-0">
                          • {formatRelativeTime(wish.createdAt)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLike(wish.id)}
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition cursor-pointer shrink-0 ${
                        likedMap[wish.id]
                          ? "bg-rose-100 text-rose-600 font-semibold"
                          : "text-gray-400 hover:text-rose-500"
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          likedMap[wish.id] ? "fill-rose-500 text-rose-500" : ""
                        }`}
                      />
                      {(wish.hearts || 0) > 0 && <span>{wish.hearts}</span>}
                    </button>
                  </div>

                  <p className="mt-2 text-sm sm:text-[15px] text-gray-800 leading-relaxed break-words">
                    {wish.content}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Bottom Sheet Gửi Lời Chúc đi từ dưới lên */}
          <div
            className="w-full max-w-lg mx-auto bg-[#FDF7F5] rounded-t-[28px] px-4 pt-4 pb-5 sm:px-6 sm:pt-5 sm:pb-6 shadow-[0_-10px_35px_rgba(0,0,0,0.22)] border-t border-rose-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Bottom Sheet */}
            <div className="relative flex items-center justify-center mb-3.5">
              <div className="inline-flex items-center gap-2">
                <Heart className="w-4 h-4 fill-[#7A1C24] text-[#7A1C24]" />
                <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                  Gửi lời chúc
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-500 hover:text-gray-800 hover:bg-black/5 transition cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successNotice && (
              <div className="mb-3 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cảm ơn lời chúc tuyệt vời của bạn! 💖</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tên của bạn"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-[#E6D0CE] focus:outline-none focus:border-[#7A1C24] text-sm sm:text-[15px] text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div className="relative">
                <textarea
                  required
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Lời chúc của bạn"
                  className="w-full pl-4 pr-14 py-3 rounded-2xl bg-white border border-[#E6D0CE] focus:outline-none focus:border-[#7A1C24] text-sm sm:text-[15px] text-gray-900 placeholder:text-gray-400 resize-none"
                />

                {/* Hai nút tiện ích góc phải ô nhập: Gợi ý (💡) & Emoji (😊) */}
                <div className="absolute right-2.5 bottom-2.5 flex flex-col items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSuggestions((prev) => !prev);
                      setShowEmojis(false);
                    }}
                    title="Gợi ý lời chúc hay"
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                      showSuggestions
                        ? "bg-[#7A1C24] text-white border-[#7A1C24]"
                        : "bg-[#F9F1F0] text-[#7A1C24] border-[#C99FA2] hover:bg-rose-100"
                    }`}
                  >
                    <Lightbulb className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowEmojis((prev) => !prev);
                      setShowSuggestions(false);
                    }}
                    title="Chèn biểu tượng cảm xúc"
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                      showEmojis
                        ? "bg-rose-100 text-[#7A1C24]"
                        : "text-[#7A1C24] hover:bg-rose-50"
                    }`}
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Khay chọn nhanh lời chúc gợi ý khi ấn 💡 */}
              {showSuggestions && (
                <div className="p-2.5 rounded-2xl bg-white border border-rose-200/80 shadow-sm space-y-1.5 max-h-36 overflow-y-auto">
                  <p className="text-[11px] font-semibold text-[#7A1C24] px-1">
                    💡 Chọn nhanh lời chúc gợi ý:
                  </p>
                  {SUGGESTED_WISHES.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setContent(sample);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left text-xs text-gray-700 hover:text-[#7A1C24] hover:bg-rose-50/80 px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              )}

              {/* Khay chọn nhanh Emoji khi ấn 😊 */}
              {showEmojis && (
                <div className="flex items-center justify-around px-3 py-2 rounded-2xl bg-white border border-rose-200/80 shadow-sm">
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setContent((prev) => `${prev}${emoji}`)}
                      className="text-lg hover:scale-125 transition cursor-pointer px-1"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !name.trim() || !content.trim()}
                className="w-full py-3.5 rounded-2xl bg-[#6E1423] hover:bg-[#58101C] text-white font-bold text-sm sm:text-base shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Đang gửi..." : "Gửi Lời Chúc"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default function FloatingWishes(props: FloatingWishesProps) {
  return (
    <Suspense fallback={null}>
      <FloatingWishesContent {...props} />
    </Suspense>
  );
}
