"use client";
import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Fireworks } from "fireworks-js";
import { triggerCelebration } from "../utils/celebration";

export default function FireworksCelebration() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const fireworksRef = useRef<Fireworks | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [wishesCount, setWishesCount] = useState<number>(128);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Read stored wishes count from localStorage
    try {
      const cached = localStorage.getItem("wedding_wishes_count");
      if (cached) {
        setWishesCount(parseInt(cached, 10));
      }
    } catch {}

    if (!containerRef.current) return;

    // Initialize fireworks-js canvas with romantic wedding palette
    const fireworks = new Fireworks(containerRef.current, {
      autoresize: true,
      opacity: 0.9,
      acceleration: 1.05,
      friction: 0.98,
      gravity: 1.5,
      particles: 65,
      traceLength: 3,
      traceSpeed: 10,
      explosion: 6,
      intensity: 30,
      flickering: 50,
      lineStyle: "round",
      hue: { min: 330, max: 55 }, // Rose gold, champagne, violet, crimson
      delay: { min: 30, max: 60 },
      rocketsPoint: { min: 20, max: 80 },
      lineWidth: { explosion: { min: 1, max: 3 }, trace: { min: 1, max: 2 } },
      brightness: { min: 50, max: 85 },
      decay: { min: 0.015, max: 0.03 },
      mouse: { click: false, move: false, max: 1 },
    });

    fireworksRef.current = fireworks;

    // Listen to custom wedding:celebrate event (e.g. from RSVP submit or button)
    const handleCelebrate = () => {
      try {
        fireworks.launch(5);
      } catch {}
    };

    window.addEventListener("wedding:celebrate", handleCelebrate);

    return () => {
      window.removeEventListener("wedding:celebrate", handleCelebrate);
      try {
        fireworks.stop();
      } catch {}
    };
  }, []);

  // Return null on server and initial hydration to prevent any hydration mismatch
  if (!mounted || pathname?.startsWith("/admin")) {
    return null;
  }

  const handleBurst = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    // Trigger both confetti and canvas fireworks
    triggerCelebration({ x, y });

    if (fireworksRef.current) {
      try {
        fireworksRef.current.launch(6);
      } catch {}
    }

    // Increment count & save
    setWishesCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem("wedding_wishes_count", next.toString());
      } catch {}
      return next;
    });

    // Show floating toast
    setToastMessage("✨ Cảm ơn lời chúc phúc của bạn! 💕");
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  return (
    <>
      {/* Fullscreen fireworks canvas layer (pointer-events-none so it doesn't block clicks) */}
      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none z-40 overflow-hidden"
      />

      {/* Floating Celebration Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 left-4 z-50 animate-bounce bg-white/95 text-rose-600 font-medium px-4 py-2 rounded-2xl shadow-xl border border-rose-200 text-xs sm:text-sm backdrop-blur-sm">
          {toastMessage}
        </div>
      )}

      {/* Floating Celebrate / Firework Button */}
      <button
        onClick={handleBurst}
        className="fixed bottom-4 left-4 z-50 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white pl-3.5 pr-4 py-2.5 rounded-full shadow-lg shadow-rose-500/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all text-xs sm:text-sm font-semibold border border-white/20 group backdrop-blur-xs select-none"
        title="Bắn pháo hoa chúc phúc cô dâu chú rể"
      >
        <span className="text-base sm:text-lg animate-pulse">🎆</span>
        <span className="tracking-wide">Chúc phúc</span>
        <span className="bg-white/25 text-white text-[11px] px-2 py-0.5 rounded-full font-mono">
          {wishesCount}
        </span>
      </button>
    </>
  );
}
