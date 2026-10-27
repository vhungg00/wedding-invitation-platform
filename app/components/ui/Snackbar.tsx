"use client";

import React, {
  CSSProperties,
  forwardRef,
  ReactPortal,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X } from "lucide-react";

export type AlertColor = "success" | "info" | "warning" | "error";

export type SnackbarRefs = {
  showSnackbar: (options: { message?: string; severity?: AlertColor }) => void;
};

export interface SnackbarProps {
  className?: string;
  style?: CSSProperties;
  duration?: number;
}

type Decorate = {
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
};

const TIME_OUT = 350;

const animatedActive = (isOpen?: boolean): CSSProperties => ({
  opacity: Number(Boolean(isOpen)),
  transition: "all .3s ease-in-out",
  transform: `translateX(${isOpen ? 0 : 100}%)`,
});

const createWrapperAndAppendToBody = (wrapperId: string) => {
  const wrapperElement = document.createElement("div");
  wrapperElement.setAttribute("id", wrapperId);
  document.body.appendChild(wrapperElement);
  return wrapperElement;
};

export const Snackbar = forwardRef<SnackbarRefs, SnackbarProps>(
  ({ duration = 3000, className = "", style }: SnackbarProps, ref): ReactPortal | null => {
    const refTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [severity, setSeverity] = useState<AlertColor>("error");
    const [message, setMessage] = useState<string>(
      "Đã có lỗi xảy ra. Vui lòng thử lại sau."
    );
    const [animated, setAnimated] = useState<CSSProperties>({
      transform: "translateX(100%)",
      opacity: 0,
      transition: "all .3s ease-in-out",
    });

    useEffect(() => {
      setMounted(true);
      return () => {
        if (refTimeout.current) clearTimeout(refTimeout.current);
      };
    }, []);

    const handleClearDom = useCallback(() => {
      setIsVisible(false);
    }, []);

    const handleClose = useCallback(() => {
      setAnimated(animatedActive(false));
      if (refTimeout.current) clearTimeout(refTimeout.current);
      refTimeout.current = setTimeout(() => {
        setOpen(false);
        handleClearDom();
      }, TIME_OUT);
    }, [handleClearDom]);

    const handleClickClose = useCallback(() => {
      setAnimated(animatedActive(false));
      if (refTimeout.current) clearTimeout(refTimeout.current);
      refTimeout.current = setTimeout(() => {
        setOpen(false);
        handleClearDom();
      }, TIME_OUT);
    }, [handleClearDom]);

    const handleOpen = useCallback(
      (options: { message?: string; severity?: AlertColor }) => {
        if (refTimeout.current) clearTimeout(refTimeout.current);
        if (options.message) setMessage(options.message);
        setSeverity(options.severity || "error");
        setOpen(true);
        setIsVisible(true);
      },
      []
    );

    useEffect(() => {
      if (!open || !isVisible) return;
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearTimeout(timer);
      };
    }, [duration, handleClose, isVisible, open, message, severity]);

    useEffect(() => {
      if (!isVisible) return;
      const animate = () => {
        setAnimated(animatedActive(true));
      };
      const frameId = requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(frameId);
      };
    }, [isVisible, message, severity]);

    useImperativeHandle(
      ref,
      () => ({
        showSnackbar: handleOpen,
      }),
      [handleOpen]
    );

    const variant = useMemo((): Decorate => {
      switch (severity) {
        case "success":
          return {
            color: "#166534",
            bg: "#f0fdf4",
            border: "#bbf7d0",
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          };
        case "info":
          return {
            color: "#1e40af",
            bg: "#eff6ff",
            border: "#bfdbfe",
            icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
          };
        case "warning":
          return {
            color: "#92400e",
            bg: "#fffbeb",
            border: "#fde68a",
            icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          };
        default:
          return {
            color: "#991b1b",
            bg: "#fef2f2",
            border: "#fecaca",
            icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
          };
      }
    }, [severity]);

    if (!mounted || typeof window !== "object") {
      return null;
    }

    let el = document.getElementById("rootSnackbar");
    if (!el) {
      el = createWrapperAndAppendToBody("rootSnackbar");
    }

    return isVisible
      ? (createPortal(
          <div
            role="alert"
            className={`fixed top-4 right-4 z-[1000] flex items-center gap-3 px-4 py-3.5 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] border text-sm font-medium max-w-md ${className}`}
            style={{
              backgroundColor: variant.bg,
              color: variant.color,
              borderColor: variant.border,
              ...animated,
              ...style,
            }}
          >
            {variant.icon}
            <span className="flex-1 leading-snug">{message}</span>
            <button
              type="button"
              onClick={handleClickClose}
              className="p-1 rounded-lg hover:bg-black/5 transition cursor-pointer shrink-0"
              style={{ color: variant.color }}
              aria-label="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>,
          el
        ) as ReactPortal)
      : null;
  }
);

Snackbar.displayName = "Snackbar";
