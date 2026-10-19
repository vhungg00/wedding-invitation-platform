"use client";

import React, { forwardRef, TextareaHTMLAttributes, ReactNode } from "react";

export interface TextareaCustomProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  containerClassName?: string;
}

export const TextareaCustom = forwardRef<HTMLTextAreaElement, TextareaCustomProps>(
  (
    {
      label,
      error,
      icon,
      className = "",
      containerClassName = "",
      disabled,
      required,
      rows = 3,
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
          className={`group relative flex w-full rounded-xl border bg-white transition-all duration-200 ${
            error
              ? "border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100"
              : "border-gray-200 hover:border-rose-400 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-200/60"
          } ${disabled ? "opacity-60 bg-gray-50 cursor-not-allowed" : "cursor-text"}`}
        >
          {icon && (
            <div className="absolute left-3.5 top-3 text-gray-400 group-hover:text-rose-400 group-focus-within:text-rose-500 transition-colors pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}

          <textarea
            ref={ref}
            rows={rows}
            disabled={disabled}
            required={required}
            className={`w-full bg-transparent py-2.5 sm:py-2.5 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed resize-none ${
              icon ? "pl-10 pr-3.5" : "px-3.5"
            } ${className}`}
            {...props}
          />
        </div>

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

TextareaCustom.displayName = "TextareaCustom";

export default TextareaCustom;
