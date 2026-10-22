"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useGuest } from "@/lib/useGuest";
import { triggerCelebration } from "../utils/celebration";

interface WaxSealEnvelopeProps {
  groomName?: string;
  brideName?: string;
  weddingDate?: string;
}

function EnvelopeContent({
  groomName = "Việt Hùng",
  brideName = "Xuân Ly",
  weddingDate = "06 . 12 . 2026",
}: WaxSealEnvelopeProps) {
  const { guest, rawParam } = useGuest();
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  const guestName = guest?.name || rawParam || "Quý khách & Gia đình";

  useEffect(() => {
    setMounted(true);
    try {
      const seen = sessionStorage.getItem("envelope_opened");
      if (seen === "true") {
        setIsDismissed(true);
      }
    } catch {}
  }, []);

  if (!mounted || isDismissed) {
    return null;
  }

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);

    try {
      sessionStorage.setItem("envelope_opened", "true");
    } catch {}

    // Trigger celebration sparkles when flap flips
    setTimeout(() => {
      triggerCelebration();
    }, 400);

    // Fade out and enter main site after user has time to view the card
    setTimeout(() => {
      setIsDismissed(true);
    }, 3800);
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      sessionStorage.setItem("envelope_opened", "true");
    } catch {}
    setIsDismissed(true);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 transition-all duration-1000 select-none ${
        isOpen ? "opacity-0 pointer-events-none delay-[3200ms]" : "opacity-100"
      }`}
      onClick={handleOpen}
    >
      {/* Ambient background glow */}
      <div className="absolute w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 text-white/70 hover:text-white text-xs tracking-widest uppercase px-4 py-2 rounded-full border border-white/25 hover:border-white/60 bg-black/20 backdrop-blur-sm transition-all z-50 cursor-pointer"
      >
        Vào xem thiệp &rarr;
      </button>

      {/* Main Container */}
      <div className="relative flex flex-col items-center max-w-sm sm:max-w-md md:max-w-lg w-full">
        {/* Envelope 3D Container */}
        <div
          className="relative w-[320px] sm:w-[390px] md:w-[430px] h-[220px] sm:h-[260px] md:h-[280px]"
          style={{ perspective: "1200px" }}
        >
          {/* ============================================================ */}
          {/* THE WEDDING CARD INSIDE (Slides up smoothly and stands in front) */}
          {/* ============================================================ */}
          <div
            className={`absolute inset-x-2 sm:inset-x-4 top-2 h-[220px] sm:h-[265px] md:h-[285px] bg-[#ffffff] rounded-xl border-2 border-amber-300/60 flex flex-col items-center justify-between p-4 sm:p-5 text-center transition-all duration-1000 ease-out ${
              isOpen
                ? "-translate-y-36 sm:-translate-y-44 shadow-[0_30px_60px_rgba(0,0,0,0.45)] scale-105 z-40 opacity-100"
                : "translate-y-0 shadow-md z-10 opacity-90"
            }`}
          >
            {/* Elegant inner gold border */}
            <div className="w-full h-full border border-amber-400/40 rounded-lg p-3 sm:p-4 flex flex-col items-center justify-between bg-gradient-to-b from-[#fffefc] to-[#fffaf2]">
              {/* Card Header */}
              <div>
                <p className="text-[10px] sm:text-xs tracking-[0.3em] text-rose-600 uppercase font-bold">
                  THƯ MỜI TIỆC CƯỚI
                </p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <div className="w-8 h-px bg-amber-400/60" />
                  <span className="text-amber-500 text-xs">✤</span>
                  <div className="w-8 h-px bg-amber-400/60" />
                </div>
              </div>

              {/* Couple's Names - Large, Crisp, High Contrast */}
              <div className="my-1 sm:my-2">
                <h3 className="font-imperial-script text-3xl sm:text-4xl md:text-5xl text-gray-900 font-bold leading-none drop-shadow-xs">
                  {groomName} &amp; {brideName}
                </h3>
                <p className="text-xs sm:text-sm font-serif text-gray-700 tracking-widest font-semibold mt-1">
                  {weddingDate}
                </p>
              </div>

              {/* Guest Dedication Box */}
              <div className="w-full bg-rose-50 border border-rose-200/80 rounded-lg py-2 px-3 shadow-xs">
                <p className="text-[10px] sm:text-[11px] text-rose-600 font-serif italic">
                  Trân trọng kính mời
                </p>
                <p className="text-sm sm:text-base font-bold text-gray-900 tracking-wide mt-0.5 line-clamp-1">
                  {guestName}
                </p>
              </div>

              {/* Tap to enter hint */}
              <p className="text-[10px] sm:text-xs text-amber-700/80 font-medium tracking-wide">
                Chạm để xem chi tiết thiệp cưới &rarr;
              </p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* ENVELOPE BASE POCKET (Ivory textured paper with gold foil) */}
          {/* ============================================================ */}
          <div className="absolute inset-0 bg-[#fbf9f5] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[#e5d5c3] overflow-hidden z-20">
            {/* Subtle paper grain gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#ffffff] via-[#f7f2ea] to-[#eee5d8] opacity-90" />

            {/* Left triangle fold with realistic paper drop-shadow */}
            <div
              className="absolute left-0 bottom-0 top-0 w-1/2 bg-gradient-to-tr from-[#eadbc8] to-[#f4ebe0] shadow-[2px_0_8px_rgba(0,0,0,0.06)]"
              style={{ clipPath: "polygon(0 0, 0 100%, 100% 100%)" }}
            />

            {/* Right triangle fold with realistic paper drop-shadow */}
            <div
              className="absolute right-0 bottom-0 top-0 w-1/2 bg-gradient-to-tl from-[#dfceb9] to-[#eee2d3] shadow-[-2px_0_8px_rgba(0,0,0,0.08)]"
              style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
            />

            {/* Bottom triangle fold covering the bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[52%] bg-gradient-to-t from-[#ded0bd] via-[#efe5d7] to-[#faf6ef] shadow-[0_-3px_12px_rgba(0,0,0,0.08)]"
              style={{ clipPath: "polygon(0 100%, 50% 0, 100% 100%)" }}
            />

            {/* Gold foil hairline on the bottom fold */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[52%] pointer-events-none opacity-40"
              style={{
                clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
                background: "linear-gradient(to top, transparent, #c5a059)",
              }}
            />

            {/* Personalized Guest Label Plate on Envelope front when closed */}
            <div className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 w-4/5 text-center">
              <div className="inline-block px-4 py-1.5 bg-white/80 backdrop-blur-xs border border-amber-300/40 rounded-full shadow-xs">
                <p className="text-[9px] tracking-[0.25em] uppercase text-gray-500 font-semibold">
                  KÍNH GỬI
                </p>
                <p className="text-xs sm:text-sm font-serif font-bold text-gray-800 tracking-wide mt-0.5 line-clamp-1">
                  {guestName}
                </p>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* ENVELOPE FLAP (Top triangular flap that flips open) */}
          {/* ============================================================ */}
          <div
            className={`absolute top-0 left-0 right-0 h-[115px] sm:h-[135px] md:h-[145px] z-30 origin-top transition-transform duration-700 ease-in-out ${
              isOpen ? "rotate-x-180" : "rotate-x-0"
            }`}
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: "top",
              transform: isOpen ? "rotateX(180deg)" : "rotateX(0deg)",
            }}
          >
            {/* Front flap (facing user when closed) */}
            <div
              className="absolute inset-0 bg-gradient-to-b from-[#f5eee3] via-[#eddccb] to-[#debfa3] shadow-[0_4px_12px_rgba(0,0,0,0.15)] border-t border-amber-200/50"
              style={{
                clipPath: "polygon(0 0, 50% 100%, 100% 0)",
              }}
            >
              {/* Delicate golden accent line along the flap V-shape */}
              <div
                className="absolute inset-0 opacity-60"
                style={{
                  clipPath: "polygon(0 0, 50% 100%, 100% 0)",
                  background:
                    "linear-gradient(to bottom, transparent 85%, #c5a059 95%, #b38728 100%)",
                }}
              />
            </div>
          </div>

          {/* ============================================================ */}
          {/* LUXURY ROYAL WAX SEAL (Realistic 3D melted wax with monogram) */}
          {/* ============================================================ */}
          <div
            onClick={handleOpen}
            className={`absolute left-1/2 -translate-x-1/2 top-[90px] sm:top-[105px] md:top-[115px] z-40 cursor-pointer transition-all duration-500 ${
              isOpen
                ? "scale-0 opacity-0 -translate-y-6 pointer-events-none"
                : "scale-100 hover:scale-108 active:scale-95"
            }`}
          >
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 flex items-center justify-center group">
              {/* Gentle breathing light ring */}
              <div className="absolute inset-0 rounded-full bg-rose-500/25 blur-md animate-pulse pointer-events-none" />

              {/* Realistic SVG Wax Seal with organic melted edge and gold relief */}
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full drop-shadow-[0_8px_16px_rgba(139,0,0,0.55)] transition-transform duration-300 group-hover:rotate-6"
              >
                <defs>
                  {/* Classic Royal Red Wax gradient */}
                  <radialGradient id="royalWax" cx="35%" cy="30%" r="65%">
                    <stop offset="0%" stopColor="#ff4d6d" />
                    <stop offset="25%" stopColor="#c9184a" />
                    <stop offset="65%" stopColor="#800f2f" />
                    <stop offset="100%" stopColor="#470014" />
                  </radialGradient>

                  {/* Gold metallic monogram gradient */}
                  <linearGradient id="goldMetal" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffe6a7" />
                    <stop offset="40%" stopColor="#d4af37" />
                    <stop offset="70%" stopColor="#aa7c11" />
                    <stop offset="100%" stopColor="#fefae0" />
                  </linearGradient>

                  <filter id="waxShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#2b0009" floodOpacity="0.8" />
                  </filter>
                </defs>

                {/* Organic melted wax outer perimeter (irregular drips) */}
                <path
                  d="M50 4 
                     C63 3, 73 9, 82 18 
                     C91 27, 96 38, 96 51 
                     C95 64, 89 75, 80 84 
                     C70 93, 59 97, 47 96 
                     C34 96, 23 90, 15 81 
                     C6 71, 3 59, 4 47 
                     C4 33, 11 22, 21 14 
                     C31 6, 40 4, 50 4 Z"
                  fill="url(#royalWax)"
                />

                {/* Inner recessed circle rim */}
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="#6c0822"
                  stroke="url(#goldMetal)"
                  strokeWidth="1.2"
                  opacity="0.9"
                />

                {/* Decorative laurel wreath ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="32"
                  fill="none"
                  stroke="url(#goldMetal)"
                  strokeWidth="0.8"
                  strokeDasharray="2,3"
                  opacity="0.8"
                />

                {/* Monogram Text "H & L" with gold emboss */}
                <text
                  x="50"
                  y="49"
                  textAnchor="middle"
                  fill="url(#goldMetal)"
                  fontSize="15"
                  fontWeight="bold"
                  fontFamily="Playfair Display, serif"
                  letterSpacing="1.5"
                  filter="url(#waxShadow)"
                >
                  H &amp; L
                </text>

                {/* Tiny Heart underneath monogram */}
                <path
                  d="M50 56 
                     C47 52, 43 54, 43 57 
                     C43 60, 47 63, 50 66 
                     C53 63, 57 60, 57 57 
                     C57 54, 53 52, 50 56 Z"
                  fill="url(#goldMetal)"
                  filter="url(#waxShadow)"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CALL TO ACTION TEXT & INSTRUCTION */}
        {/* ============================================================ */}
        <div
          className={`mt-8 text-center transition-opacity duration-300 ${
            isOpen ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg animate-bounce">
            <span className="text-amber-300 text-sm">✨</span>
            <span className="text-white text-xs sm:text-sm font-medium tracking-wide">
              Chạm vào con dấu để mở thiệp
            </span>
            <span className="text-amber-300 text-sm">✨</span>
          </div>
          <p className="text-white/60 text-[11px] mt-2 font-light tracking-wide">
            (Mở thiệp cưới &amp; tự động bật nhạc du dương)
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WaxSealEnvelope(props: WaxSealEnvelopeProps) {
  return (
    <Suspense fallback={null}>
      <EnvelopeContent {...props} />
    </Suspense>
  );
}
