"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, Trash2, Loader2 } from "lucide-react";
import { WishItem } from "../types";
import { PaginationCustom } from "@/app/components/ui/PaginationCustom";

interface WishesTabProps {
  wishes: WishItem[];
  onDeleteWish: (id: string) => Promise<boolean | void> | void;
}

export default function WishesTab({ wishes, onDeleteWish }: WishesTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [items, setItems] = useState<WishItem[]>(wishes);
  const [totalCount, setTotalCount] = useState<number>(wishes.length);
  const [loading, setLoading] = useState(false);

  // Fetch danh sách lời chúc từ server có phân trang
  const fetchServerWishes = useCallback(
    async (page: number, limit: number) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/wishes?all=true&page=${page}&limit=${limit}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setItems(data.data);
          setTotalCount(data.total ?? data.data.length);
        }
      } catch (err) {
        console.error("Lỗi khi tải lời chúc:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchServerWishes(currentPage, pageSize);
  }, [currentPage, pageSize, wishes, fetchServerWishes]);

  const handleDelete = async (id: string) => {
    const success = await onDeleteWish(id);
    if (success === false) return;

    setItems((prev) => prev.filter((item) => item.id !== id));
    const newTotal = Math.max(0, totalCount - 1);
    setTotalCount(newTotal);

    const maxPage = Math.max(1, Math.ceil(newTotal / pageSize));
    const targetPage = currentPage > maxPage ? maxPage : currentPage;
    if (targetPage !== currentPage) {
      setCurrentPage(targetPage);
    } else {
      fetchServerWishes(targetPage, pageSize);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-rose-100 shadow-sm p-5 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-gray-800">
          Danh Sách Lời Chúc Mừng ({totalCount})
        </h2>
        {loading && (
          <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Đang tải...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400">
            Chưa có lời chúc nào được gửi
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                      {item.name}
                    </h4>
                    {item.relationship && (
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-600 border border-rose-200">
                        {item.relationship}
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-rose-500 font-semibold bg-rose-50 px-2 py-0.5 rounded-full">
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span>{item.hearts || 0}</span>
                  </span>
                </div>

                <p className="text-gray-700 text-xs sm:text-sm whitespace-pre-line bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {item.content}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-400">
                <span>{new Date(item.createdAt).toLocaleDateString("vi-VN")}</span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded cursor-pointer"
                  title="Xóa lời chúc"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <PaginationCustom
        totalItems={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[9, 18, 27, 45]}
        itemUnitName="lời chúc"
      />
    </div>
  );
}
