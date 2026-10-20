"use client";

import { useState, useMemo } from "react";
import { Armchair, Users, Plus, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { GuestItem } from "../../types";

interface SeatingPlannerViewProps {
  guests: GuestItem[];
  onAssignTable: (guestId: string, table: string) => Promise<void>;
}

export default function SeatingPlannerView({
  guests,
  onAssignTable,
}: SeatingPlannerViewProps) {
  // Quy chuẩn ngồi 8 người/mâm
  const CAPACITY = 8;
  const [newTableName, setNewTableName] = useState("");

  // Phân loại khách theo bàn
  const { tableMap, unassignedGuests } = useMemo(() => {
    const map: Record<string, GuestItem[]> = {};
    const unassigned: GuestItem[] = [];

    guests.forEach((g) => {
      const table = g.table ? g.table.trim() : "";
      if (table) {
        if (!map[table]) map[table] = [];
        map[table].push(g);
      } else {
        unassigned.push(g);
      }
    });

    return { tableMap: map, unassignedGuests: unassigned };
  }, [guests]);

  const tableList = Object.keys(tableMap).sort();

  const handleQuickAssign = async (guestId: string, targetTable: string) => {
    await onAssignTable(guestId, targetTable);
  };

  const handleCreateNewTable = () => {
    if (!newTableName.trim()) return;
    const clean = newTableName.trim();
    if (!tableMap[clean]) {
      tableMap[clean] = [];
    }
    setNewTableName("");
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
            <Armchair className="w-5 h-5 text-amber-600" />
            <span>Sơ Đồ Xếp Bàn Tiệc (Quy Chuẩn Bàn 8 Ghế - &ldquo;Ngồi 8&rdquo;)</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Tổng cộng: <strong>{tableList.length} bàn đã tạo</strong> •{" "}
            <strong>{guests.length - unassignedGuests.length} khách đã có bàn</strong> •{" "}
            <span className="text-amber-600 font-semibold">{unassignedGuests.length} khách chưa xếp bàn</span>
          </p>
        </div>

        {/* Thêm bàn mới */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Tên bàn mới (vd: Bàn 01)..."
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:outline-rose-500"
          />
          <button
            type="button"
            onClick={handleCreateNewTable}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Bàn</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột 1 & 2: Danh sách các bàn tiệc 8 người */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tableList.length === 0 ? (
            <div className="col-span-2 p-12 bg-white rounded-2xl border border-dashed border-gray-300 text-center text-gray-400 text-xs">
              Chưa có bàn tiệc nào được thiết lập. Bạn có thể gán bàn ở cột bên phải hoặc tạo bàn mới ở trên!
            </div>
          ) : (
            tableList.map((tableName) => {
              const seatedGuests = tableMap[tableName] || [];
              const seatedCount = seatedGuests.length;
              const isFull = seatedCount === CAPACITY;
              const isOver = seatedCount > CAPACITY;

              return (
                <div
                  key={tableName}
                  className={`bg-white rounded-2xl border p-4 shadow-xs transition ${
                    isOver
                      ? "border-red-300 bg-red-50/20"
                      : isFull
                      ? "border-emerald-300 bg-emerald-50/20"
                      : "border-gray-200"
                  }`}
                >
                  {/* Table Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
                    <span className="font-bold text-sm text-gray-900">{tableName}</span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                        isOver
                          ? "bg-red-100 text-red-700"
                          : isFull
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {isFull && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {isOver && <AlertTriangle className="w-3.5 h-3.5" />}
                      <span>
                        {seatedCount}/{CAPACITY} chỗ
                      </span>
                    </span>
                  </div>

                  {/* Table Members */}
                  <div className="space-y-1.5 min-h-[140px]">
                    {seatedGuests.map((g, idx) => (
                      <div
                        key={g.id}
                        className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-[10px] text-gray-400 font-mono w-4">
                            {idx + 1}.
                          </span>
                          <span className="font-semibold text-gray-800 truncate">
                            {g.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleQuickAssign(g.id, "")}
                          title="Hủy gán khỏi bàn này"
                          className="text-[11px] text-gray-400 hover:text-rose-600 transition cursor-pointer p-0.5"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {seatedCount < CAPACITY && (
                      <div className="p-2 rounded-xl border border-dashed border-gray-200 text-center text-[11px] text-gray-400">
                        + Còn {CAPACITY - seatedCount} ghế trống
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cột 3: Danh sách khách chờ xếp bàn */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col h-[650px]">
          <div className="pb-3 border-b border-gray-100 mb-3">
            <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-rose-600" />
              <span>Chờ Xếp Bàn ({unassignedGuests.length})</span>
            </h4>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Chọn bàn tiệc để chuyển khách vào mâm:
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {unassignedGuests.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                Tuyệt vời! Tất cả khách mời đều đã được gán số bàn tiệc.
              </div>
            ) : (
              unassignedGuests.map((g) => (
                <div
                  key={g.id}
                  className="p-2.5 rounded-xl border border-gray-100 hover:border-amber-300 bg-gray-50/70 hover:bg-amber-50/30 transition text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{g.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {g.side === "nha-trai" ? "Nhà Trai" : "Nhà Gái"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleQuickAssign(g.id, e.target.value);
                          e.target.value = "";
                        }
                      }}
                      defaultValue=""
                      className="w-full px-2 py-1 rounded-lg border border-gray-300 bg-white text-[11px] focus:outline-rose-500"
                    >
                      <option value="" disabled>
                        Chọn bàn để gán...
                      </option>
                      {tableList.map((t) => {
                        const count = (tableMap[t] || []).length;
                        return (
                          <option key={t} value={t} disabled={count >= CAPACITY}>
                            {t} ({count}/{CAPACITY} chỗ) {count >= CAPACITY ? " [Đầy]" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
