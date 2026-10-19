"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, MessageSquareHeart, Share2 } from "lucide-react";
import { RsvpItem, WishItem, GuestItem, StatsData } from "./types";
import AdminHeader from "./components/AdminHeader";
import AdminStats from "./components/AdminStats";
import RsvpTab from "./components/RsvpTab";
import WishesTab from "./components/WishesTab";
import GuestsTab from "./components/GuestsTab";

export default function AdminPage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"rsvp" | "wishes" | "guests">("rsvp");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [rsvps, setRsvps] = useState<RsvpItem[]>([]);
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, rsvpRes, wishesRes, guestsRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/rsvp"),
        fetch("/api/wishes?all=true"),
        fetch("/api/guests"),
      ]);

      const [statsData, rsvpData, wishesData, guestsData] = await Promise.all([
        statsRes.json(),
        rsvpRes.json(),
        wishesRes.json(),
        guestsRes.json(),
      ]);

      if (statsData.success) setStats(statsData.data);
      if (rsvpData.success) setRsvps(rsvpData.data);
      if (wishesData.success) setWishes(wishesData.data);
      if (guestsData.success) setGuests(guestsData.data);
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

  const handleDeleteRsvp = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phản hồi RSVP này?")) return;
    try {
      const res = await fetch(`/api/rsvp/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRsvps((prev) => prev.filter((r) => r.id !== id));
        fetchData();
      }
    } catch {
      alert("Không thể xóa RSVP!");
    }
  };

  const handleDeleteWish = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lời chúc này?")) return;
    try {
      const res = await fetch(`/api/wishes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setWishes((prev) => prev.filter((w) => w.id !== id));
        fetchData();
      }
    } catch {
      alert("Không thể xóa lời chúc!");
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
      } else {
        alert(data.message || "Không thể tạo khách mời!");
      }
    } catch {
      alert("Lỗi khi tạo khách mời!");
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (!confirm("Xóa khách mời này khỏi danh sách?")) return;
    try {
      const res = await fetch(`/api/guests?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setGuests((prev) => prev.filter((g) => g.id !== id));
        fetchData();
      }
    } catch {
      alert("Không thể xóa khách mời!");
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
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
          <button
            onClick={() => setActiveTab("rsvp")}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
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
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
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
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
              activeTab === "guests"
                ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Tạo Link Mời Khách ({guests.length})</span>
          </button>
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
      </div>
    </div>
  );
}
