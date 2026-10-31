"use client";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import weddingData from "@/data/wedding-data.json";

export default function MusicPlayer() {
  const pathname = usePathname();
  const isNhaGai = pathname?.startsWith("/nha-gai");

  const audioSrc = isNhaGai
    ? "/yesIDo.mp3"
    : weddingData.music?.audioUrl || "/may-man.mp3";
  const songTitle = isNhaGai
    ? "Yes I Do"
    : weddingData.music?.songTitle || "May Mắn";

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Try autoplay muted (policy-friendly). If blocked, user can still click the button.

  // Khi chuyển trang giữa Nhà Trai và Nhà Gái, cập nhật lại bài nhạc
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioSrc]);

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        // ensure unmuted when user explicitly plays
        audio.muted = false;
        await audio.play();
        setIsPlaying(true);
      }
    } catch (err) {
      setIsPlaying(false);
    }
  };
  useEffect(() => {
    if (hasAutoStarted) return; // Don't add listener if already auto-started

    const clickWindow = () => {
      if (buttonRef.current && !isPlaying) {
        buttonRef.current.click();
        setHasAutoStarted(true);
        // Remove the event listener after first click
        window.removeEventListener("click", clickWindow);
      }
    };
    window.addEventListener("click", clickWindow);
    return () => {
      window.removeEventListener("click", clickWindow);
    };
  }, [hasAutoStarted, isPlaying]);

  return (
    <>
      <audio
        ref={audioRef}
        src={audioSrc}
        loop
        playsInline
        preload="metadata"
        style={{ display: "none" }}
      />

      <button
        ref={buttonRef}
        onClick={toggleMusic}
        className={`fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
          isPlaying ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-pink-500 hover:bg-pink-600"
        } ${!isLoaded ? "opacity-90" : ""}`}
        title={isPlaying ? "Tắt nhạc" : `Bật nhạc - ${songTitle}`}
      >
        <div className="flex items-center justify-center text-white text-xl">
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>

        {/* Music notes animation */}
        {isPlaying && (
          <div className="absolute -top-2 -right-2">
            <div className="music-note">♪</div>
            <div className="music-note delay-100">♫</div>
            <div className="music-note delay-200">♪</div>
          </div>
        )}

        {/* Song title tooltip */}
        <div className="absolute -top-12 right-0 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-300">
          {songTitle}
        </div>
      </button>

      {/* Thông báo lỗi/ trạng thái nhỏ gọn (tùy chọn) */}
    </>
  );
}
