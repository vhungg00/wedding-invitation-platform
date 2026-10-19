"use client";

import React, { forwardRef, InputHTMLAttributes, ReactNode } from "react";

export interface InputCustomProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
  containerClassName?: string;
}

export const InputCustom = forwardRef<HTMLInputElement, InputCustomProps>(
  (
    {
      label,
      error,
      icon,
      rightElement,
      className = "",
      containerClassName = "",
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}

        <div
          className={`group relative flex items-center w-full rounded-xl border bg-white transition-all duration-200 ${
            error
              ? "border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100"
              : "border-gray-200 hover:border-rose-400 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-200/60"
          } ${disabled ? "opacity-60 bg-gray-50 cursor-not-allowed" : "cursor-text"}`}
        >
          {icon && (
            <div className="pl-3.5 pr-1 text-gray-400 group-hover:text-rose-400 group-focus-within:text-rose-500 transition-colors pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            required={required}
            className={`w-full bg-transparent py-2.5 sm:py-2.5 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed ${
              icon ? "pl-2" : "pl-3.5"
            } ${rightElement ? "pr-2" : "pr-3.5"} ${className}`}
            {...props}
          />

          {rightElement && (
            <div className="pr-3 text-gray-400 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

InputCustom.displayName = "InputCustom";

export default InputCustom;
