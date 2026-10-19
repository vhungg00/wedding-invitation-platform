"use client";

import { Heart, Trash2 } from "lucide-react";
import { WishItem } from "../types";

interface WishesTabProps {
  wishes: WishItem[];
  onDeleteWish: (id: string) => void;
}

export default function WishesTab({ wishes, onDeleteWish }: WishesTabProps) {
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-rose-100 shadow-sm p-5 sm:p-6">
      <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-4">
        Danh Sách Lời Chúc Mừng ({wishes.length})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400">
            Chưa có lời chúc nào được gửi
          </div>
        ) : (
          wishes.map((item) => (
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
                  onClick={() => onDeleteWish(item.id)}
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
    </div>
  );
}
