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
          <div className="truncate">
            <span className="font-bold text-gray-900 block truncate">
              {g.name}
            </span>
            {g.phone && (
              <span className="block text-xs font-normal text-gray-500 truncate">
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
        width: 130,
        render: (_, g) => (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              g.side === "nha-trai"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {g.side === "nha-trai" ? "Nhà Trai" : "Nhà Gái"}
          </span>
        ),
      },
      {
        title: "Link thiệp cá nhân hóa",
        key: "link",
        width: 380,
        render: (_, g) => {
          const guestUrl = getPersonalizedUrl(g);
          return (
            <span
              className="font-mono text-xs text-rose-600 truncate block select-all cursor-text"
              title={guestUrl}
            >
              {guestUrl}
            </span>
          );
        },
      },
      {
        title: "Hành động",
        key: "action",
        width: 140,
        align: "center",
        resizable: false,
        render: (_, g) => {
          const guestUrl = getPersonalizedUrl(g);
          const isCopied = copiedLink === g.id;

          return (
            <div className="inline-flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(guestUrl, g.id);
                }}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-rose-100 text-gray-700 hover:text-rose-600 transition cursor-pointer"
                title="Sao chép link"
              >
                {isCopied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <a
                href={guestUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-600 transition"
                title="Mở xem thiệp"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteGuest(g.id);
                }}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-600 transition cursor-pointer"
                title="Xóa khách"
              >
                <Trash2 className="w-4 h-4" />
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
          keyExtractor={(g) => g.id}
          empty="Chưa có khách mời nào trong danh sách. Hãy tạo link đầu tiên ở trên!"
        />
      </div>
    </div>
  );
}
