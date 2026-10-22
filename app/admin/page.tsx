"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, MessageSquareHeart, Share2, Gift, Sparkles, Image as ImageIcon, Calendar } from "lucide-react";
import { RsvpItem, WishItem, GuestItem, GiftItem, StatsData } from "./types";
import AdminHeader from "./components/AdminHeader";
import AdminStats from "./components/AdminStats";
import RsvpTab from "./components/RsvpTab";
import WishesTab from "./components/WishesTab";
import GuestsTab from "./components/GuestsTab";
import GiftsTab from "./components/GiftsTab";

export default function AdminPage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"rsvp" | "wishes" | "guests" | "gifts">("rsvp");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [rsvps, setRsvps] = useState<RsvpItem[]>([]);
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, rsvpRes, wishesRes, guestsRes, giftsRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/rsvp"),
        fetch("/api/wishes?all=true"),
        fetch("/api/guests"),
        fetch("/api/gifts"),
      ]);

      const [statsData, rsvpData, wishesData, guestsData, giftsData] = await Promise.all([
        statsRes.json(),
        rsvpRes.json(),
        wishesRes.json(),
        guestsRes.json(),
        giftsRes.json(),
      ]);

      if (statsData.success) setStats(statsData.data);
      if (rsvpData.success) setRsvps(rsvpData.data);
      if (wishesData.success) setWishes(wishesData.data);
      if (guestsData.success) setGuests(guestsData.data);
      if (giftsData.success) setGifts(giftsData.data);
    } catch (err) {
      console.error("Error fetching admin data:", err);
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
          setIsAuthenticated(true);
          fetchData();
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      router.replace("/admin/login");
    }
  };

  const handleDeleteRsvp = async (id: string): Promise<boolean> => {
    if (!confirm("Bạn có chắc chắn muốn xóa phản hồi RSVP này?")) return false;
    try {
      const res = await fetch(`/api/rsvp/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRsvps((prev) => prev.filter((r) => r.id !== id));
        fetchData();
        return true;
      } else {
        alert("Không thể xóa RSVP!");
        return false;
      }
    } catch {
      alert("Không thể xóa RSVP!");
      return false;
    }
  };

  const handleDeleteWish = async (id: string): Promise<boolean> => {
    if (!confirm("Bạn có chắc chắn muốn xóa lời chúc này?")) return false;
    try {
      const res = await fetch(`/api/wishes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setWishes((prev) => prev.filter((w) => w.id !== id));
        fetchData();
        return true;
      } else {
        alert("Không thể xóa lời chúc!");
        return false;
      }
    } catch {
      alert("Không thể xóa lời chúc!");
      return false;
    }
  };

  const handleCreateGuest = async (
    name: string,
    side: "nha-trai" | "nha-gai",
    phone: string
  ) => {
    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          side,
          phone: phone || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setGuests((prev) => [data.data, ...prev]);
        fetchData();
        return data.data;
      } else {
        alert(data.message || "Không thể tạo khách mời!");
      }
    } catch {
      alert("Lỗi khi tạo khách mời!");
    }
  };

  const handleDeleteGuest = async (id: string): Promise<boolean> => {
    if (!confirm("Xóa khách mời này khỏi danh sách?")) return false;
    try {
      const res = await fetch(`/api/guests?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setGuests((prev) => prev.filter((g) => g.id !== id));
        fetchData();
        return true;
      } else {
        alert("Không thể xóa khách mời!");
        return false;
      }
    } catch {
      alert("Không thể xóa khách mời!");
      return false;
    }
  };

  const handleCreateGift = async (data: Partial<GiftItem>): Promise<boolean> => {
    try {
      const res = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setGifts((prev) => [resData.data, ...prev]);
        fetchData();
        return true;
      } else {
        alert(resData.message || "Không thể tạo mừng cưới!");
        return false;
      }
    } catch {
      alert("Lỗi khi tạo mừng cưới!");
      return false;
    }
  };

  const handleUpdateGift = async (id: string, data: Partial<GiftItem>): Promise<boolean> => {
    try {
      const res = await fetch("/api/gifts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setGifts((prev) => prev.map((g) => (g.id === id ? { ...g, ...resData.data } : g)));
        fetchData();
        return true;
      } else {
        alert(resData.message || "Không thể cập nhật mừng cưới!");
        return false;
      }
    } catch {
      alert("Lỗi khi cập nhật mừng cưới!");
      return false;
    }
  };

  const handleDeleteGift = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/gifts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setGifts((prev) => prev.filter((g) => g.id !== id));
        fetchData();
        return true;
      } else {
        alert("Không thể xóa mừng cưới!");
        return false;
      }
    } catch {
      alert("Lỗi khi xóa mừng cưới!");
      return false;
    }
  };

  if (authChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-white to-amber-50/30 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-white to-amber-50/30 text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <AdminHeader
          loading={loading}
          onRefresh={fetchData}
          onLogout={handleLogout}
        />

        {/* Stats */}
        <AdminStats stats={stats} />

        {/* Tab switcher */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab("rsvp")}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "rsvp"
                ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Danh sách RSVP ({rsvps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("wishes")}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "wishes"
                ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <MessageSquareHeart className="w-4 h-4" />
            <span>Sổ Lưu Bút ({wishes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("guests")}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "guests"
                ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Tạo Link Mời Khách ({guests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("gifts")}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "gifts"
                ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Mừng Cưới ({gifts.length})</span>
          </button>

          <Link
            href="/admin/media"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-rose-200 transition shrink-0 cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Studio Ảnh & Mã QR →</span>
          </Link>

          <Link
            href="/admin/info"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-500 hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-200 transition shrink-0 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Sửa Giờ, Ngày & Địa Chỉ →</span>
          </Link>

          <Link
            href="/admin/guests"
            className="ml-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-rose-200 transition shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Màn Hình Điều Phối Khách Mời & Xếp Bàn (Ngồi 8) →</span>
          </Link>
        </div>

        {/* Active Tab Content */}
        {activeTab === "rsvp" && (
          <RsvpTab rsvps={rsvps} onDeleteRsvp={handleDeleteRsvp} />
        )}

        {activeTab === "wishes" && (
          <WishesTab wishes={wishes} onDeleteWish={handleDeleteWish} />
        )}

        {activeTab === "guests" && (
          <GuestsTab
            guests={guests}
            onCreateGuest={handleCreateGuest}
            onDeleteGuest={handleDeleteGuest}
          />
        )}

        {activeTab === "gifts" && (
          <GiftsTab
            gifts={gifts}
            onRefresh={fetchData}
            onCreateGift={handleCreateGift}
            onUpdateGift={handleUpdateGift}
            onDeleteGift={handleDeleteGift}
          />
        )}
      </div>
    </div>
  );
}
