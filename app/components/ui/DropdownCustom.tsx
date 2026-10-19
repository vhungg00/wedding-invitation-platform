"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Search, X } from "lucide-react";

export type TOption<T> = {
  label: string;
  value: T;
  icon?: ReactNode;
  description?: string;
};

export interface DropdownCustomProps<T> {
  options?: TOption<T>[];
  value?: T;
  placeholder?: string;
  fitWidth?: boolean;
  disabled?: boolean;
  width?: number | string;
  onSelect?: (value: T) => void;
  maxWidth?: number | string;
  isSearchable?: boolean;
  className?: string;
  label?: string;
  required?: boolean;
  prefixIcon?: ReactNode;
}

export function DropdownCustom<T extends string | number | boolean>({
  options = [],
  value,
  placeholder = "Chọn một mục...",
  fitWidth = true,
  disabled = false,
  width,
  maxWidth,
  onSelect,
  isSearchable = false,
  className = "",
  label,
  required,
  prefixIcon,
}: DropdownCustomProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
    placement: "bottom" | "top";
  }>({ top: 0, left: 0, width: 0, placement: "bottom" });
  const [mounted, setMounted] = useState(false);

  const refRoot = useRef<HTMLDivElement>(null);
  const refOption = useRef<HTMLDivElement>(null);
  const refInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const optionSelect = useMemo(() => {
    return options.find((e) => e.value === value);
  }, [options, value]);

  const optionsRender = useMemo(() => {
    if (!keyword.trim()) return options;
    const lower = keyword.toLowerCase().trim();
    return options.filter((e) => e.label.toLowerCase().includes(lower));
  }, [options, keyword]);

  const updatePosition = useCallback(() => {
    if (!refRoot.current) return;
    const rect = refRoot.current.getBoundingClientRect();
    const dropdownHeight = 260; // Estimated max height of option list
    const spaceBelow = window.innerHeight - rect.bottom;
    const placement = spaceBelow < dropdownHeight && rect.top > dropdownHeight ? "top" : "bottom";

    const top =
      placement === "top"
        ? Math.max(8, rect.top - dropdownHeight - 4)
        : rect.bottom + 4;

    setPosition({
      top,
      left: rect.left,
      width: fitWidth ? rect.width : Math.max(rect.width, 180),
      placement,
    });
  }, [fitWidth]);

  const onOpen = useCallback(() => {
    if (disabled) return;
    if (isOpen) {
      setIsOpen(false);
      setKeyword("");
    } else {
      updatePosition();
      setIsOpen(true);
      if (isSearchable) {
        setTimeout(() => refInput.current?.focus(), 50);
      }
    }
  }, [disabled, isOpen, isSearchable, updatePosition]);

  const onClose = useCallback(() => {
    setIsOpen(false);
    setKeyword("");
  }, []);

  // Đóng khi click ra ngoài
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        refRoot.current?.contains(target) ||
        refOption.current?.contains(target)
      ) {
        return;
      }
      onClose();
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, onClose, updatePosition]);

  return (
    <div className={`relative w-full ${className}`} style={{ width, maxWidth }}>
      {label && (
        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <div
        ref={refRoot}
        onClick={onOpen}
        className={`group relative flex items-center justify-between w-full min-h-[40px] px-3 py-2 rounded-xl border bg-white text-xs sm:text-sm transition-all duration-150 select-none ${
          disabled
            ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
            : isOpen
            ? "border-rose-500 ring-2 ring-rose-200/60 shadow-sm cursor-pointer"
            : "border-gray-200 hover:border-rose-400 hover:shadow-xs cursor-pointer"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
          {prefixIcon && (
            <span className="text-gray-400 group-hover:text-rose-400 transition-colors shrink-0">
              {prefixIcon}
            </span>
          )}

          {optionSelect?.icon && (
            <span className="shrink-0">{optionSelect.icon}</span>
          )}

          <span
            className={`truncate font-medium ${
              optionSelect ? "text-gray-900" : "text-gray-400"
            }`}
          >
            {optionSelect ? optionSelect.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-gray-400 group-hover:text-rose-500 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-rose-500" : ""
          }`}
        />
      </div>

      {/* Portal Dropdown Menu */}
      {mounted &&
        isOpen &&
        createPortal(
          <div
            ref={refOption}
            style={{
              position: "fixed",
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
              zIndex: 99999,
            }}
            className="rounded-2xl border border-rose-100 bg-white/95 backdrop-blur-md shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-100 overflow-hidden flex flex-col max-h-[260px]"
          >
            {/* Search Box if isSearchable */}
            {isSearchable && (
              <div className="p-2 border-b border-gray-100">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
                  <input
                    ref={refInput}
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-rose-400 focus:bg-white transition"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {keyword && (
                    <button
                      type="button"
                      onClick={() => setKeyword("")}
                      className="absolute right-2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Option List */}
            <div className="overflow-y-auto divide-y divide-gray-50 flex-1 overscroll-contain">
              {optionsRender.length === 0 ? (
                <div className="py-4 text-center text-xs text-gray-400">
                  Không tìm thấy lựa chọn
                </div>
              ) : (
                optionsRender.map((option, idx) => {
                  const isSelected = optionSelect?.value === option.value;
                  return (
                    <div
                      key={`${idx}_${String(option.value)}`}
                      onClick={() => {
                        onSelect?.(option.value);
                        onClose();
                      }}
                      className={`flex items-center justify-between gap-2 px-3.5 py-2.5 text-xs sm:text-sm cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-rose-50/80 text-rose-600 font-semibold"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {option.icon && (
                          <span className="shrink-0">{option.icon}</span>
                        )}
                        <span className="truncate">{option.label}</span>
                      </div>

                      {isSelected ? (
                        <Check className="w-4 h-4 text-rose-500 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 shrink-0" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default DropdownCustom;
