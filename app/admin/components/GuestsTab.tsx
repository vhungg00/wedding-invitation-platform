"use client";

import { useState, useMemo } from "react";
import { Plus, Copy, Check, ExternalLink, Trash2, Search } from "lucide-react";
import { GuestItem } from "../types";
import { InputCustom } from "@/app/components/ui/InputCustom";
import { DropdownCustom } from "@/app/components/ui/DropdownCustom";
import { AppButton } from "@/app/components/ui/AppButton";
import { TableResize, TColumn, ESortType } from "@/app/components/ui/TableResize";

interface GuestsTabProps {
  guests: GuestItem[];
  onCreateGuest: (
    name: string,
    side: "nha-trai" | "nha-gai",
    phone: string
  ) => Promise<void>;
  onDeleteGuest: (id: string) => void;
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
      await onCreateGuest(newGuestName.trim(), newGuestSide, newGuestPhone.trim());
      setNewGuestName("");
      setNewGuestPhone("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSort = (column: TColumn<GuestItem>, type: ESortType) => {
    const key = (column.dataIndex || column.name || column.key) as string;
    setSortKey(key);
    setSortType(type);
  };

  // Filter & sort guests
  const filteredAndSortedGuests = useMemo(() => {
    let list = guests;
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          (g.phone && g.phone.toLowerCase().includes(q))
      );
    }

    if (!sortKey) return list;

    return [...list].sort((a, b) => {
      const aVal = a[sortKey as keyof GuestItem];
      const bVal = b[sortKey as keyof GuestItem];
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      if (sortKey === "createdAt") {
        const aTime = new Date(aVal as string).getTime();
        const bTime = new Date(bVal as string).getTime();
        return sortType === ESortType.ASC ? aTime - bTime : bTime - aTime;
      }
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortType === ESortType.ASC
        ? aStr.localeCompare(bStr, "vi")
        : bStr.localeCompare(aStr, "vi");
    });
  }, [guests, searchTerm, sortKey, sortType]);

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
        width: 130,
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
                  onDeleteGuest(g.id);
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
          <div className="w-full sm:w-64">
            <InputCustom
              icon={<Search className="w-4 h-4" />}
              placeholder="Tìm kiếm khách mời..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table with horizontal scroll on mobile, resizable columns, and sorting */}
        <TableResize
          data={filteredAndSortedGuests}
          columns={columns}
          sortKey={sortKey}
          sortType={sortType}
          onSort={handleSort}
          bordered
          resizable
          keyExtractor={(g) => g.id}
          empty="Chưa có khách mời nào trong danh sách. Hãy tạo link đầu tiên ở trên!"
        />
      </div>
    </div>
  );
}
