"use client";

import { useState, useEffect, Suspense } from "react";
import {
  MessageCircleHeart,
  Heart,
  Send,
  X,
  PenLine,
  Sparkles,
  User,
  Tag,
  CheckCircle2,
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
    name: "Gia đình hai bên",
    relationship: "Người thân",
    content: "Chúc hai con trăm năm tình viên mãn, bạc đầu nghĩa phu thê!",
    hearts: 9,
    side: "both",
    createdAt: new Date().toISOString(),
  },
  {
    id: "fallback-2",
    name: "Hội bạn thân",
    relationship: "Bạn chung",
    content: "Chúc Việt Hùng & Xuân Ly mãi hạnh phúc, sớm đón thiên thần nhỏ nhé! 💖",
    hearts: 6,
    side: "both",
    createdAt: new Date().toISOString(),
  },
];

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
  const [relationship, setRelationship] = useState(
    currentSide === "nha-gai" ? "Bạn cô dâu" : "Bạn chú rể"
  );
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

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
        setSuccessNotice(true);
        setTimeout(() => {
          setSuccessNotice(false);
          setIsModalOpen(false);
        }, 2000);
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

              <p className="text-xs text-gray-700 leading-snug line-clamp-2 italic pl-5">
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
                  <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
                    {currentIndex + 1}/{wishes.length}
                  </span>
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

      {/* Popup Gửi Lời Chúc & Xem Sổ Lưu Bút */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-rose-100 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    Gửi Lời Chúc Mừng
                  </h3>
                  <p className="text-xs text-gray-500">
                    Lưu giữ kỷ niệm đẹp cùng cô dâu & chú rể
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successNotice ? (
              <div className="py-8 text-center space-y-2 animate-fade-in">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-gray-800 text-base">
                  Cảm ơn lời chúc thân thương của bạn! 💖
                </h4>
                <p className="text-xs text-gray-500">
                  Lời chúc của bạn đã được hiển thị trên trang thiệp.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs sm:text-sm">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Tên của bạn <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ví dụ: Anh Hoàng, Bạn Lan..."
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-rose-500 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Mối quan hệ
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-rose-500 bg-white text-gray-900"
                    >
                      <option value="Bạn chú rể">Bạn Chú Rể</option>
                      <option value="Bạn cô dâu">Bạn Cô Dâu</option>
                      <option value="Bạn chung">Bạn Chung 2 Bên</option>
                      <option value="Đồng nghiệp">Đồng Nghiệp</option>
                      <option value="Gia đình & Họ hàng">Gia Đình & Họ Hàng</option>
                      <option value="Người thân quý mến">Người Thân Quý Mến</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Lời chúc của bạn <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Chúc hai em trăm năm hạnh phúc, sớm sinh quý tử nhé!"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-rose-500 text-gray-900 resize-none"
                  />
                </div>

                {/* Gợi ý lời chúc nhanh 1-chạm */}
                <div className="space-y-1">
                  <span className="text-[11px] text-gray-400">Gợi ý chọn nhanh:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Chúc hai bạn trăm năm hạnh phúc, trọn vẹn yêu thương! 💖",
                      "Chúc mừng hạnh phúc hai em, sớm đón thiên thần nhỏ nhé!",
                      "Trăm năm tình viên mãn, bạc đầu nghĩa phu thê! 🥂",
                    ].map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setContent(sample)}
                        className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-rose-50/70 hover:bg-rose-100 text-rose-700 border border-rose-200/60 transition cursor-pointer"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !name.trim() || !content.trim()}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold inline-flex items-center gap-1.5 shadow-md shadow-rose-200 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? "Đang gửi..." : "Gửi Lời Chúc"}</span>
                  </button>
                </div>
              </form>
            )}
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
