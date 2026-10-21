"use client";
import React, { useState, useEffect } from "react";
import weddingData from "@/data/wedding-data.json";

interface CalendarProps {
  className?: string;
  month?: number;
  year?: number;
  weddingDay?: number;
}

const Calendar: React.FC<CalendarProps> = ({
  className = "",
  month = weddingData.calendar?.month || 12,
  year = weddingData.calendar?.year || 2026,
  weddingDay = weddingData.calendar?.weddingDay || 6,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Tạo lịch tháng 10/2025
  const getCalendarData = () => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDate = new Date(firstDay);

    // Tìm ngày đầu tuần của tuần đầu tiên
    const dayOfWeek = firstDay.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const days = [];
    const currentDate = new Date(startDate);

    // Tạo 6 tuần (42 ngày) để đảm bảo lịch đầy đủ
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const days = getCalendarData();
  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const isCurrentMonth = (date: Date) => date.getMonth() === month - 1;
  const isWeddingDay = (date: Date) => date.getDate() === weddingDay && date.getMonth() === month - 1;
  const isToday = (date: Date) => {
    if (!mounted) return false;
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  return (
    <div className={`calendar-container ${className}`}>
      {/* Header */}
      <div className="calendar-header">
        <h3 className="calendar-title">
          {monthNames[month - 1]} {year}
        </h3>
      </div>
      {/* Week days header */}
      <div className="calendar-weekdays">
        {weekDays.map((day, index) => (
          <div key={index} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>
      {/* Calendar grid */}
      <div className="calendar-grid">
        {days.map((date, index) => {
          const isCurrentMonthDay = isCurrentMonth(date);
          const isWedding = isWeddingDay(date);
          const isCurrentDay = isToday(date);

          return (
            <div
              key={index}
              className={`calendar-day ${!isCurrentMonthDay ? "other-month" : ""} ${isWedding ? "wedding-day" : ""} ${isCurrentDay ? "today" : ""}`}
            >
              <span className="day-number">{date.getDate()}</span>
              {isWedding && (
                <div className="wedding-indicator">
                  <div className="heart-icon">💕</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
