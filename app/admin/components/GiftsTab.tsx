"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Plus,
  Download,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Wallet,
  Sparkles,
  QrCode,
  Banknote,
  X,
  AlertCircle,
  Building,
} from "lucide-react";
import { GiftItem } from "../types";
import { InputCustom } from "@/app/components/ui/InputCustom";
import { DropdownCustom } from "@/app/components/ui/DropdownCustom";
import { TableResize, TColumn, ESortType } from "@/app/components/ui/TableResize";
import { exportGiftsToExcel } from "@/lib/exportExcel";
import { PaginationCustom } from "@/app/components/ui/PaginationCustom";
import { Snackbar, SnackbarRefs } from "@/app/components/ui/Snackbar";

interface GiftsTabProps {
  gifts: GiftItem[];
  onRefresh: () => void;
  onCreateGift: (data: Partial<GiftItem>) => Promise<boolean>;
  onUpdateGift: (id: string, data: Partial<GiftItem>) => Promise<boolean>;
  onDeleteGift: (id: string) => Promise<boolean>;
}

export default function GiftsTab({
  gifts,
  onRefresh,
  onCreateGift,
  onUpdateGift,
  onDeleteGift,
}: GiftsTabProps) {
  const snackbarRef = useRef<SnackbarRefs>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSide, setFilterSide] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [sortKey, setSortKey] = useState<string | undefined>("createdAt");
  const [sortType, setSortType] = useState<ESortType>(ESortType.DESC);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingGift, setEditingGift] = useState<GiftItem | null>(null);
  const [modalForm, setModalForm] = useState({
    guestName: "",
    amount: "",
    side: "nha-trai",
    method: "QR",
    status: "RECEIVED",
    phone: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Mở modal thêm mới
  const handleOpenCreateModal = () => {
    setEditingGift(null);
    setModalForm({
      guestName: "",
      amount: "",
      side: "nha-trai",
      method: "QR",
      status: "RECEIVED",
      phone: "",
      note: "",
    });
    setShowModal(true);
  };

  // Mở modal chỉnh sửa
  const handleOpenEditModal = (gift: GiftItem) => {
    setEditingGift(gift);
    setModalForm({
      guestName: gift.guestName,
      amount: gift.amount ? gift.amount.toLocaleString("vi-VN") : "",
      side: gift.side || "nha-trai",
      method: gift.method || "QR",
      status: gift.status || "RECEIVED",
      phone: gift.phone || "",
      note: gift.note || "",
    });
    setShowModal(true);
  };

  // Submit Modal (Thêm mới hoặc Cập nhật)
  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.guestName.trim()) {
      snackbarRef.current?.showSnackbar({
        message: "Vui lòng nhập tên người mừng cưới",
        severity: "warning",
      });
      return;
    }

    const numericAmount = Number(modalForm.amount.replace(/\D/g, "")) || 0;
    setSubmitting(true);

    try {
      if (editingGift) {
        const ok = await onUpdateGift(editingGift.id, {
          guestName: modalForm.guestName.trim(),
          amount: numericAmount,
          side: modalForm.side,
          method: modalForm.method,
          status: modalForm.status,
          phone: modalForm.phone.trim() || null,
          note: modalForm.note.trim() || null,
        });
        if (ok) {
          setShowModal(false);
          onRefresh();
        }
      } else {
        const ok = await onCreateGift({
          guestName: modalForm.guestName.trim(),
          amount: numericAmount,
          side: modalForm.side,
          method: modalForm.method,
          status: modalForm.status,
          phone: modalForm.phone.trim() || null,
          note: modalForm.note.trim() || null,
        });
        if (ok) {
          setShowModal(false);
          onRefresh();
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Duyệt nhanh 1 click từ PENDING -> RECEIVED
  const handleQuickApprove = async (gift: GiftItem) => {
    await onUpdateGift(gift.id, { status: "RECEIVED" });
    onRefresh();
  };

  // Đổi trạng thái giữa RECEIVED và PENDING
  const handleToggleStatus = async (gift: GiftItem) => {
    const nextStatus = gift.status === "RECEIVED" ? "PENDING" : "RECEIVED";
    await onUpdateGift(gift.id, { status: nextStatus });
    onRefresh();
  };

  // Thống kê tổng số tiền
  const summary = useMemo(() => {
    const received = gifts.filter((g) => g.status === "RECEIVED");
    const totalAmount = received.reduce((s, g) => s + (g.amount || 0), 0);
    const nhaTraiAmount = received
      .filter((g) => g.side === "nha-trai")
      .reduce((s, g) => s + (g.amount || 0), 0);
    const nhaGaiAmount = received
      .filter((g) => g.side === "nha-gai")
      .reduce((s, g) => s + (g.amount || 0), 0);
    const pendingCount = gifts.filter((g) => g.status === "PENDING").length;

    return {
      totalAmount,
      nhaTraiAmount,
      nhaGaiAmount,
      receivedCount: received.length,
      pendingCount,
    };
  }, [gifts]);

  const [items, setItems] = useState<GiftItem[]>(gifts);
  const [totalCount, setTotalCount] = useState<number>(gifts.length);
  const [loading, setLoading] = useState(false);
  const [serverSummary, setServerSummary] = useState(summary);

  // Fetch danh sách mừng cưới từ Server có phân trang
  const fetchServerGifts = useCallback(
    async (
      page: number,
      limit: number,
      search: string,
      side: string,
      status: string,
      method: string,
      sort: string | undefined,
      type: ESortType
    ) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          search: search.trim(),
          side,
          status,
          method,
          sortKey: sort || "createdAt",
          sortType: type || "desc",
        });
        const res = await fetch(`/api/gifts?${params.toString()}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setItems(data.data);
          setTotalCount(data.total ?? data.data.length);
          if (data.summary) {
            setServerSummary(data.summary);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải mừng cưới:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Reset trang về 1 khi lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterSide, filterStatus, filterMethod]);

  // Debounce gọi API phân trang server
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServerGifts(
        currentPage,
        pageSize,
        searchTerm,
        filterSide,
        filterStatus,
        filterMethod,
        sortKey,
        sortType
      );
    }, 250);
    return () => clearTimeout(timer);
  }, [
    currentPage,
    pageSize,
    searchTerm,
    filterSide,
    filterStatus,
    filterMethod,
    sortKey,
    sortType,
    gifts,
    fetchServerGifts,
  ]);

  const handleDelete = async (record: GiftItem) => {
    if (!confirm(`Bạn có chắc muốn xóa mừng cưới của ${record.guestName}?`)) return;
    const ok = await onDeleteGift(record.id);
    if (!ok) return;

    setItems((prev) => prev.filter((item) => item.id !== record.id));
    const newTotal = Math.max(0, totalCount - 1);
    setTotalCount(newTotal);

    const maxPage = Math.max(1, Math.ceil(newTotal / pageSize));
    const targetPage = currentPage > maxPage ? maxPage : currentPage;
    if (targetPage !== currentPage) {
      setCurrentPage(targetPage);
    } else {
      fetchServerGifts(
        targetPage,
        pageSize,
        searchTerm,
        filterSide,
        filterStatus,
        filterMethod,
        sortKey,
        sortType
      );
    }
    onRefresh();
  };

  const handleDeleteRef = useRef(handleDelete);
  handleDeleteRef.current = handleDelete;

  // Xuất file Excel (.xlsx) chuẩn chỉnh, chia cột và định dạng chuyên nghiệp
  const handleExportExcel = async () => {
    try {
      const params = new URLSearchParams({
        all: "true",
        search: searchTerm.trim(),
        side: filterSide,
        status: filterStatus,
        method: filterMethod,
      });
      const res = await fetch(`/api/gifts?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        exportGiftsToExcel(data.data);
      }
    } catch {
      exportGiftsToExcel(gifts);
    }
  };

  // Cấu hình bảng TableResize
  const columns: TColumn<GiftItem>[] = useMemo(
    () => [
      {
        title: "STT",
        width: 60,
        align: "center",
        render: (_: any, __: GiftItem, index: number) => (
          <span className="text-xs text-gray-500 font-medium">
            {(currentPage - 1) * pageSize + index + 1}
          </span>
        ),
      },
      {
        title: "Người Mừng Cưới",
        name: "guestName",
        width: 220,
        sortable: true,
        render: (value: string, record: GiftItem) => (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 text-sm">{value}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {record.phone && (
                <span className="text-[11px] text-gray-500 font-mono">
                  {record.phone}
                </span>
              )}
              {record.guest && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium border border-emerald-200">
                  Khách mời
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        title: "Số Tiền",
        name: "amount",
        width: 150,
        sortable: true,
        render: (val: number) => (
          <span className="font-mono font-bold text-sm text-emerald-600">
            {(val || 0).toLocaleString("vi-VN")} đ
          </span>
        ),
      },
      {
        title: "Bên",
        name: "side",
        width: 120,
        sortable: true,
        align: "center",
        render: (side: string) =>
          side === "nha-trai" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              🤵 Nhà Trai
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              👰 Nhà Gái
            </span>
          ),
      },
      {
        title: "Hình Thức",
        name: "method",
        width: 120,
        sortable: true,
        align: "center",
        render: (method: string) =>
          method === "CASH" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Banknote className="w-3 h-3 text-emerald-600" />
              <span>Tiền mặt</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              <QrCode className="w-3 h-3 text-purple-600" />
              <span>VietQR</span>
            </span>
          ),
      },
      {
        title: "Trạng Thái",
        name: "status",
        width: 150,
        sortable: true,
        align: "center",
        render: (status: string, record: GiftItem) => (
          <div className="flex items-center justify-center gap-2">
            {status === "RECEIVED" ? (
              <button
                type="button"
                onClick={() => handleToggleStatus(record)}
                title="Bấm để chuyển về Chờ duyệt"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã nhận</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleQuickApprove(record)}
                title="Nhấn 1 chạm để xác nhận Đã nhận"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 hover:bg-emerald-600 hover:text-white transition cursor-pointer animate-pulse"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Duyệt nhận</span>
              </button>
            )}
          </div>
        ),
      },
      {
        title: "Ghi Chú",
        name: "note",
        width: 180,
        render: (note: string | null) => (
          <span className="text-xs text-gray-600 line-clamp-2" title={note || ""}>
            {note || "-"}
          </span>
        ),
      },
      {
        title: "Thời Gian",
        name: "createdAt",
        width: 150,
        sortable: true,
        render: (dateStr: string) => (
          <span className="text-xs text-gray-500 font-mono">
            {new Date(dateStr).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        ),
      },
      {
        title: "Thao Tác",
        width: 100,
        align: "center",
        render: (_: any, record: GiftItem) => (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenEditModal(record)}
              title="Chỉnh sửa"
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleDeleteRef.current(record)}
              title="Xóa"
              className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onDeleteGift, currentPage, pageSize]
  );

  const displaySummary = serverSummary || summary;

  return (
    <div className="space-y-6">
      {/* 4 Cards Thống kê tài chính */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Tổng tiền đã nhận */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 sm:p-5 rounded-2xl shadow-md">
          <div className="flex items-center justify-between opacity-90 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Tổng tiền đã nhận
            </span>
            <Wallet className="w-5 h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold truncate">
            {displaySummary.totalAmount.toLocaleString("vi-VN")} đ
          </p>
          <p className="text-xs opacity-80 mt-1">
            {displaySummary.receivedCount} giao dịch thành công
          </p>
        </div>

        {/* Tiền Nhà Trai */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-blue-100 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Nhà Trai (Lễ Thành Hôn)
            </span>
            <Building className="w-5 h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 truncate">
            {displaySummary.nhaTraiAmount.toLocaleString("vi-VN")} đ
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Mừng chú rể & gia đình nhà trai
          </p>
        </div>

        {/* Tiền Nhà Gái */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rose-100 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Nhà Gái (Lễ Vu Quy)
            </span>
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 truncate">
            {displaySummary.nhaGaiAmount.toLocaleString("vi-VN")} đ
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Mừng cô dâu & gia đình nhà gái
          </p>
        </div>

        {/* Chờ duyệt */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Chờ Đối Soát
            </span>
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 truncate">
            {displaySummary.pendingCount}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Khách báo hỷ cần duyệt
          </p>
        </div>
      </div>

      {/* Toolbar & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Ô tìm kiếm */}
          <div className="flex-1 max-w-md">
            <InputCustom
              placeholder="Tìm theo tên khách, SĐT, ghi chú..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4 text-gray-400" />}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-gray-500" />
              <span>Xuất Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-md shadow-rose-200"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Mừng Cưới</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">
              Lọc theo Bên
            </label>
            <DropdownCustom<string>
              value={filterSide}
              onSelect={(val) => setFilterSide(val)}
              options={[
                { label: "Tất cả các bên", value: "all" },
                { label: "🤵 Nhà Trai", value: "nha-trai" },
                { label: "👰 Nhà Gái", value: "nha-gai" },
              ]}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">
              Trạng thái
            </label>
            <DropdownCustom<string>
              value={filterStatus}
              onSelect={(val) => setFilterStatus(val)}
              options={[
                { label: "Tất cả trạng thái", value: "all" },
                { label: "✅ Đã nhận tiền", value: "RECEIVED" },
                { label: "⏳ Chờ đối soát", value: "PENDING" },
              ]}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-gray-400 mb-1">
              Hình thức
            </label>
            <DropdownCustom<string>
              value={filterMethod}
              onSelect={(val) => setFilterMethod(val)}
              options={[
                { label: "Tất cả hình thức", value: "all" },
                { label: "📱 Chuyển khoản QR", value: "QR" },
                { label: "💵 Tiền mặt / Phong bì", value: "CASH" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Bảng dữ liệu TableResize */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-3 sm:p-5 space-y-4">
        <TableResize<GiftItem>
          columns={columns}
          data={items}
          loading={loading}
          keyExtractor={(item) => item.id}
          bordered
          onSort={(col, type) => {
            setSortKey(col.name);
            setSortType(type);
          }}
          tableHeight={620}
        />

        <PaginationCustom
          totalItems={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 20, 50, 100]}
          itemUnitName="lượt mừng"
        />
      </div>

      {/* Modal Thêm Mới / Sửa Mừng Cưới */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingGift ? "Chỉnh Sửa Mừng Cưới" : "Ghi Nhận Mừng Cưới Mới"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-700 text-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitModal} className="mt-4 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Tên người mừng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={modalForm.guestName}
                  onChange={(e) => setModalForm({ ...modalForm, guestName: e.target.value })}
                  placeholder="Ví dụ: Anh Nam (Bạn Đại học)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-rose-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Số tiền mừng (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={modalForm.amount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setModalForm({
                      ...modalForm,
                      amount: raw ? Number(raw).toLocaleString("vi-VN") : "",
                    });
                  }}
                  placeholder="500,000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-rose-500 font-mono font-bold text-emerald-600 text-base"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Bên</label>
                  <select
                    value={modalForm.side}
                    onChange={(e) => setModalForm({ ...modalForm, side: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-rose-500 bg-white"
                  >
                    <option value="nha-trai">🤵 Nhà Trai</option>
                    <option value="nha-gai">👰 Nhà Gái</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Hình thức</label>
                  <select
                    value={modalForm.method}
                    onChange={(e) => setModalForm({ ...modalForm, method: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-rose-500 bg-white"
                  >
                    <option value="QR">📱 Chuyển khoản QR</option>
                    <option value="CASH">💵 Tiền mặt / Phong bì</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Trạng thái</label>
                  <select
                    value={modalForm.status}
                    onChange={(e) => setModalForm({ ...modalForm, status: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-rose-500 bg-white"
                  >
                    <option value="RECEIVED">✅ Đã nhận</option>
                    <option value="PENDING">⏳ Chờ duyệt</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={modalForm.phone}
                    onChange={(e) => setModalForm({ ...modalForm, phone: e.target.value })}
                    placeholder="0988xxxxxx"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  value={modalForm.note}
                  onChange={(e) => setModalForm({ ...modalForm, note: e.target.value })}
                  placeholder="Ghi chú thêm (ví dụ: Bạn bố mẹ, mừng kèm tranh thêu...)"
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-rose-500 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 font-medium transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  {submitting ? "Đang lưu..." : editingGift ? "Lưu thay đổi" : "Tạo bản ghi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Snackbar ref={snackbarRef} />
    </div>
  );
}
