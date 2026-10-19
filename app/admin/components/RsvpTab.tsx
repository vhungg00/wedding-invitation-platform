"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Search, Filter, Download, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { RsvpItem } from "../types";
import { InputCustom } from "@/app/components/ui/InputCustom";
import { DropdownCustom } from "@/app/components/ui/DropdownCustom";
import { TableResize, TColumn, ESortType } from "@/app/components/ui/TableResize";

interface RsvpTabProps {
  rsvps: RsvpItem[];
  onDeleteRsvp: (id: string) => void;
}

export default function RsvpTab({ rsvps, onDeleteRsvp }: RsvpTabProps) {
  const [items, setItems] = useState<RsvpItem[]>(rsvps);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSide, setFilterSide] = useState<string>("all");
  const [filterAttending, setFilterAttending] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState<string | undefined>("createdAt");
  const [sortType, setSortType] = useState<ESortType>(ESortType.DESC);

  // Cờ theo dõi lần render đầu tiên
  const isInitialMount = useRef(true);

  // Đồng bộ khi danh sách cha thay đổi (chỉ khi đang ở filter mặc định)
  useEffect(() => {
    if (isInitialMount.current) {
      setItems(rsvps);
      return;
    }
    if (searchTerm === "" && filterSide === "all" && filterAttending === "all") {
      setItems(rsvps);
    }
  }, [rsvps]);

  // Hàm gọi API lọc từ Server
  const fetchFilteredRsvps = useCallback(
    async (search: string, side: string, attending: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (side !== "all") params.set("side", side);
        if (attending !== "all") params.set("attending", attending);
        if (search.trim()) params.set("search", search.trim());

        const res = await fetch(`/api/rsvp?${params.toString()}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setItems(data.data);
        }
      } catch (err) {
        console.error("Lỗi khi lọc RSVP từ server:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounce tìm kiếm và gọi server khi filter thay đổi
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetchFilteredRsvps(searchTerm, filterSide, filterAttending);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, filterSide, filterAttending, fetchFilteredRsvps]);

  const handleDelete = async (id: string) => {
    onDeleteRsvp(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleExportCsv = () => {
    const headers = [
      "STT",
      "Họ và tên",
      "Số điện thoại",
      "Tham dự",
      "Số người",
      "Bên",
      "Lời nhắn",
      "Thời gian",
    ];
    const rows = sortedItems.map((r, i) => [
      i + 1,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.phone || ""}"`,
      r.attending ? "Có" : "Không",
      r.guestCount,
      r.side === "nha-trai" ? "Nhà Trai" : "Nhà Gái",
      `"${(r.note || "").replace(/"/g, '""')}"`,
      new Date(r.createdAt).toLocaleString("vi-VN"),
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `danh-sach-rsvp-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (column: TColumn<RsvpItem>, type: ESortType) => {
    const key = (column.dataIndex || column.name || column.key) as string;
    setSortKey(key);
    setSortType(type);
  };

  // Client-side sort on loaded items
  const sortedItems = useMemo(() => {
    if (!sortKey) return items;
    return [...items].sort((a, b) => {
      const aVal = a[sortKey as keyof RsvpItem];
      const bVal = b[sortKey as keyof RsvpItem];
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      if (sortKey === "createdAt") {
        const aTime = new Date(aVal as string).getTime();
        const bTime = new Date(bVal as string).getTime();
        return sortType === ESortType.ASC ? aTime - bTime : bTime - aTime;
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortType === ESortType.ASC ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === "boolean" && typeof bVal === "boolean") {
        return sortType === ESortType.ASC
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);
      }
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortType === ESortType.ASC
        ? aStr.localeCompare(bStr, "vi")
        : bStr.localeCompare(aStr, "vi");
    });
  }, [items, sortKey, sortType]);

  const columns = useMemo<TColumn<RsvpItem>[]>(
    () => [
      {
        title: "Khách mời",
        dataIndex: "name",
        key: "name",
        sortable: true,
        width: 170,
        render: (_, r) => (
          <span className="font-semibold text-gray-900 truncate block">
            {r.name}
          </span>
        ),
      },
      {
        title: "Số điện thoại",
        dataIndex: "phone",
        key: "phone",
        width: 130,
        render: (_, r) => (
          <span className="text-gray-600">{r.phone || "-"}</span>
        ),
      },
      {
        title: "Tham dự",
        dataIndex: "attending",
        key: "attending",
        sortable: true,
        width: 140,
        render: (_, r) =>
          r.attending ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle className="w-3 h-3 shrink-0" />
              <span>Tham dự</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
              <XCircle className="w-3 h-3 shrink-0" />
              <span>Không thể đến</span>
            </span>
          ),
      },
      {
        title: "Số người",
        dataIndex: "guestCount",
        key: "guestCount",
        sortable: true,
        width: 100,
        render: (_, r) => (
          <span className="font-bold text-gray-800">
            {r.attending ? `${r.guestCount} người` : "0"}
          </span>
        ),
      },
      {
        title: "Bên tiệc",
        dataIndex: "side",
        key: "side",
        sortable: true,
        width: 110,
        render: (_, r) => (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              r.side === "nha-trai"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {r.side === "nha-trai" ? "Nhà Trai" : "Nhà Gái"}
          </span>
        ),
      },
      {
        title: "Lời nhắn",
        dataIndex: "note",
        key: "note",
        width: 240,
        render: (_, r) => (
          <span className="text-gray-600 truncate block" title={r.note || ""}>
            {r.note || "-"}
          </span>
        ),
      },
      {
        title: "Thời gian",
        dataIndex: "createdAt",
        key: "createdAt",
        sortable: true,
        width: 130,
        render: (_, r) => (
          <span className="text-xs text-gray-400">
            {new Date(r.createdAt).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        ),
      },
      {
        title: "Hành động",
        key: "actions",
        width: 90,
        align: "center",
        resizable: false,
        render: (_, r) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(r.id);
            }}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
            title="Xóa phản hồi"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-rose-100 shadow-sm p-5 sm:p-6 space-y-6">
      {/* Filters (Server-side) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <InputCustom
            icon={<Search className="w-4 h-4" />}
            placeholder="Tìm kiếm theo tên hoặc SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-36">
            <DropdownCustom
              value={filterSide}
              onSelect={(val) => setFilterSide(val)}
              prefixIcon={<Filter className="w-3.5 h-3.5" />}
              options={[
                { label: "Bên: Tất cả", value: "all" },
                { label: "Nhà Trai", value: "nha-trai" },
                { label: "Nhà Gái", value: "nha-gai" },
              ]}
            />
          </div>

          <div className="w-44">
            <DropdownCustom
              value={filterAttending}
              onSelect={(val) => setFilterAttending(val)}
              options={[
                { label: "Trạng thái: Tất cả", value: "all" },
                { label: "🎉 Tham dự", value: "true" },
                { label: "💌 Không tham dự", value: "false" },
              ]}
            />
          </div>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel/CSV ({items.length})</span>
          </button>
        </div>
      </div>

      {/* Table with horizontal scroll on mobile, resizable columns, and sorting */}
      <TableResize
        data={sortedItems}
        columns={columns}
        loading={loading}
        sortKey={sortKey}
        sortType={sortType}
        onSort={handleSort}
        keyExtractor={(item) => item.id}
        empty="Chưa có dữ liệu phản hồi nào phù hợp với bộ lọc"
      />
    </div>
  );
}
