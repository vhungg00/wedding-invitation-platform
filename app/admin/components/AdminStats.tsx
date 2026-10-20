"use client";

import { Users, CheckCircle, MessageSquareHeart, Gift } from "lucide-react";
import { StatsData } from "../types";

interface AdminStatsProps {
  stats: StatsData | null;
}

export default function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <div className="bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-rose-100 shadow-sm">
        <div className="flex items-center justify-between text-rose-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Tổng khách dự
          </span>
          <Users className="w-5 h-5" />
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          {stats?.totalAttendingCount ?? 0}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          người xác nhận tham dự
        </p>
      </div>

      <div className="bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-rose-100 shadow-sm">
        <div className="flex items-center justify-between text-blue-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Bên Nhà Trai
          </span>
          <CheckCircle className="w-5 h-5" />
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">
          {stats?.nhaTraiGuestsCount ?? 0}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          khách dự lễ thành hôn
        </p>
      </div>

      <div className="bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-rose-100 shadow-sm">
        <div className="flex items-center justify-between text-emerald-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Bên Nhà Gái
          </span>
          <CheckCircle className="w-5 h-5" />
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
          {stats?.nhaGaiGuestsCount ?? 0}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          khách dự lễ vu quy
        </p>
      </div>

      <div className="bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-rose-100 shadow-sm">
        <div className="flex items-center justify-between text-amber-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Lời chúc & Sổ ký
          </span>
          <MessageSquareHeart className="w-5 h-5" />
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">
          {stats?.totalWishes ?? 0}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          lời chúc từ bạn bè & họ hàng
        </p>
      </div>

      <div className="bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-emerald-100 shadow-sm col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between text-emerald-600 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Tiền Mừng Cưới
          </span>
          <Gift className="w-5 h-5" />
        </div>
        <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 truncate">
          {(stats?.totalGiftAmount ?? 0).toLocaleString("vi-VN")} đ
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {stats?.totalGiftsCount ?? 0} lượt mừng đã nhận
        </p>
      </div>
    </div>
  );
}
