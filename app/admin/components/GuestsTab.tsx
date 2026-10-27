"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Plus, Copy, Check, ExternalLink, Trash2, Search, Sparkles, Download, MessageCircle, Image as ImageIcon } from "lucide-react";
import { GuestItem } from "../types";
import { InputCustom } from "@/app/components/ui/InputCustom";
import { DropdownCustom } from "@/app/components/ui/DropdownCustom";
import { AppButton } from "@/app/components/ui/AppButton";
import { TableResize, TColumn, ESortType } from "@/app/components/ui/TableResize";
import { exportGuestsToExcel } from "@/lib/exportExcel";
import { PaginationCustom } from "@/app/components/ui/PaginationCustom";
import { Snackbar, SnackbarRefs } from "@/app/components/ui/Snackbar";
import ZaloMessageModal from "../guests/components/ZaloMessageModal";
import InvitationCardPreviewModal from "../guests/components/InvitationCardPreviewModal";
import { sendZaloOneClick } from "@/lib/zaloInvite";

interface GuestsTabProps {
  guests: GuestItem[];
  onCreateGuest: (
    name: string,
    side: "nha-trai" | "nha-gai",
    phone: string
  ) => Promise<GuestItem | void>;
  onDeleteGuest: (id: string) => Promise<boolean | void> | void;
}

