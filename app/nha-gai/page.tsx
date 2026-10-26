"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import AOS from "aos";
import dynamic from "next/dynamic";
import { MapPin, Navigation, CalendarHeart, Clock } from "lucide-react";
import PhotoAlbum from "../components/PhotoAlbum";
import Calendar from "../hooks/calender";

const CountdownTimer = dynamic(() => import("../components/CountdownTimer"), {
  ssr: false,
});
import WaxSealEnvelope from "../components/WaxSealEnvelope";
import PersonalizedGreeting from "../components/PersonalizedGreeting";
import RsvpSection from "../components/RsvpSection";
import GiftBoxSection from "../components/GiftBoxSection";
import FloatingWishes from "../components/FloatingWishes";
import defaultWeddingData from "@/data/wedding-data.json";

export default function NhaGaiPage() {
  const [data, setData] = useState<any>(defaultWeddingData);

  useEffect(() => {
    try {
      AOS.init({
        duration: 1800,
        once: false,
      });
    } catch {}
  }, []);

  useEffect(() => {
    fetch("/api/invitation")
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) {
          setData((prev: any) => ({ ...prev, ...json.data }));
        }
      })
      .catch(() => {});
  }, []);

  const nhaGaiData = data.nhaGai;
  const commonData = data;

  const tiecVuQuy = nhaGaiData?.events?.[0];
  const leVuQuy = nhaGaiData?.events?.[1];

  const heroDateText =
    nhaGaiData?.hero?.weddingDateText ||
    (tiecVuQuy
      ? `${tiecVuQuy.dayOfWeek.toUpperCase()} - ${tiecVuQuy.time}`
      : "THỨ BẢY - 10H30");

  const formattedDate =
    nhaGaiData?.hero?.dateFormatted ||
    (tiecVuQuy
      ? `${String(tiecVuQuy.solarDate.day).padStart(2, "0")} . ${String(tiecVuQuy.solarDate.month).padStart(2, "0")} . ${tiecVuQuy.solarDate.year}`
      : "05 . 12 . 2026");

  const primaryAddress =
    tiecVuQuy?.address || commonData.bride?.address || "1003 Lê Thanh, Phường Cam Đường, Tỉnh Lào Cai";
  const googleMapsDirectionUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    primaryAddress
  )}`;

  return (
    <div
      style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontVariantNumeric: "lining-nums tabular-nums" }}
      className="min-h-screen bg-white text-[#2C221E] lining-nums tabular-nums overflow-x-hidden max-w-full"
    >
      {/* Interactive Wax Seal Envelope Opening */}
      <WaxSealEnvelope
        groomName={commonData.groom.name}
        brideName={commonData.bride.name}
        weddingDate={formattedDate}
      />

      <div className="py-2 container overflow-x-hidden max-w-full">
        {/* Hero Section */}
        <div className="md:h-screen h-[74vh] relative overflow-hidden">
          {/* Soft radial luxury aura behind couple */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[520px] h-[340px] sm:h-[520px] rounded-full bg-radial from-amber-200/35 via-rose-200/15 to-transparent blur-3xl pointer-events-none z-0" />

          {/* Background Image */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[56%] w-[92%] sm:w-3/4 md:w-2/3 lg:w-2/3 z-0">
            <img
              src={
                nhaGaiData?.hero?.backgroundImage ||
                commonData.hero?.backgroundImage ||
                "/tach-nen.png"
              }
              alt="Background"
              className="block w-full max-h-[78vh] sm:max-h-[85vh] md:max-h-[90vh] object-contain 
        [mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)]
        [-webkit-mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)]"
            />
          </div>

          {/* Content nằm trên */}
          <div className="relative z-10 flex items-end justify-center md:h-full h-[74vh]">
            <div className="text-center px-4 pb-6 sm:pb-8 md:pb-12">
              <div
                data-aos="fade-down"
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-[#D4AF37]/40 shadow-sm mb-3"
              >
                <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#8C6D3F] font-bold">
                  Save The Date
                </span>
              </div>

              <h1
                data-aos="zoom-in"
                className="text-4xl sm:text-6xl lg:text-7xl font-normal text-[#7A1C24] mb-2 sm:mb-3 drop-shadow-sm"
              >
                <span className="font-imperial-script">{commonData.bride.name}</span>
                <span className="mx-2 sm:mx-4 text-[#C59B5F] font-serif text-3xl sm:text-4xl">&amp;</span>
                <span className="font-imperial-script">{commonData.groom.name}</span>
              </h1>

              <p
                data-aos="fade-left"
                className="text-base sm:text-lg md:text-xl tracking-[0.25em] uppercase text-[#5C4938] font-bold mb-2"
              >
                {nhaGaiData?.hero?.title || "THƯ MỜI TIỆC CƯỚI"}
              </p>

              {/* Ornamental Gold Divider */}
              <div data-aos="zoom-in" className="flex items-center justify-center gap-3 my-2.5">
                <span className="h-[1px] w-14 sm:w-24 bg-gradient-to-r from-transparent to-[#C59B5F]" />
                <span className="text-[#C59B5F] text-sm">✦</span>
                <span className="h-[1px] w-14 sm:w-24 bg-gradient-to-l from-transparent to-[#C59B5F]" />
              </div>

              <p
                data-aos="fade-left"
                className="font-sans text-base sm:text-lg md:text-xl tracking-[0.16em] uppercase text-[#3D2E24] font-bold mb-1.5"
              >
                {heroDateText}
              </p>
              <p
                data-aos="fade-right"
                className="font-sans text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-[0.2em] text-[#8B1E2F]"
              >
                {formattedDate}
              </p>
            </div>
          </div>
        </div>

        {/* Personalized Greeting for Guests */}
        <PersonalizedGreeting defaultSide="nha-gai" />

        {/* Quote Section */}
        <div
          data-aos="fade-up"
          className="text-center px-2 sm:px-4 py-6 sm:py-10 mx-auto"
        >
          <p className="font-imperial-script text-[2.5rem] sm:text-6xl md:text-7xl lg:text-[4.5rem] text-[#7A1C24] mb-2 sm:mb-3 leading-snug drop-shadow-xs">
            {commonData.quotes.line1}
          </p>
          <p className="font-imperial-script text-[2.5rem] sm:text-6xl md:text-7xl lg:text-[4.5rem] text-[#7A1C24] leading-snug drop-shadow-xs">
            {commonData.quotes.line2}
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <span className="text-[#D4AF37] text-base">❦</span>
            <span className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#D4AF37]" />
          </div>
        </div>

        {/* Family Information Section - Luxury Card */}
        <div className="px-3 sm:px-6 py-4 sm:py-8 max-w-4xl mx-auto">
          <div
            data-aos="fade-up"
            className="relative rounded-3xl bg-white/85 backdrop-blur-md border border-[#E6D5B8] shadow-[0_12px_40px_rgba(139,109,63,0.08)] p-6 sm:p-10"
          >
            <div className="absolute inset-2.5 rounded-2xl border border-[#EFE3CE] pointer-events-none" />

            <div className="relative grid grid-cols-1 sm:grid-cols-2 text-center gap-6 sm:gap-8 items-start">
              <div className="hidden sm:block absolute left-1/2 top-4 bottom-4 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-[#D4AF37]/50 to-transparent" />

              <div data-aos="fade-right" className="space-y-2 px-2">
                <p className="text-base sm:text-lg tracking-[0.22em] uppercase text-[#8C6D3F] font-bold mb-2">
                  NHÀ GÁI
                </p>
                <p className="text-xl sm:text-2xl md:text-2xl font-bold text-[#2C221E] tracking-wide">
                  {commonData.bride.fatherName}
                </p>
                <p className="text-xl sm:text-2xl md:text-2xl font-bold text-[#2C221E] tracking-wide">
                  {commonData.bride.motherName}
                </p>
                <p className="text-[#5C4938] text-base sm:text-lg md:text-xl italic pt-1">
                  {commonData.bride.address}
                </p>
              </div>

              <div className="sm:hidden flex items-center justify-center gap-2">
                <span className="h-[1px] w-16 bg-[#E6D5B8]" />
                <span className="text-[#C59B5F] text-xs">✦</span>
                <span className="h-[1px] w-16 bg-[#E6D5B8]" />
              </div>

              <div data-aos="fade-left" className="space-y-2 px-2">
                <p className="text-base sm:text-lg tracking-[0.22em] uppercase text-[#8C6D3F] font-bold mb-2">
                  NHÀ TRAI
                </p>
                <p className="text-xl sm:text-2xl md:text-2xl font-bold text-[#2C221E] tracking-wide">
                  {commonData.groom.fatherName}
                </p>
                <p className="text-xl sm:text-2xl md:text-2xl font-bold text-[#2C221E] tracking-wide">
                  {commonData.groom.motherName}
                </p>
                <p className="text-[#5C4938] text-base sm:text-lg md:text-xl italic pt-1">
                  {commonData.groom.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Couple Section - Arch Portrait Frames */}
        <div className="px-3 lg:px-16 py-6 sm:py-10 max-w-5xl mx-auto">
          <div className="flex justify-between items-center text-center pb-4 sm:pb-6">
            <div className="w-[42%]">
              <p
                data-aos="fade-down"
                className="text-base sm:text-lg md:text-xl uppercase tracking-[0.22em] text-[#8C6D3F] font-bold mb-1"
              >
                Cô Dâu
              </p>
              <p
                data-aos="fade-up"
                className="font-imperial-script text-4xl sm:text-5xl lg:text-6xl text-[#7A1C24]"
              >
                {commonData.bride.name}
              </p>
            </div>

            <div className="flex-1 flex justify-center">
              <div className="heart-beat py-1">
                <Image
                  src="/trai-tim.png"
                  alt="Heart"
                  width={60}
                  height={60}
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain mix-blend-multiply"
                />
              </div>
            </div>

            <div className="w-[42%]">
              <p
                data-aos="fade-down"
                className="text-base sm:text-lg md:text-xl uppercase tracking-[0.22em] text-[#8C6D3F] font-bold mb-1"
              >
                Chú Rể
              </p>
              <p
                data-aos="fade-up"
                className="font-imperial-script text-4xl sm:text-5xl lg:text-6xl text-[#7A1C24]"
              >
                {commonData.groom.name}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:gap-10 py-2">
            <div
              data-aos="fade-right"
              className="group relative h-[36vh] sm:h-[54vh] md:h-[66vh] rounded-3xl overflow-hidden bg-white p-1.5 sm:p-2.5 border border-[#DEC397] shadow-[0_15px_35px_rgba(139,109,63,0.14)]"
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#FAF6F0]">
                <Image
                  src={commonData.bride?.avatar || "/co-dau.JPG"}
                  alt="co-dau"
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>

            <div
              data-aos="fade-left"
              className="group relative h-[36vh] sm:h-[54vh] md:h-[66vh] rounded-3xl overflow-hidden bg-white p-1.5 sm:p-2.5 border border-[#DEC397] shadow-[0_15px_35px_rgba(139,109,63,0.14)]"
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#FAF6F0]">
                <Image
                  src={commonData.groom?.avatar || "/chu-re.JPG"}
                  alt="chu-re"
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ornamental Divider */}
        <div data-aos="zoom-in" className="flex items-center justify-center gap-3 my-4">
          <span className="h-[1px] w-20 sm:w-40 bg-gradient-to-r from-transparent to-[#C59B5F]" />
          <span className="text-[#C59B5F] text-base">❖</span>
          <span className="h-[1px] w-20 sm:w-40 bg-gradient-to-l from-transparent to-[#C59B5F]" />
        </div>

        {/* Thư Mời Header */}
        <div className="px-4 py-4 sm:py-6 text-center">
          <p
            data-aos="fade-down"
            className="text-4xl sm:text-6xl lg:text-7xl font-imperial-script text-[#7A1C24] mb-1"
          >
            Thư mời
          </p>
          <p
            data-aos="fade-up"
            className="text-base sm:text-lg md:text-xl tracking-[0.3em] uppercase text-[#8C6D3F] font-bold"
          >
            THAM DỰ LỄ CƯỚI
          </p>
        </div>

        {/* 3 Triptych Invitation Photos */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8 px-2 sm:px-6 py-2 max-w-4xl mx-auto">
          <div
            data-aos="fade-right"
            className="basis-[32%] min-w-0 rounded-2xl p-1 sm:p-1.5 bg-white border border-[#E6D5B8] shadow-md overflow-hidden"
          >
            <Image
              src={commonData.invitationImages?.[0]?.url || "/album/anh-phu-2.JPG"}
              alt="thu-moi"
              width={260}
              height={420}
              style={{ width: "100%", height: "auto" }}
              className="block rounded-xl max-w-full object-cover"
            />
          </div>

          <div
            data-aos="zoom-in"
            className="basis-[36%] min-w-0 rounded-2xl p-1 sm:p-2 bg-white border-2 border-[#D4AF37]/60 shadow-xl -translate-y-2 overflow-hidden"
          >
            <Image
              src={commonData.invitationImages?.[1]?.url || "/album/anh-phu.JPG"}
              alt="thu-moi"
              width={300}
              height={480}
              style={{ width: "100%", height: "auto" }}
              className="block rounded-xl max-w-full object-cover"
            />
          </div>

          <div
            data-aos="fade-left"
            className="basis-[32%] min-w-0 rounded-2xl p-1 sm:p-1.5 bg-white border border-[#E6D5B8] shadow-md overflow-hidden"
          >
            <Image
              src={commonData.invitationImages?.[2]?.url || "/album/anhphu-3.JPG"}
              alt="thu-moi"
              width={260}
              height={420}
              style={{ width: "100%", height: "auto" }}
              className="block rounded-xl max-w-full object-cover"
            />
          </div>
        </div>

        {/* Ngày cưới - Tiệc Vu Quy (Luxury Event Card) */}
        {tiecVuQuy && (
          <div
            data-aos="fade-up"
            className="px-3 sm:px-6 py-6 sm:py-10 max-w-3xl mx-auto"
          >
            <div className="relative rounded-3xl bg-white/90 backdrop-blur-md border border-[#DEC397] shadow-[0_15px_45px_rgba(139,109,63,0.1)] p-6 sm:p-10 text-center overflow-hidden">
              <div className="absolute inset-2.5 rounded-2xl border border-[#F2E6D0] pointer-events-none" />

              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FDF6EC] border border-[#E6D5B8] text-[#8C6D3F] text-sm sm:text-base font-bold tracking-[0.18em] uppercase mb-3">
                <CalendarHeart className="w-4 h-4 text-[#8B1E2F]" />
                <span>Trân Trọng Báo Tin</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-[0.1em] uppercase text-[#7A1C24] mb-5">
                {tiecVuQuy.title}
              </h2>

              <div className="inline-flex items-center justify-center gap-2 sm:gap-3 px-5 py-2.5 rounded-full bg-[#FAF3E8] border border-[#E6D5B8] text-[#3D2E24] font-sans text-sm sm:text-base md:text-lg mb-6">
                <Clock className="w-4 h-4 text-[#8B1E2F]" />
                <span className="font-medium">Vào lúc</span>
                <strong className="text-base sm:text-xl font-extrabold text-[#8B1E2F] tracking-wide">
                  {tiecVuQuy.time}
                </strong>
                <span className="text-[#C59B5F]">•</span>
                <span className="uppercase font-bold tracking-wider">
                  {tiecVuQuy.dayOfWeek}
                </span>
              </div>

              {/* Luxury Editorial Date Display */}
              <div className="grid grid-cols-3 items-center max-w-md mx-auto py-4 border-y border-[#E6D5B8]">
                <div className="text-center">
                  <span className="block text-sm sm:text-base uppercase tracking-[0.18em] text-[#8C6D3F] font-bold mb-1">
                    Tháng
                  </span>
                  <span className="font-sans text-2xl sm:text-3xl font-extrabold text-[#2C221E]">
                    {String(tiecVuQuy.solarDate.month).padStart(2, "0")}
                  </span>
                </div>

                <div className="border-x border-[#E6D5B8] px-3">
                  <span className="block text-sm sm:text-base uppercase tracking-[0.18em] text-[#8B1E2F] font-bold mb-1">
                    Ngày
                  </span>
                  <span className="font-sans text-4xl sm:text-5xl font-extrabold text-[#8B1E2F] leading-none">
                    {String(tiecVuQuy.solarDate.day).padStart(2, "0")}
                  </span>
                </div>

                <div className="text-center">
                  <span className="block text-sm sm:text-base uppercase tracking-[0.18em] text-[#8C6D3F] font-bold mb-1">
                    Năm
                  </span>
                  <span className="font-sans text-2xl sm:text-3xl font-extrabold text-[#2C221E]">
                    {tiecVuQuy.solarDate.year}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-base sm:text-lg md:text-xl text-[#5C4938] italic">
                ({tiecVuQuy.lunarDate})
              </p>
            </div>
          </div>
        )}

        {/* Ngày cưới - Lễ Vu Quy (nếu có sự kiện thứ 2) */}
        {leVuQuy && (
          <div data-aos="fade-up" className="text-center px-4 py-4 max-w-2xl mx-auto">
            <h2 className="text-lg sm:text-2xl font-bold text-[#7A1C24] mb-2">
              {leVuQuy.title}
            </h2>
            <p className="text-base sm:text-lg text-[#4A3B2C]">
              Vào lúc <strong>{leVuQuy.time}</strong> |{" "}
              <span className="uppercase">{leVuQuy.dayOfWeek}</span>, ngày{" "}
              <strong className="text-[#8B1E2F]">
                {String(leVuQuy.solarDate.day).padStart(2, "0")}.
                {String(leVuQuy.solarDate.month).padStart(2, "0")}.
                {leVuQuy.solarDate.year}
              </strong>
            </p>
            <p className="text-sm text-[#6E5D4F] italic mt-1">
              ({leVuQuy.lunarDate})
            </p>
          </div>
        )}

        {/* Countdown Timer Section */}
        <CountdownTimer
          year={tiecVuQuy?.solarDate?.year || 2026}
          month={tiecVuQuy?.solarDate?.month || 12}
          day={tiecVuQuy?.solarDate?.day || 5}
          time={tiecVuQuy?.time || "10h30"}
          title="Đếm ngược ngày chung đôi"
          subtitle="SAVE THE DATE"
        />

        {/* Calendar Section */}
        <div data-aos="fade-up" className="px-3 sm:px-4 py-4 sm:py-6">
          <Calendar
            className="w-full h-full"
            month={tiecVuQuy?.solarDate?.month || 12}
            year={tiecVuQuy?.solarDate?.year || 2026}
            weddingDay={tiecVuQuy?.solarDate?.day || 5}
          />
        </div>

        {/* Địa điểm tổ chức - Luxury Venue & Map Card */}
        <div id="location-section" className="px-3 sm:px-6 py-6 sm:py-10 max-w-4xl mx-auto">
          <div data-aos="fade-down" className="text-center mb-6">
            <p className="font-imperial-script text-4xl sm:text-5xl lg:text-6xl text-[#7A1C24]">
              Địa điểm tổ chức
            </p>
            <div className="flex items-center justify-center gap-3 mt-1">
              <span className="h-[1px] w-14 bg-gradient-to-r from-transparent to-[#C59B5F]" />
              <MapPin className="w-4 h-4 text-[#C59B5F]" />
              <span className="h-[1px] w-14 bg-gradient-to-l from-transparent to-[#C59B5F]" />
            </div>
          </div>

          <div
            data-aos="fade-up"
            className="rounded-3xl bg-white/90 backdrop-blur-md border border-[#E6D5B8] shadow-[0_15px_45px_rgba(139,109,63,0.1)] p-5 sm:p-8 space-y-6"
          >
            {tiecVuQuy && (
              <div className="text-center space-y-2.5">
                <p className="text-sm sm:text-base uppercase tracking-[0.22em] text-[#8C6D3F] font-bold">
                  {tiecVuQuy.title}
                </p>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2C221E]">
                  {tiecVuQuy.venueName?.toLowerCase().startsWith("tại")
                    ? tiecVuQuy.venueName
                    : `Tại ${tiecVuQuy.venueName}`}
                </h3>
                <p className="text-lg sm:text-xl md:text-2xl text-[#4A3B2C] max-w-xl mx-auto font-medium">
                  📍 {primaryAddress}
                </p>

                {/* Nút Mở Google Maps Chỉ Đường 1-Chạm */}
                <div className="pt-2">
                  <a
                    href={googleMapsDirectionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#8B1E2F] to-[#B91C1C] hover:opacity-95 text-white text-sm sm:text-base font-sans font-semibold shadow-md shadow-rose-900/20 transition transform hover:-translate-y-0.5"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Mở Google Maps Chỉ Đường</span>
                  </a>
                </div>
              </div>
            )}

            {leVuQuy && (
              <div className="text-center pt-4 border-t border-[#EFE3CE] space-y-1">
                <p className="text-sm uppercase tracking-[0.2em] text-[#8C6D3F] font-bold">
                  {leVuQuy.title}
                </p>
                <p className="text-lg font-semibold text-[#2C221E]">
                  {leVuQuy.time} — {leVuQuy.venueName}
                </p>
                <p className="text-sm sm:text-base text-[#5C4938]">{leVuQuy.address}</p>
              </div>
            )}

            {(tiecVuQuy?.mapUrl || leVuQuy?.mapUrl) && (
              <div className="w-full rounded-2xl overflow-hidden border border-[#E6D5B8] shadow-inner">
                <iframe
                  src={tiecVuQuy?.mapUrl || leVuQuy?.mapUrl}
                  width="100%"
                  height="320"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        </div>

        {/* RSVP Section */}
        <RsvpSection defaultSide="nha-gai" />

        {/* Photo Album */}
        <div className="px-3 sm:px-4 py-6 sm:py-10">
          <div data-aos="fade-down" className="text-center mb-6">
            <p className="text-4xl sm:text-5xl lg:text-6xl font-imperial-script text-[#7A1C24]">
              Album ảnh cưới
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-[#8C6D3F] font-semibold mt-1">
              KHOẢNH KHẮC HẠNH PHÚC
            </p>
          </div>
          <PhotoAlbum photos={commonData.album} />
        </div>

        {/* Floating Wishes + Fireworks */}
        <FloatingWishes currentSide="nha-gai" />

        {/* Gift Box Section */}
        <GiftBoxSection defaultSide="nha-gai" data={data} />

        {/* Thank You Banner */}
        <div className="relative w-full lg:h-[48vh] h-[38vh] overflow-hidden rounded-3xl my-8 border border-[#E6D5B8] shadow-lg">
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="/album/anh-cuoi.JPG"
              alt="anh-cuoi"
              fill
              className="object-cover object-top opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/65 to-white/90" />
          </div>
          <div
            data-aos="fade-up"
            className="relative z-10 flex flex-col items-center justify-center h-full px-6"
          >
            <div className="text-center max-w-2xl">
              <p className="text-4xl sm:text-5xl md:text-6xl font-imperial-script mb-3 text-[#7A1C24]">
                Trân trọng cảm ơn
              </p>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-semibold italic text-[#3D2E24] leading-relaxed">
                &ldquo;
                {nhaGaiData?.donation?.thankYouMessage ||
                  commonData.donation?.thankYouMessage ||
                  "Chân thành cảm ơn quý vị – sự hiện diện của quý vị là niềm vinh hạnh lớn đối với chúng tôi."}
                &rdquo;
              </h2>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-8 text-xs text-[#8C7A6B] space-y-2 font-sans">
          <p className="tracking-widest uppercase">
            Hôn lễ của {commonData.bride.shortName} &amp; {commonData.groom.shortName} • 2026
          </p>
          <p>
            <a
              href="/admin"
              className="text-[#8C7A6B] hover:text-[#7A1C24] underline transition"
            >
              Quản trị Platform (Admin)
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
