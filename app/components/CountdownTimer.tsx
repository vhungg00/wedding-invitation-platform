"use client";
import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate?: string;
  year?: number;
  month?: number;
  day?: number;
  time?: string; // e.g. "10h00" or "10:00"
  title?: string;
  subtitle?: string;
}

export default function CountdownTimer({
  targetDate,
  year = 2026,
  month = 12,
  day = 6,
  time = "10:00",
  title = "Đếm ngược ngày chung đôi",
  subtitle = "SAVE THE DATE",
}: CountdownTimerProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  const parseTime = () => {
    let hour = 10;
    let minute = 0;
    if (time) {
      const match = time.match(/(\d{1,2})[h:](\d{0,2})/i);
      if (match) {
        hour = parseInt(match[1], 10) || 10;
        minute = parseInt(match[2], 10) || 0;
      }
    }
    return { hour, minute };
  };

  const getTargetTimestamp = (): number => {
    if (targetDate) {
      return new Date(targetDate).getTime();
    }
    const { hour, minute } = parseTime();
    return new Date(year, month - 1, day, hour, minute, 0).getTime();
  };

  const calculateTimeLeft = () => {
    const target = getTargetTimestamp();
    const now = new Date().getTime();
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      isPast: false,
    };
  };

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, year, month, day, time]);

  const timeUnits = [
    { label: "NGÀY", value: timeLeft.days },
    { label: "GIỜ", value: timeLeft.hours },
    { label: "PHÚT", value: timeLeft.minutes },
    { label: "GIÂY", value: timeLeft.seconds },
  ];

  return (
    <div
      suppressHydrationWarning
      className="w-full max-w-xl mx-auto px-4 py-6 text-center select-none my-4"
    >
      {subtitle && (
        <p className="text-xs sm:text-sm font-medium tracking-[0.25em] text-rose-500 uppercase mb-1">
          {subtitle}
        </p>
      )}
      {title && (
        <h3 className="font-imperial-script text-3xl sm:text-4xl text-gray-800 mb-6 drop-shadow-xs">
          {title}
        </h3>
      )}

      {mounted && timeLeft.isPast ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 py-4 px-6 rounded-2xl shadow-xs">
          <p className="text-base sm:text-lg font-serif font-medium">
            🎉 Ngày trọng đại đã đến! Chúc mừng hạnh phúc đôi uyên ương 🎉
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto">
          {timeUnits.map((unit, index) => (
            <div
              key={index}
              className="bg-white/90 border border-rose-100/90 rounded-2xl p-2.5 sm:p-4 shadow-sm flex flex-col items-center justify-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-300 via-rose-400 to-rose-300 opacity-80" />
              <span
                suppressHydrationWarning
                className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-gray-800 tracking-tight"
              >
                {mounted ? String(unit.value).padStart(2, "0") : "--"}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-rose-600 tracking-widest mt-1">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
