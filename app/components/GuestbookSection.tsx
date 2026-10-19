"use client";

import { useState, useEffect } from "react";
import { MessageCircleHeart, Heart, Send, Sparkles, User, Tag } from "lucide-react";
import { InputCustom, DropdownCustom, TextareaCustom, AppButton } from "@/app/components/ui";

interface WishItem {
  id: string;
  name: string;
  relationship: string | null;
  content: string;
  hearts: number;
  side: string;
  createdAt: string;
}

interface GuestbookSectionProps {
  currentSide?: "nha-trai" | "nha-gai";
}

export default function GuestbookSection({ currentSide = "nha-trai" }: GuestbookSectionProps) {
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("Bạn chú rể");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [successNotice, setSuccessNotice] = useState(false);

  // Fetch existing wishes
  const loadWishes = async () => {
    try {
      const res = await fetch("/api/wishes");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setWishes(data.data);
      }
    } catch (err) {
      console.error("Failed to load wishes:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadWishes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    setLoading(true);
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
        setWishes((prev) => [result.data, ...prev]);
        setContent("");
        setSuccessNotice(true);
        setTimeout(() => setSuccessNotice(false), 3000);
      }
    } catch (err) {
      console.error("Error submitting wish:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (wishId: string) => {
    if (likedMap[wishId]) return;

    // Optimistic UI update
    setLikedMap((prev) => ({ ...prev, [wishId]: true }));
    setWishes((prev) =>
      prev.map((w) => (w.id === wishId ? { ...w, hearts: w.hearts + 1 } : w))
    );

    try {
      await fetch(`/api/wishes/${wishId}/like`, { method: "POST" });
    } catch (err) {
      console.error("Failed to like wish:", err);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-12 px-4" data-aos="fade-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 text-rose-500 mb-3 shadow-inner">
          <MessageCircleHeart className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Sổ Lưu Bút & Lời Chúc
        </h2>
        <p className="font-imperial-script text-3xl sm:text-4xl text-rose-500 mt-1">
          Wedding Wishes
        </p>
        <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-md mx-auto">
          Hãy để lại những lời chúc tốt đẹp nhất để lưu giữ kỷ niệm cùng cô dâu và chú rể nhé!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form gửi lời chúc (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 shadow-xl border border-rose-100">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Gửi lời chúc mừng</span>
          </h3>

          {successNotice && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm rounded-xl text-center animate-fade-in">
              Cảm ơn lời chúc tuyệt vời của bạn! 💖
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputCustom
              label="Tên của bạn"
              required
              icon={<User className="w-4 h-4" />}
              placeholder="Nhập tên của bạn"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <DropdownCustom
              label="Mối quan hệ"
              prefixIcon={<Tag className="w-4 h-4" />}
              value={relationship}
              onSelect={(val) => setRelationship(String(val))}
              options={[
                { label: "Bạn Chú Rể", value: "Bạn chú rể" },
                { label: "Bạn Cô Dâu", value: "Bạn cô dâu" },
                { label: "Bạn Chung 2 Bên", value: "Bạn chung" },
                { label: "Đồng Nghiệp", value: "Đồng nghiệp" },
                { label: "Gia Đình & Họ Hàng", value: "Gia đình & Họ hàng" },
                { label: "Người Thân Quý Mến", value: "Người thân quý mến" },
              ]}
            />

            <TextareaCustom
              label="Lời chúc của bạn"
              required
              rows={4}
              placeholder="Chúc hai bạn trăm năm hạnh phúc, sớm đón thiên thần nhỏ..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <AppButton
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={loading}
              disabled={!name.trim() || !content.trim()}
              icon={<Send className="w-4 h-4" />}
            >
              Gửi Lời Chúc
            </AppButton>
          </form>
        </div>

        {/* Danh sách lời chúc (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">
              {wishes.length} Lời chúc mừng
            </span>
            <span className="text-xs text-gray-500">Mới nhất cập nhật</span>
          </div>

          <div className="max-h-[520px] overflow-y-auto space-y-3.5 pr-1 no-scrollbar">
            {fetching ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                Đang tải lời chúc...
              </div>
            ) : wishes.length === 0 ? (
              <div className="text-center py-12 bg-white/70 rounded-2xl border border-dashed border-rose-200 p-6">
                <Heart className="w-10 h-10 text-rose-300 mx-auto mb-2 opacity-80" />
                <p className="text-gray-600 text-sm">
                  Chưa có lời chúc nào. Hãy là người đầu tiên gửi lời chúc tới cặp đôi nhé!
                </p>
              </div>
            ) : (
              wishes.map((item) => {
                const isLiked = likedMap[item.id];
                return (
                  <div
                    key={item.id}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-rose-100/80 shadow-sm hover:shadow-md transition-shadow relative group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                            {item.name}
                          </h4>
                          {item.relationship && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-600 border border-rose-200/60">
                              {item.relationship}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {formatTime(item.createdAt)}
                        </span>
                      </div>

                      {/* Nút thả tim */}
                      <button
                        onClick={() => handleLike(item.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-transform active:scale-125 ${
                          isLiked
                            ? "bg-rose-100 text-rose-600 font-medium"
                            : "bg-gray-100 hover:bg-rose-50 text-gray-600 hover:text-rose-500"
                        }`}
                        title="Thả tim"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            isLiked ? "fill-rose-500 text-rose-500" : ""
                          }`}
                        />
                        <span>{item.hearts || 0}</span>
                      </button>
                    </div>

                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-rose-50/30 rounded-xl p-3 border border-rose-50">
                      &ldquo;{item.content}&rdquo;
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