export default function GuestsTab({
  guests,
  onCreateGuest,
  onDeleteGuest,
}: GuestsTabProps) {
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestSide, setNewGuestSide] = useState<"nha-trai" | "nha-gai">("nha-trai");
  const [newGuestPhone, setNewGuestPhone] = useState("");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<string | undefined>("name");
  const [sortType, setSortType] = useState<ESortType>(ESortType.ASC);
  const [zaloGuest, setZaloGuest] = useState<GuestItem | null>(null);
  const [cardPreviewGuest, setCardPreviewGuest] = useState<GuestItem | null>(null);
  const snackbarRef = useRef<SnackbarRefs>(null);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const getPersonalizedUrl = (guest: GuestItem) => {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin;
    const path = guest.side === "nha-gai" ? "/nha-gai" : "";
    if (guest.slug) {
      return `${origin}${path}?g=${guest.slug}`;
    }
    return `${origin}${path}?to=${encodeURIComponent(guest.name)}`;
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim() || submitting) return;

    setSubmitting(true);
    try {
      const createdGuest = await onCreateGuest(newGuestName.trim(), newGuestSide, newGuestPhone.trim());
      if (createdGuest && typeof createdGuest === "object") {
        setItems((prev) => [createdGuest, ...prev]);
        setTotalCount((c) => c + 1);
      }
      setNewGuestName("");
      setNewGuestPhone("");
      setCurrentPage(1);
      fetchServerGuests(1, pageSize, searchTerm, sortKey, sortType);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSort = (column: TColumn<GuestItem>, type: ESortType) => {
    const key = (column.dataIndex || column.name || column.key) as string;
    setSortKey(key);
    setSortType(type);
  };

  const [items, setItems] = useState<GuestItem[]>(guests);
  const [totalCount, setTotalCount] = useState<number>(guests.length);
  const [loading, setLoading] = useState(false);

  // Fetch danh sách khách mời từ server có phân trang
  const fetchServerGuests = useCallback(
    async (
      page: number,
      limit: number,
      search: string,
      sort: string | undefined,
      type: ESortType
    ) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          search: search.trim(),
          sortKey: sort || "name",
          sortType: type || "asc",
        });
        const res = await fetch(`/api/guests?${params.toString()}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setItems(data.data);
          setTotalCount(data.total ?? data.data.length);
        }
      } catch (err) {
        console.error("Lỗi khi tải khách mời:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Reset trang về 1 khi tìm kiếm thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Gọi API phân trang server khi thay đổi trang, kích thước, tìm kiếm, sắp xếp hoặc khi cha update
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServerGuests(currentPage, pageSize, searchTerm, sortKey, sortType);
    }, 250);
    return () => clearTimeout(timer);
  }, [
    currentPage,
    pageSize,
    searchTerm,
    sortKey,
    sortType,
    guests,
    fetchServerGuests,
  ]);

  const handleDelete = async (id: string) => {
    const success = await onDeleteGuest(id);
    if (success === false) return;

    setItems((prev) => prev.filter((item) => item.id !== id));
    const newTotal = Math.max(0, totalCount - 1);
    setTotalCount(newTotal);

    const maxPage = Math.max(1, Math.ceil(newTotal / pageSize));
    const targetPage = currentPage > maxPage ? maxPage : currentPage;
    if (targetPage !== currentPage) {
      setCurrentPage(targetPage);
    } else {
      fetchServerGuests(targetPage, pageSize, searchTerm, sortKey, sortType);
    }
  };

  const handleDeleteRef = useRef(handleDelete);
  handleDeleteRef.current = handleDelete;

  const columns = useMemo<TColumn<GuestItem>[]>(
    () => [
      {
        title: "Tên khách mời",
        dataIndex: "name",
        key: "name",
        sortable: true,
        width: 220,
        render: (_, g) => (
          <div>
            <span
              style={{
                fontWeight: 500,
                color: "#262626",
                fontSize: 14,
                display: "block",
              }}
            >
              {g.name}
            </span>
            {g.phone && (
              <span
                style={{
                  fontSize: 12,
                  color: "#8c8c8c",
                  display: "block",
                  marginTop: 2,
                }}
              >
                {g.phone}
              </span>
            )}
          </div>
        ),
      },
      {
        title: "Bên tiệc",
        dataIndex: "side",
        key: "side",
        sortable: true,
        width: 120,
        render: (_, g) => (
          <span
            style={{
              display: "inline-block",
              padding: "2px 8px",
              fontSize: 12,
              borderRadius: 4,
              background: g.side === "nha-trai" ? "#e6f4ff" : "#fff0f6",
              border:
                g.side === "nha-trai"
                  ? "1px solid #91caff"
                  : "1px solid #ffadd2",
              color: g.side === "nha-trai" ? "#0958d9" : "#c41d7f",
              fontWeight: 400,
            }}
          >
            {g.side === "nha-trai" ? "Nhà Trai" : "Nhà Gái"}
          </span>
        ),
      },
      {
        title: "Link thiệp cá nhân hóa",
        key: "link",
        width: 320,
        render: (_, g) => {
          const guestUrl = getPersonalizedUrl(g);
          return (
            <span
              title={guestUrl}
              style={{
                color: "#FF5100",
                fontFamily: "monospace",
                fontSize: 13,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
                cursor: "pointer",
                userSelect: "all",
              }}
            >
              {guestUrl}
            </span>
          );
        },
      },
      {
        title: "Hành động",
        key: "action",
        width: 245,
        align: "center",
        resizable: false,
        render: (_, g) => {
          const guestUrl = getPersonalizedUrl(g);
          const isCopied = copiedLink === g.id;

          return (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {/* Nút Xem trước & Tải ảnh thiệp mời in tên khách */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCardPreviewGuest(g);
                }}
                style={{
                  border: "1px solid #ffadd2",
                  background: "#fff0f6",
                  borderRadius: 4,
                  padding: "4px 8px",
                  cursor: "pointer",
                  color: "#c41d7f",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
                title="🖼️ Xem trước & tải ảnh thiệp mời in tên khách"
              >
                <ImageIcon style={{ width: 14, height: 14 }} />
                <span>Ảnh thiệp</span>
              </button>

              {/* Nút Gửi Zalo 1-Click */}
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (g.phone) {
                    await sendZaloOneClick(g, (guestId) => {
                      setItems((prev) =>
                        prev.map((item) => (item.id === guestId ? { ...item, isSent: true } : item))
                      );
                    });
                    snackbarRef.current?.showSnackbar({
                      message: `Đã chép tin nhắn mời ${g.name}! Đang mở Zalo...`,
                      severity: "info",
                    });
                  } else {
                    setZaloGuest(g);
                  }
                }}
                style={{
                  border: "1px solid #91caff",
                  background: "#e6f4ff",
                  borderRadius: 4,
                  padding: "4px 8px",
                  cursor: "pointer",
                  color: "#0958d9",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
                title="Gửi thiệp qua Zalo (1-Click)"
              >
                <MessageCircle style={{ width: 14, height: 14 }} />
                <span>Zalo</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(guestUrl, g.id);
                }}
                style={{
                  border: "1px solid #d9d9d9",
                  background: "#ffffff",
                  borderRadius: 4,
                  padding: "4px 8px",
                  cursor: "pointer",
                  color: isCopied ? "#52c41a" : "#595959",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
                title="Sao chép link"
              >
                {isCopied ? (
                  <Check style={{ width: 14, height: 14 }} />
                ) : (
                  <Copy style={{ width: 14, height: 14 }} />
                )}
              </button>
              <a
                href={guestUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  border: "1px solid #d9d9d9",
                  background: "#ffffff",
                  borderRadius: 4,
                  padding: "4px 8px",
                  cursor: "pointer",
                  color: "#1677ff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
                title="Mở xem thiệp"
              >
                <ExternalLink style={{ width: 14, height: 14 }} />
              </a>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteRef.current(g.id);
                }}
                style={{
                  border: "1px solid #ffccc7",
                  background: "#ffffff",
                  borderRadius: 4,
                  padding: "4px 8px",
                  cursor: "pointer",
                  color: "#ff4d4f",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
                title="Xóa khách"
              >
                <Trash2 style={{ width: 14, height: 14 }} />
              </button>
            </div>
          );
        },
      },
    ],
    [copiedLink]
  );

  return (
    <div className="space-y-6">
      {/* Banner mở Màn Chuyên Sâu */}
      <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 rounded-3xl p-0.5 shadow-md">
        <div className="bg-white rounded-[23px] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                Màn Hình Điều Phối Khách Mời & Xếp Bàn Tiệc Chuyên Sâu
              </h3>
              <p className="text-xs text-gray-500">
                Thước đo mâm cỗ (chuẩn ngồi 8), Dán danh sách nhanh 200 khách, Gửi Zalo 1-chạm & Sơ đồ bàn tiệc.
              </p>
            </div>
          </div>
          <a
            href="/admin/guests"
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-200 transition shrink-0"
          >
            Mở Toàn Màn Hình →
          </a>
        </div>
      </div>

      {/* Form tạo link */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-rose-100 shadow-sm p-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Plus className="w-5 h-5 text-rose-500" />
          <span>Tạo Link Thiệp Mời Cá Nhân Hóa Mới</span>
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mb-6">
          Nhập tên khách mời để tự động tạo link thiệp có lời mời trân trọng riêng dành cho khách đó.
        </p>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end"
        >
          <div className="sm:col-span-5">
            <InputCustom
              label="Tên khách mời (Hiển thị trên thiệp)"
              required
              placeholder="Ví dụ: Anh Nam, Gia đình Bác Hùng, Bạn Ly..."
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
            />
          </div>

          <div className="sm:col-span-3">
            <DropdownCustom
              label="Khách của bên"
              value={newGuestSide}
              onSelect={(val) => setNewGuestSide(val as any)}
              options={[
                { label: "Nhà Trai (Chủ Nhật, 06.12)", value: "nha-trai" },
                { label: "Nhà Gái (Thứ Bảy, 05.12)", value: "nha-gai" },
              ]}
            />
          </div>

          <div className="sm:col-span-2">
            <InputCustom
              label="SĐT (Tùy chọn)"
              type="tel"
              placeholder="09xxx..."
              value={newGuestPhone}
              onChange={(e) => setNewGuestPhone(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <AppButton
              type="submit"
              variant="primary"
              fullWidth
              loading={submitting}
            >
              Tạo Link Thiệp
            </AppButton>
          </div>
        </form>
      </div>

      {/* Danh sách link khách mời */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-rose-100 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-gray-800">
            Danh Sách Khách & Link Đã Tạo ({guests.length})
          </h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="w-full sm:w-64">
              <InputCustom
                icon={<Search className="w-4 h-4" />}
                placeholder="Tìm kiếm khách mời..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await fetch("/api/guests?all=true");
                  const data = await res.json();
                  if (data.success && Array.isArray(data.data)) {
                    exportGuestsToExcel(data.data);
                  }
                } catch {
                  exportGuestsToExcel(guests);
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-xs transition cursor-pointer shrink-0"
              title="Xuất file Excel (.xlsx)"
            >
              <Download className="w-4 h-4 text-gray-500" />
              <span>Xuất Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Table with horizontal scroll on mobile, resizable columns, and sorting */}
        <TableResize
          data={items}
          loading={loading}
          columns={columns}
          sortKey={sortKey}
          sortType={sortType}
          onSort={handleSort}
          bordered
          resizable
          keyExtractor={(g) => g.id}
          empty="Chưa có khách mời nào trong danh sách. Hãy tạo link đầu tiên ở trên!"
        />

        <PaginationCustom
          totalItems={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 20, 50, 100]}
          itemUnitName="khách"
        />
      </div>

      {/* Modal Xem trước & Tải ảnh thiệp mời in tên khách */}
      <InvitationCardPreviewModal
        guest={cardPreviewGuest}
        isOpen={Boolean(cardPreviewGuest)}
        onClose={() => setCardPreviewGuest(null)}
      />

      {/* Modal Zalo khi khách chưa có SĐT */}
      <ZaloMessageModal
        guest={zaloGuest}
        isOpen={Boolean(zaloGuest)}
        onClose={() => setZaloGuest(null)}
        onSentUpdated={(guestId) => {
          setItems((prev) =>
            prev.map((item) => (item.id === guestId ? { ...item, isSent: true } : item))
          );
        }}
      />
      <Snackbar ref={snackbarRef} />
    </div>
  );
}
