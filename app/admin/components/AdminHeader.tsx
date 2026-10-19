"use client";

import Link from "next/link";
import { Heart, RefreshCw, Home, LogOut } from "lucide-react";
import { AppButton } from "@/app/components/ui/AppButton";

interface AdminHeaderProps {
  loading: boolean;
  onRefresh: () => void;
  onLogout: () => void;
}

export default function AdminHeader({
  loading,
  onRefresh,
  onLogout,
}: AdminHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-rose-100 shadow-sm">
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-rose-50 text-rose-500 font-bold">
            <Heart className="w-5 h-5 fill-rose-500" />
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Wedding Admin Platform
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Quản lý phản hồi RSVP, Sổ lưu bút & Sinh link thiệp mời cá nhân hóa
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <AppButton
          variant="gray"
          size="sm"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={onRefresh}
          disabled={loading}
        >
          Làm mới
        </AppButton>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-medium transition"
        >
          <Home className="w-4 h-4" />
          <span>Xem Thiệp Nhà Trai</span>
        </Link>
        <Link
          href="/nha-gai"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium transition"
        >
          <Home className="w-4 h-4" />
          <span>Xem Thiệp Nhà Gái</span>
        </Link>
        <AppButton
          variant="danger"
          size="sm"
          icon={<LogOut className="w-4 h-4" />}
          onClick={onLogout}
          title="Đăng xuất khỏi hệ thống"
        >
          Đăng xuất
        </AppButton>
      </div>
    </div>
  );
}
