"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Search, Filter, Download, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { RsvpItem } from "../types";
import { InputCustom } from "@/app/components/ui/InputCustom";
import { DropdownCustom } from "@/app/components/ui/DropdownCustom";
import { TableResize, TColumn, ESortType } from "@/app/components/ui/TableResize";
import { exportRsvpsToExcel } from "@/lib/exportExcel";
import { PaginationCustom } from "@/app/components/ui/PaginationCustom";

interface RsvpTabProps {
  rsvps: RsvpItem[];
  onDeleteRsvp: (id: string) => void;
}

export default function RsvpTab({ rsvps, onDeleteRsvp }: RsvpTabProps) {
  const [items, setItems] = useState<RsvpItem[]>(rsvps);
  const [totalCount, setTotalCount] = useState<number>(rsvps.length);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSide, setFilterSide] = useState<string>("all");
  const [filterAttending, setFilterAttending] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState<string | undefined>("createdAt");
  const [sortType, setSortType] = useState<ESortType>(ESortType.DESC);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Hàm gọi API lọc & phân trang từ Server
  const fetchFilteredRsvps = useCallback(
    async (
      search: string,
      side: string,
      attending: string,
      page: number,
      limit: number,
      sort: string | undefined,
      type: ESortType
    ) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (side !== "all") params.set("side", side);
        if (attending !== "all") params.set("attending", attending);
        if (search.trim()) params.set("search", search.trim());
        if (sort) params.set("sortKey", sort);
        params.set("sortType", type);

        const res = await fetch(`/api/rsvp?${params.toString()}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setItems(data.data);
          setTotalCount(data.total ?? data.data.length);
        }
      } catch (err) {
        console.error("Lỗi khi lọc RSVP từ server:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Reset trang về 1 khi lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterSide, filterAttending]);

  // Debounce tìm kiếm và gọi server khi filter, page, sort thay đổi
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFilteredRsvps(
        searchTerm,
        filterSide,
        filterAttending,
        currentPage,
        pageSize,
        sortKey,
        sortType
      );
    }, 250);

    return () => clearTimeout(timer);
  }, [
    searchTerm,
    filterSide,
    filterAttending,
    currentPage,
    pageSize,
    sortKey,
    sortType,
    fetchFilteredRsvps,
  ]);

  const handleDelete = async (id: string) => {
    onDeleteRsvp(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    setTotalCount((prev) => Math.max(0, prev - 1));
  };

  // Xuất file Excel (.xlsx) chuẩn chỉnh, cột rộng rãi, có thống kê & tiêu đề
  const handleExportExcel = async () => {
    try {
      const params = new URLSearchParams();
      params.set("all", "true");
      if (filterSide !== "all") params.set("side", filterSide);
      if (filterAttending !== "all") params.set("attending", filterAttending);
      if (searchTerm.trim()) params.set("search", searchTerm.trim());

      const res = await fetch(`/api/rsvp?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        exportRsvpsToExcel(data.data);
      }
    } catch {
      exportRsvpsToExcel(items);
    }
  };

  const handleSort = (column: TColumn<RsvpItem>, type: ESortType) => {
    const key = (column.dataIndex || column.name || column.key) as string;
    setSortKey(key);
    setSortType(type);
  };

  const columns = useMemo<TColumn<RsvpItem>[]>(
    () => [
      {
        title: "Khách mời",
        dataIndex: "name",
        key: "name",
        sortable: true,
        width: 170,
        render: (_, r) => (
          <span style={{ fontWeight: 500, color: "#262626", fontSize: 14 }}>
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
          <span style={{ color: "#595959", fontSize: 14 }}>
            {r.phone || "-"}
          </span>
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
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "2px 8px",
                fontSize: 12,
                borderRadius: 4,
                background: "#f6ffed",
                border: "1px solid #b7eb8f",
                color: "#52c41a",
                fontWeight: 400,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#52c41a",
                }}
              />
              Tham dự
            </span>
          ) : (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "2px 8px",
                fontSize: 12,
                borderRadius: 4,
                background: "#fff1f0",
                border: "1px solid #ffa39e",
                color: "#cf1322",
                fontWeight: 400,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#cf1322",
                }}
              />
              Không tham dự
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
          <span style={{ fontWeight: 500, color: "#262626", fontSize: 14 }}>
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
            style={{
              display: "inline-block",
              padding: "2px 8px",
              fontSize: 12,
              borderRadius: 4,
              background: r.side === "nha-trai" ? "#e6f4ff" : "#fff0f6",
              border:
                r.side === "nha-trai"
                  ? "1px solid #91caff"
                  : "1px solid #ffadd2",
              color: r.side === "nha-trai" ? "#0958d9" : "#c41d7f",
              fontWeight: 400,
            }}
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
          <span
            title={r.note || ""}
            style={{
              color: "#595959",
              fontSize: 14,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block",
            }}
          >
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
          <span style={{ color: "#8c8c8c", fontSize: 13 }}>
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
        width: 140,
        align: "center",
        resizable: false,
        render: (_, r) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(r.id);
            }}
            style={{
              border: "none",
              background: "transparent",
              color: "#ff4d4f",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: 4,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#fff1f0")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            title="Xóa phản hồi"
          >
            <Trash2 style={{ width: 15, height: 15 }} />
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
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel (.xlsx) ({totalCount})</span>
          </button>
        </div>
      </div>

      {/* Table with horizontal scroll on mobile, resizable columns, and sorting */}
      <TableResize
        data={items}
        columns={columns}
        loading={loading}
        sortKey={sortKey}
        sortType={sortType}
        onSort={handleSort}
        bordered
        resizable
        keyExtractor={(item) => item.id}
        empty="Chưa có dữ liệu phản hồi nào phù hợp với bộ lọc"
      />

      <PaginationCustom
        totalItems={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 20, 50, 100]}
        itemUnitName="phản hồi"
      />
    </div>
  );
}
