"use client";

import ReactPaginate from "react-paginate";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationCustomProps {
  totalItems: number;
  currentPage: number; // 1-indexed (1, 2, 3...)
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  itemUnitName?: string; // Ví dụ: "khách", "lượt mừng", "phản hồi", "lời chúc"
}

export function PaginationCustom({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className = "",
  itemUnitName = "mục",
}: PaginationCustomProps) {
  if (totalItems <= 0) return null;

  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), pageCount);

  const fromIndex = (safeCurrentPage - 1) * pageSize + 1;
  const toIndex = Math.min(safeCurrentPage * pageSize, totalItems);

  const handlePageClick = (selectedItem: { selected: number }) => {
    const newPage = selectedItem.selected + 1;
    if (newPage !== safeCurrentPage) {
      onPageChange(newPage);
    }
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-3.5 pb-1 border-t border-rose-100/70 text-xs text-gray-600 select-none ${className}`}
    >
      {/* Thông tin số lượng hiển thị */}
      <div className="flex items-center gap-2 text-gray-500">
        <span>
          Hiển thị{" "}
          <strong className="text-gray-900 font-semibold">
            {fromIndex} - {toIndex}
          </strong>{" "}
          trên tổng số{" "}
          <strong className="text-rose-600 font-bold">{totalItems}</strong>{" "}
          {itemUnitName}
        </span>

        {/* Dropdown chọn số lượng dòng/trang */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-gray-200">
            <span className="hidden md:inline text-gray-400">Xem:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                onPageSizeChange(newSize);
                onPageChange(1); // Reset về trang 1 khi đổi page size
              }}
              className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-medium text-gray-700 hover:border-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / trang
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* React-Paginate Component với Custom Wedding Theme */}
      {pageCount > 1 && (
        <ReactPaginate
          breakLabel="..."
          nextLabel={
            <span className="flex items-center gap-1">
              <span className="hidden md:inline">Sau</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          }
          previousLabel={
            <span className="flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Trước</span>
            </span>
          }
          onPageChange={handlePageClick}
          pageRangeDisplayed={3}
          marginPagesDisplayed={1}
          pageCount={pageCount}
          forcePage={safeCurrentPage - 1} // react-paginate is 0-indexed
          renderOnZeroPageCount={null}
          // ClassNames container & items
          containerClassName="inline-flex items-center gap-1 bg-white p-1 rounded-xl border border-rose-100 shadow-xs"
          pageClassName="inline-block"
          pageLinkClassName="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-xs font-semibold text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
          activeClassName="active"
          activeLinkClassName="!bg-rose-600 !text-white !font-bold !shadow-sm !shadow-rose-200 hover:!bg-rose-700 hover:!text-white"
          previousClassName="inline-block"
          previousLinkClassName="h-7 sm:h-8 px-2 sm:px-2.5 flex items-center justify-center rounded-lg text-xs font-semibold text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
          nextClassName="inline-block"
          nextLinkClassName="h-7 sm:h-8 px-2 sm:px-2.5 flex items-center justify-center rounded-lg text-xs font-semibold text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
          disabledClassName="opacity-30 cursor-not-allowed pointer-events-none"
          breakClassName="inline-block"
          breakLinkClassName="w-6 sm:w-7 h-7 sm:h-8 flex items-center justify-center text-xs text-gray-400 select-none"
        />
      )}
    </div>
  );
}

export default PaginationCustom;
