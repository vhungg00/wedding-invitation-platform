"use client";

import { useState } from "react";
import { Utensils, Users, Sparkles, Building, Info, ShieldCheck } from "lucide-react";
import { GuestItem } from "../../types";

interface CateringCalculatorProps {
  guests: GuestItem[];
}

export default function CateringCalculator({ guests }: CateringCalculatorProps) {
  // Mặc định quy chuẩn ngồi 8 người/mâm theo yêu cầu
  const [capacityPerTable, setCapacityPerTable] = useState<number>(8);
  const [backupPercent, setBackupPercent] = useState<number>(10); // 10% mâm dự phòng

  // Tính số lượng khách đã xác nhận tham dự qua RSVP
  let totalAttendingGuests = 0;
  let nhaTraiAttendingGuests = 0;
  let nhaGaiAttendingGuests = 0;

  guests.forEach((g) => {
    const rsvp = g.rsvps?.[0];
    if (rsvp && rsvp.attending) {
      const count = rsvp.guestCount || 1;
      totalAttendingGuests += count;
      if (g.side === "nha-gai") {
        nhaGaiAttendingGuests += count;
      } else {
        nhaTraiAttendingGuests += count;
      }
    }
  });

  // Nếu chưa có ai RSVP hoặc dữ liệu mẫu, hiển thị số liệu tính toán linh hoạt
  const effectiveCount = totalAttendingGuests > 0 ? totalAttendingGuests : guests.length;

  // Công thức tính mâm cỗ
  const mainTables = Math.ceil(effectiveCount / capacityPerTable);
  const backupTables = Math.ceil((mainTables * backupPercent) / 100);
  const totalTablesToBook = mainTables + backupTables;

  const nhaTraiTables = Math.ceil((nhaTraiAttendingGuests || 1) / capacityPerTable);
  const nhaGaiTables = Math.ceil((nhaGaiAttendingGuests || 1) / capacityPerTable);

  return (
    <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 rounded-3xl p-0.5 shadow-xl">
      <div className="bg-white/95 backdrop-blur-md rounded-[23px] p-5 sm:p-7">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>Thước Đo Mâm Cỗ & Bàn Tiệc Tự Động</span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 uppercase tracking-wide">
                  Quy Chuẩn Ngồi {capacityPerTable}
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Tự động tính số lượng mâm cỗ chính thức và dự phòng để báo nhà hàng tiệc cưới chính xác 100%.
              </p>
            </div>
          </div>

          {/* Chọn chuẩn mâm */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl self-stretch sm:self-auto justify-center">
            <span className="text-xs font-medium text-gray-500 px-2">Quy chuẩn:</span>
            {[6, 8, 10].map((cap) => (
              <button
                key={cap}
                type="button"
                onClick={() => setCapacityPerTable(cap)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  capacityPerTable === cap
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-gray-600 hover:text-rose-600"
                }`}
              >
                Mâm {cap}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Chỉ số KPI Mâm Cỗ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* Tổng khách tham dự */}
          <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-4">
            <div className="flex items-center justify-between text-rose-600 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Khách Xác Nhận Đi
              </span>
              <Users className="w-4 h-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {totalAttendingGuests}{" "}
              <span className="text-xs font-normal text-gray-500">người</span>
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              {totalAttendingGuests > 0 ? "Dựa trên RSVP thực tế" : `Tổng ${guests.length} khách trong danh bạ`}
            </p>
          </div>

          {/* Mâm chính */}
          <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4">
            <div className="flex items-center justify-between text-amber-600 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Mâm Cỗ Chính Thức
              </span>
              <Utensils className="w-4 h-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-700">
              {mainTables}{" "}
              <span className="text-xs font-normal text-gray-500">mâm</span>
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              = {effectiveCount} khách ÷ {capacityPerTable} người/mâm
            </p>
          </div>

          {/* Mâm dự phòng */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4">
            <div className="flex items-center justify-between text-blue-600 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Mâm Dự Phòng (+{backupPercent}%)
              </span>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-700">
              {backupTables}{" "}
              <span className="text-xs font-normal text-gray-500">mâm</span>
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              Phòng phát sinh khách đến thêm
            </p>
          </div>

          {/* Tổng chốt nhà hàng */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between opacity-90 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Chốt Đặt Với Nhà Hàng
              </span>
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-black">
              {totalTablesToBook}{" "}
              <span className="text-xs font-normal opacity-90">mâm</span>
            </p>
            <p className="text-[11px] opacity-80 mt-1 truncate">
              {mainTables} mâm chính + {backupTables} dự phòng
            </p>
          </div>
        </div>

        {/* Phân chia Nhà Trai & Nhà Gái */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-medium text-blue-700">
              <Building className="w-3.5 h-3.5" />
              <span>Tiệc Nhà Trai (Lễ Thành Hôn): <strong>{nhaTraiTables} mâm</strong> ({nhaTraiAttendingGuests} khách)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-rose-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tiệc Nhà Gái (Lễ Vu Quy): <strong>{nhaGaiTables} mâm</strong> ({nhaGaiAttendingGuests} khách)</span>
            </span>
          </div>

          <div className="text-[11px] text-gray-500 italic flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-gray-400" />
            <span>Khách xác nhận đi qua link thiệp sẽ tự động cộng dồn số mâm cỗ tại đây.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
