"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Search,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Edit2,
  MessageCircle,
  Smartphone,
  Download,
  Filter,
  Send,
  Sparkles,
  Armchair,
  CheckCircle2,
  Clock,
  XCircle,
  Table as TableIcon,
  RefreshCw,
  X,
} from "lucide-react";
import { GuestItem } from "../types";
import { InputCustom } from "@/app/components/ui/InputCustom";
import { DropdownCustom } from "@/app/components/ui/DropdownCustom";
import { TableResize, TColumn, ESortType } from "@/app/components/ui/TableResize";

import CateringCalculator from "./components/CateringCalculator";
import SmartPasteModal from "./components/SmartPasteModal";
import EditGuestModal from "./components/EditGuestModal";
import MobilePreviewDrawer from "./components/MobilePreviewDrawer";
import ZaloMessageModal from "./components/ZaloMessageModal";
import FloatingBulkBar from "./components/FloatingBulkBar";
import SeatingPlannerView from "./components/SeatingPlannerView";
import { exportGuestsToExcel } from "@/lib/exportExcel";
import { PaginationCustom } from "@/app/components/ui/PaginationCustom";
import { sendZaloOneClick } from "@/lib/zaloInvite";

export default function GuestsMasterPage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dữ liệu chính
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "seating">("table");

  // Bộ lọc & Tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSide, setFilterSide] = useState<string>("all");
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [filterSent, setFilterSent] = useState<string>("all");
  const [filterRsvp, setFilterRsvp] = useState<string>("all");
  const [sortKey, setSortKey] = useState<string | undefined>("createdAt");
  const [sortType, setSortType] = useState<ESortType>(ESortType.DESC);

  // Chọn hàng loạt (Multi-select)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modals & Drawers
  const [showSmartPaste, setShowSmartPaste] = useState(false);
  const [showSingleAdd, setShowSingleAdd] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestItem | null>(null);
  const [previewGuest, setPreviewGuest] = useState<GuestItem | null>(null);
  const [zaloGuest, setZaloGuest] = useState<GuestItem | null>(null);
  const [zaloToast, setZaloToast] = useState<string | null>(null);

  // Form thêm 1 khách
  const [singleForm, setSingleForm] = useState({
    name: "",
    phone: "",
    side: "nha-trai",
    group: "Bạn bè",
    table: "",
    note: "",
  });
  const [addingSingle, setAddingSingle] = useState(false);

  // Dữ liệu phân trang Server-side cho Bảng TableResize
  const [tableGuests, setTableGuests] = useState<GuestItem[]>([]);
  const [totalTableGuests, setTotalTableGuests] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);

  // Fetch toàn bộ khách mời (CateringCalculator, SeatingPlanner, Excel Export)
  const fetchAllGuests = useCallback(async () => {
    try {
      const res = await fetch("/api/guests?all=true");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setGuests(data.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải toàn bộ khách mời:", err);
    }
  }, []);

  // Fetch danh sách khách theo API phân trang Server-side
  const fetchTableGuests = useCallback(async () => {
    setTableLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageSize),
        search: searchTerm.trim(),
        side: filterSide,
        group: filterGroup,
        isSent: filterSent,
        rsvp: filterRsvp,
        sortKey: sortKey || "createdAt",
        sortType: sortType || "desc",
      });
      const res = await fetch(`/api/guests?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTableGuests(data.data);
        setTotalTableGuests(data.total ?? data.data.length);
      }
    } catch (err) {
      console.error("Lỗi khi tải bảng phân trang khách mời:", err);
    } finally {
      setTableLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    searchTerm,
    filterSide,
    filterGroup,
    filterSent,
    filterRsvp,
    sortKey,
    sortType,
  ]);

  const refreshAll = useCallback(() => {
    fetchAllGuests();
    fetchTableGuests();
  }, [fetchAllGuests, fetchTableGuests]);

  const fetchGuests = refreshAll;

  // Kiểm tra quyền đăng nhập
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/check");
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          fetchAllGuests();
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
  }, [router, fetchAllGuests]);

  // Gọi fetchTableGuests khi đổi page, filter, search (debounce 250ms)
  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      fetchTableGuests();
    }, 250);
    return () => clearTimeout(timer);
  }, [isAuthenticated, fetchTableGuests]);

  // Tạo URL cá nhân hóa
  const getPersonalizedUrl = (guest: GuestItem) => {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin;
    const path = guest.side === "nha-gai" ? "/nha-gai" : "";
    return `${origin}${path}?g=${guest.slug || encodeURIComponent(guest.name)}`;
  };

  // Toggle nhanh trạng thái đã gửi thiệp
  const handleToggleSent = async (guest: GuestItem) => {
    const nextSent = !guest.isSent;
    try {
      const res = await fetch("/api/guests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: guest.id, isSent: nextSent }),
      });
      if (res.ok) {
        setGuests((prev) =>
          prev.map((g) => (g.id === guest.id ? { ...g, isSent: nextSent } : g))
        );
        setTableGuests((prev) =>
          prev.map((g) => (g.id === guest.id ? { ...g, isSent: nextSent } : g))
        );
      }
    } catch {
      alert("Lỗi khi cập nhật trạng thái gửi!");
    }
  };

  // Xóa 1 khách
  const handleDeleteGuest = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa khách mời "${name}"?`)) return;
    try {
      const res = await fetch(`/api/guests?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setGuests((prev) => prev.filter((g) => g.id !== id));
        setTableGuests((prev) => prev.filter((g) => g.id !== id));
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        const newTotal = Math.max(0, totalTableGuests - 1);
        setTotalTableGuests(newTotal);

        const maxPage = Math.max(1, Math.ceil(newTotal / pageSize));
        if (currentPage > maxPage) {
          setCurrentPage(maxPage);
        } else {
          fetchTableGuests();
        }
        fetchAllGuests();
      } else {
        alert("Không thể xóa khách mời!");
      }
    } catch {
      alert("Không thể xóa khách mời!");
    }
  };

  // Gán bàn nhanh
  const handleAssignTable = async (guestId: string, table: string) => {
    try {
      const res = await fetch("/api/guests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: guestId, table: table || null }),
      });
      if (res.ok) {
        setGuests((prev) =>
          prev.map((g) => (g.id === guestId ? { ...g, table: table || null } : g))
        );
        setTableGuests((prev) =>
          prev.map((g) => (g.id === guestId ? { ...g, table: table || null } : g))
        );
      }
    } catch {
      alert("Lỗi khi gán bàn tiệc!");
    }
  };

  // Cập nhật hàng loạt (Floating Bar)
  const handleBulkUpdate = async (updateData: {
    isSent?: boolean;
    group?: string;
    table?: string;
  }) => {
    try {
      const res = await fetch("/api/guests/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, ...updateData }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchGuests();
        setSelectedIds([]);
      } else {
        alert(data.message || "Lỗi cập nhật hàng loạt!");
      }
    } catch {
      alert("Lỗi khi gọi API cập nhật hàng loạt!");
    }
  };

  // Xóa hàng loạt
  const handleBulkDelete = async () => {
    if (!confirm(`Bạn có chắc muốn xóa ${selectedIds.length} khách mời đã chọn?`))
      return;
    try {
      const res = await fetch("/api/guests/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (res.ok) {
        const deletedIds = [...selectedIds];
        setGuests((prev) => prev.filter((g) => !deletedIds.includes(g.id)));
        setTableGuests((prev) => prev.filter((g) => !deletedIds.includes(g.id)));
        const newTotal = Math.max(0, totalTableGuests - deletedIds.length);
        setTotalTableGuests(newTotal);
        setSelectedIds([]);

        const maxPage = Math.max(1, Math.ceil(newTotal / pageSize));
        if (currentPage > maxPage) {
          setCurrentPage(maxPage);
        } else {
          fetchTableGuests();
        }
        fetchAllGuests();
      } else {
        alert("Lỗi khi xóa hàng loạt!");
      }
    } catch {
      alert("Lỗi khi xóa hàng loạt!");
    }
  };

  // Copy toàn bộ link của các khách đã chọn
  const handleCopySelectedLinks = () => {
    const selectedGuests = guests.filter((g) => selectedIds.includes(g.id));
    const lines = selectedGuests.map((g) => `${g.name}: ${getPersonalizedUrl(g)}`);
    navigator.clipboard.writeText(lines.join("\n"));
  };

  // Submit thêm 1 khách
  const handleCreateSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleForm.name.trim()) return;
    setAddingSingle(true);
    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(singleForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGuests((prev) => [data.data, ...prev]);
        setTableGuests((prev) => [data.data, ...prev]);
        setTotalTableGuests((c) => c + 1);
        setShowSingleAdd(false);
        setSingleForm({
          name: "",
          phone: "",
          side: "nha-trai",
          group: "Bạn bè",
          table: "",
          note: "",
        });
        fetchGuests();
      } else {
        alert(data.message || "Không thể thêm khách!");
      }
    } catch {
      alert("Lỗi kết nối khi thêm khách!");
    } finally {
      setAddingSingle(false);
    }
  };

  // Danh sách các nhóm có sẵn trong DB để đổ vào Dropdown
  const existingGroups = useMemo(() => {
    const groups = new Set<string>();
    guests.forEach((g) => {
      if (g.group) groups.add(g.group);
    });
    return Array.from(groups);
  }, [guests]);

  // Lọc và tìm kiếm
  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      // Tìm kiếm
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const matchName = g.name.toLowerCase().includes(q);
        const matchPhone = g.phone && g.phone.includes(q);
        const matchGroup = g.group && g.group.toLowerCase().includes(q);
        const matchTable = g.table && g.table.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchGroup && !matchTable) return false;
      }

      // Lọc Bên
      if (filterSide !== "all" && g.side !== filterSide) return false;

      // Lọc Nhóm
      if (filterGroup !== "all" && g.group !== filterGroup) return false;

      // Lọc Trạng thái gửi
      if (filterSent !== "all") {
        const isSentBool = filterSent === "true";
        if (Boolean(g.isSent) !== isSentBool) return false;
      }

      // Lọc RSVP
      if (filterRsvp !== "all") {
        const rsvp = g.rsvps?.[0];
        if (filterRsvp === "attending" && (!rsvp || !rsvp.attending)) return false;
        if (filterRsvp === "declined" && (!rsvp || rsvp.attending !== false)) return false;
        if (filterRsvp === "none" && rsvp) return false;
      }

      return true;
    });
  }, [guests, searchTerm, filterSide, filterGroup, filterSent, filterRsvp]);

  // Sắp xếp
  const sortedGuests = useMemo(() => {
    if (!sortKey) return filteredGuests;

    return [...filteredGuests].sort((a, b) => {
      let valA: any = a[sortKey as keyof GuestItem];
      let valB: any = b[sortKey as keyof GuestItem];

      if (sortKey === "createdAt") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return sortType === ESortType.ASC ? -1 : 1;
      if (valA > valB) return sortType === ESortType.ASC ? 1 : -1;
      return 0;
    });
  }, [filteredGuests, sortKey, sortType]);

  // Reset trang về 1 khi lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterSide, filterGroup, filterSent, filterRsvp]);

  // Xuất file Excel (.xlsx) chuẩn chỉnh, cột rộng rãi, có thống kê & tiêu đề (Toàn bộ khách)
  const handleExportExcel = () => {
    exportGuestsToExcel(guests);
  };

  // Cấu hình bảng TableResize
  const columns: TColumn<GuestItem>[] = useMemo(
    () => [
      {
        title: (
          <input
            type="checkbox"
            checked={
              tableGuests.length > 0 &&
              tableGuests.every((g) => selectedIds.includes(g.id))
            }
            onChange={(e) => {
              if (e.target.checked) {
                const pageIds = tableGuests.map((g) => g.id);
                setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
              } else {
                const pageIds = new Set(tableGuests.map((g) => g.id));
                setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)));
              }
            }}
            className="w-4 h-4 rounded text-rose-600 cursor-pointer"
          />
        ),
        width: 45,
        align: "center",
        resizable: false,
        render: (_: any, record: GuestItem) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(record.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedIds((prev) => [...prev, record.id]);
              } else {
                setSelectedIds((prev) => prev.filter((id) => id !== record.id));
              }
            }}
            className="w-4 h-4 rounded text-rose-600 cursor-pointer"
          />
        ),
      },
      {
        title: "STT",
        width: 55,
        align: "center",
        render: (_: any, __: GuestItem, index: number) => (
          <span className="text-xs text-gray-400 font-mono">
            {(currentPage - 1) * pageSize + index + 1}
          </span>
        ),
      },
      {
        title: "Khách Mời",
        name: "name",
        width: 210,
        sortable: true,
        render: (value: string, record: GuestItem) => (
          <div>
            <div className="font-bold text-gray-900 text-sm">{value}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {record.phone && (
                <span className="text-[11px] text-gray-500 font-mono">
                  {record.phone}
                </span>
              )}
              {record.group && (
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  {record.group}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        title: "Bên Tiệc",
        name: "side",
        width: 110,
        sortable: true,
        align: "center",
        render: (side: string) =>
          side === "nha-trai" ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Nhà Trai
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              Nhà Gái
            </span>
          ),
      },
      {
        title: "Bàn Tiệc (Ngồi 8)",
        name: "table",
        width: 120,
        sortable: true,
        align: "center",
        render: (table: string | null, record: GuestItem) =>
          table ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              <Armchair className="w-3 h-3 text-amber-600" />
              <span>{table}</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                const t = prompt("Gán số bàn tiệc cho khách này (ví dụ: Bàn 01):");
                if (t && t.trim()) handleAssignTable(record.id, t.trim());
              }}
              className="text-[11px] text-gray-400 hover:text-amber-600 hover:underline cursor-pointer"
            >
              + Xếp bàn
            </button>
          ),
      },
      {
        title: "Đã Gửi Thiệp",
        name: "isSent",
        width: 110,
        sortable: true,
        align: "center",
        render: (isSent: boolean, record: GuestItem) => (
          <button
            type="button"
            onClick={() => handleToggleSent(record)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
              isSent
                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {isSent ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã gửi</span>
              </>
            ) : (
              <span>Chưa gửi</span>
            )}
          </button>
        ),
      },
      {
        title: "Phản Hồi RSVP",
        width: 150,
        render: (_: any, record: GuestItem) => {
          const rsvp = record.rsvps?.[0];
          if (!rsvp) {
            return (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Chưa phản hồi</span>
              </span>
            );
          }
          if (rsvp.attending) {
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tham dự ({rsvp.guestCount || 1} người)</span>
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
              <XCircle className="w-3.5 h-3.5 text-gray-400" />
              <span>Không thể đến</span>
            </span>
          );
        },
      },
      {
        title: "Mừng Cưới",
        width: 140,
        render: (_: any, record: GuestItem) => {
          const gifts = record.gifts || [];
          const total = gifts.reduce((s, g) => s + (g.amount || 0), 0);
          if (total > 0) {
            return (
              <span className="font-mono font-bold text-xs text-emerald-600">
                {total.toLocaleString("vi-VN")} đ
              </span>
            );
          }
          return <span className="text-xs text-gray-400">-</span>;
        },
      },
      {
        title: "Thao Tác",
        width: 180,
        align: "center",
        render: (_: any, record: GuestItem) => (
          <div className="flex items-center justify-center gap-1.5">
            {/* Nút gửi Zalo 1-Click */}
            <button
              type="button"
              onClick={async () => {
                if (record.phone) {
                  await sendZaloOneClick(record, (guestId) => {
                    setTableGuests((prev) =>
                      prev.map((g) => (g.id === guestId ? { ...g, isSent: true } : g))
                    );
                    setGuests((prev) =>
                      prev.map((g) => (g.id === guestId ? { ...g, isSent: true } : g))
                    );
                  });
                  setZaloToast(`Đã sao chép tin nhắn mời ${record.name}! Đang mở Zalo...`);
                  setTimeout(() => setZaloToast(null), 3000);
                } else {
                  setZaloGuest(record);
                }
              }}
              title="Gửi thiệp Zalo 1-Click (Tự động copy & mở Zalo)"
              className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition cursor-pointer flex items-center gap-1 border border-blue-200"
            >
              <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Zalo</span>
            </button>

            {/* Nút Live Preview iPhone */}
            <button
              type="button"
              onClick={() => setPreviewGuest(record)}
              title="Xem thiệp trên iPhone"
              className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
            </button>

            {/* Sửa */}
            <button
              type="button"
              onClick={() => setEditingGuest(record)}
              title="Chỉnh sửa"
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {/* Xóa */}
            <button
              type="button"
              onClick={() => handleDeleteGuest(record.id, record.name)}
              title="Xóa"
              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tableGuests, selectedIds, currentPage, pageSize]
  );

  if (authChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/40 via-white to-amber-50/30 text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1550px] mx-auto space-y-6">
        {/* Top Navigation & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-rose-600 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Về Tổng Quan Admin</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
              <span>Trung Tâm Điều Phối Khách Mời & Xếp Bàn Tiệc</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                {guests.length} khách
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchGuests}
              className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition shadow-xs cursor-pointer"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* THƯỚC ĐO MÂM CỖ BÀN 8 */}
        <CateringCalculator guests={guests} />

        {/* TOOLBAR CHÍNH */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Tìm kiếm */}
            <div className="flex-1 max-w-md">
              <InputCustom
                placeholder="Tìm theo tên khách, SĐT, nhóm, số bàn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4 text-gray-400" />}
              />
            </div>

            {/* Switch chế độ xem: Bảng vs Xếp bàn */}
            <div className="inline-flex p-1 rounded-xl bg-gray-100 border border-gray-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Bảng Danh Sách</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("seating")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === "seating"
                    ? "bg-white text-amber-700 shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Armchair className="w-3.5 h-3.5 text-amber-600" />
                <span>Sơ Đồ Xếp Bàn (Ngồi 8)</span>
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-gray-500" />
                <span>Xuất Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSmartPaste(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-90 text-white text-xs font-bold shadow-md shadow-rose-200 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Dán Danh Sách Nhanh</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSingleAdd(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm 1 Khách</span>
              </button>
            </div>
          </div>

          {/* Bộ lọc đa tầng (Chỉ hiện khi ở Table View) */}
          {viewMode === "table" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100 text-xs">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">
                  Bên tiệc
                </label>
                <DropdownCustom<string>
                  value={filterSide}
                  onSelect={(v) => setFilterSide(v)}
                  options={[
                    { label: "Tất cả các bên", value: "all" },
                    { label: "🤵 Nhà Trai (06.12)", value: "nha-trai" },
                    { label: "👰 Nhà Gái (05.12)", value: "nha-gai" },
                  ]}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">
                  Nhóm khách
                </label>
                <DropdownCustom<string>
                  value={filterGroup}
                  onSelect={(v) => setFilterGroup(v)}
                  options={[
                    { label: "Tất cả nhóm", value: "all" },
                    ...existingGroups.map((g) => ({ label: g, value: g })),
                  ]}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">
                  Trạng thái gửi
                </label>
                <DropdownCustom<string>
                  value={filterSent}
                  onSelect={(v) => setFilterSent(v)}
                  options={[
                    { label: "Tất cả", value: "all" },
                    { label: "✅ Đã gửi thiệp", value: "true" },
                    { label: "⏳ Chưa gửi", value: "false" },
                  ]}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">
                  Phản hồi RSVP
                </label>
                <DropdownCustom<string>
                  value={filterRsvp}
                  onSelect={(v) => setFilterRsvp(v)}
                  options={[
                    { label: "Tất cả phản hồi", value: "all" },
                    { label: "✅ Xác nhận đi", value: "attending" },
                    { label: "❌ Không thể đến", value: "declined" },
                    { label: "⏳ Chưa phản hồi", value: "none" },
                  ]}
                />
              </div>
            </div>
          )}
        </div>

        {/* NỘI DUNG CHÍNH (TABLE HOẶC SEATING) */}
        {viewMode === "table" ? (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-3 sm:p-5 space-y-4">
            <TableResize<GuestItem>
              columns={columns}
              data={tableGuests}
              loading={tableLoading}
              keyExtractor={(item) => item.id}
              bordered
              onSort={(col, type) => {
                setSortKey(col.name);
                setSortType(type);
              }}
              tableHeight={620}
            />

            <PaginationCustom
              totalItems={totalTableGuests}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[10, 20, 50, 100]}
              itemUnitName="khách"
            />
          </div>
        ) : (
          <SeatingPlannerView
            guests={guests}
            onAssignTable={handleAssignTable}
          />
        )}
      </div>

      {/* Floating Multi-select Bar */}
      <FloatingBulkBar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
        onBulkUpdate={handleBulkUpdate}
        onBulkDelete={handleBulkDelete}
        onCopyLinks={handleCopySelectedLinks}
      />

      {/* Modal Nhập hàng loạt */}
      <SmartPasteModal
        isOpen={showSmartPaste}
        onClose={() => setShowSmartPaste(false)}
        onSuccess={fetchGuests}
      />

      {/* Modal Thêm 1 khách */}
      {showSingleAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">
                Thêm Khách Mời Mới
              </h3>
              <button
                type="button"
                onClick={() => setShowSingleAdd(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSingle} className="mt-4 space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Tên khách mời (hiển thị trên thiệp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={singleForm.name}
                  onChange={(e) => setSingleForm({ ...singleForm, name: e.target.value })}
                  placeholder="Ví dụ: Anh Nam, Gia đình Bác Hùng..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-rose-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={singleForm.phone}
                    onChange={(e) => setSingleForm({ ...singleForm, phone: e.target.value })}
                    placeholder="09xxx..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-rose-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Bên tiệc</label>
                  <select
                    value={singleForm.side}
                    onChange={(e) => setSingleForm({ ...singleForm, side: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-rose-500 bg-white"
                  >
                    <option value="nha-trai">🤵 Nhà Trai (06.12)</option>
                    <option value="nha-gai">👰 Nhà Gái (05.12)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Nhóm khách</label>
                  <input
                    type="text"
                    value={singleForm.group}
                    onChange={(e) => setSingleForm({ ...singleForm, group: e.target.value })}
                    placeholder="Ví dụ: Bạn Cấp 3, Họ hàng..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Số bàn tiệc</label>
                  <input
                    type="text"
                    value={singleForm.table}
                    onChange={(e) => setSingleForm({ ...singleForm, table: e.target.value })}
                    placeholder="Ví dụ: Bàn 01..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Ghi chú riêng</label>
                <textarea
                  value={singleForm.note}
                  onChange={(e) => setSingleForm({ ...singleForm, note: e.target.value })}
                  placeholder="Ghi chú thêm..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-rose-500 resize-none text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowSingleAdd(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={addingSingle}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer shadow-md disabled:opacity-50"
                >
                  {addingSingle ? "Đang tạo..." : "Tạo link thiệp"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chỉnh sửa */}
      <EditGuestModal
        guest={editingGuest}
        isOpen={Boolean(editingGuest)}
        onClose={() => setEditingGuest(null)}
        onSuccess={fetchGuests}
      />

      {/* Drawer Live Preview iPhone */}
      <MobilePreviewDrawer
        guest={previewGuest}
        isOpen={Boolean(previewGuest)}
        onClose={() => setPreviewGuest(null)}
      />

      {/* Toast thông báo 1-Click Zalo */}
      {zaloToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white font-medium px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm animate-bounce">
          <MessageCircle className="w-5 h-5 shrink-0" />
          <span>{zaloToast}</span>
        </div>
      )}

      {/* Modal Mẫu tin nhắn Zalo */}
      <ZaloMessageModal
        guest={zaloGuest}
        isOpen={Boolean(zaloGuest)}
        onClose={() => setZaloGuest(null)}
        onSentUpdated={(guestId) => {
          setTableGuests((prev) =>
            prev.map((g) => (g.id === guestId ? { ...g, isSent: true } : g))
          );
          setGuests((prev) =>
            prev.map((g) => (g.id === guestId ? { ...g, isSent: true } : g))
          );
        }}
      />
    </div>
  );
}
