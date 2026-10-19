"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Eye, EyeOff, KeyRound, ShieldAlert } from "lucide-react";
import { InputCustom } from "@/app/components/ui/InputCustom";
import { AppButton } from "@/app/components/ui/AppButton";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess();
      } else {
        setError(data.message || "Tài khoản hoặc mật khẩu không chính xác");
      }
    } catch {
      setError("Lỗi kết nối máy chủ, vui lòng thử lại sau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center p-4 sm:p-6">
      {/* Form luôn tối đa 360px — màn hình to không phình ra */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl border border-rose-100 relative overflow-hidden md:w-[500px] w-full">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-5 sm:mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 mb-3 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">
            Đăng Nhập Quản Trị
          </h1>
          <p className="font-imperial-script text-2xl text-rose-500 mt-1">
            Wedding Platform
          </p>
          <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
            Vui lòng nhập tài khoản quản trị để truy cập dữ liệu thiệp cưới
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputCustom
            label="Tài khoản"
            required
            placeholder="admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <InputCustom
            label="Mật khẩu"
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            rightElement={
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
          />

          <AppButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            icon={<KeyRound className="w-4 h-4" />}
          >
            Đăng Nhập Quản Trị
          </AppButton>
        </form>

        <div className="mt-5 pt-4 border-t border-gray-100 text-center">
          <Link
            href="/"
            className="text-xs text-gray-500 hover:text-rose-500 transition"
          >
            ← Quay lại trang thiệp cưới
          </Link>
        </div>
      </div>
    </div>
  );
}
