"use client";

import React, {
  ButtonHTMLAttributes,
  FC,
  MouseEvent,
  ReactNode,
  useCallback,
  useState,
} from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "success"
  | "danger"
  | "gray"
  | "link"
  | "transparent";

export type ButtonSize = "sm" | "md" | "lg";

export interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  // Shorthand flags
  outline?: boolean;
  secondary?: boolean;
  isGreen?: boolean;
  lightGreen?: boolean;
  error?: boolean;
  link?: boolean;
  gray?: boolean;
  transparent?: boolean;
  // State & Content
  loading?: boolean;
  size?: ButtonSize;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const AppButton: FC<AppButtonProps> = ({
  children,
  className = "",
  disabled = false,
  loading: externalLoading,
  onClick,
  variant,
  outline,
  secondary,
  isGreen,
  lightGreen,
  error,
  link,
  gray,
  transparent,
  size = "md",
  icon,
  rightIcon,
  fullWidth = false,
  type = "button",
  ...props
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = externalLoading ?? internalLoading;

  // Tự động nhận diện Promise trong onClick để kích hoạt loading spinner
  const handleClick = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) {
        e.preventDefault();
        return;
      }
      if (!onClick) return;

      const result = onClick(e) as unknown;
      if (result && typeof (result as Promise<any>).then === "function") {
        setInternalLoading(true);
        try {
          await result;
        } finally {
          setInternalLoading(false);
        }
      }
    },
    [onClick, disabled, isLoading]
  );

  // Xác định variant
  let activeVariant: ButtonVariant = "primary";
  if (link) activeVariant = "link";
  else if (transparent) activeVariant = "transparent";
  else if (error) activeVariant = "danger";
  else if (isGreen || lightGreen) activeVariant = "success";
  else if (secondary) activeVariant = "secondary";
  else if (gray) activeVariant = "gray";
  else if (outline) activeVariant = "outline";
  else if (variant) activeVariant = variant;

  // Base styling
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-150 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.98]";

  // Size styling
  const sizeClasses = {
    sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
    md: "h-10 px-4 text-xs sm:text-sm rounded-xl gap-2",
    lg: "h-12 px-6 text-sm sm:text-base rounded-2xl gap-2.5 font-semibold",
  }[size];

  // Variant styling
  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-sm shadow-rose-200 border border-transparent focus:ring-rose-300",
    secondary:
      "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-sm shadow-amber-200 border border-transparent focus:ring-amber-300",
    outline:
      "bg-white hover:bg-rose-50/80 text-rose-600 border border-rose-200 hover:border-rose-300 focus:ring-rose-200 shadow-2xs",
    success:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 border border-transparent focus:ring-emerald-300",
    danger:
      "bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-200 border border-transparent focus:ring-red-300",
    gray: "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 focus:ring-gray-300",
    link: "bg-transparent text-rose-600 hover:text-rose-700 underline underline-offset-4 !p-0 !h-auto border-none shadow-none focus:ring-0 active:scale-100",
    transparent:
      "bg-transparent hover:bg-gray-100/70 text-gray-700 border-none shadow-none focus:ring-gray-200",
  };

  // Disabled styling
  const disabledClasses =
    disabled || isLoading
      ? "opacity-60 cursor-not-allowed pointer-events-none active:scale-100 shadow-none"
      : "";

  const widthClasses = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={`${baseClasses} ${sizeClasses} ${variantClasses[activeVariant]} ${disabledClasses} ${widthClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}

      {children}

      {!isLoading && rightIcon && (
        <span className="shrink-0">{rightIcon}</span>
      )}
    </button>
  );
};

export default AppButton;
