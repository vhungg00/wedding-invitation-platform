"use client";
import Image from "next/image";
import { ImageWithFallback, ImgWithFallback } from "./components/ui/ImageWithFallback";
import { useEffect, useState } from "react";
import AOS from "aos";
import Calendar from "./hooks/calender";
import PhotoAlbum from "./components/PhotoAlbum";
import PersonalizedGreeting from "./components/PersonalizedGreeting";
import RsvpSection from "./components/RsvpSection";
import GuestbookSection from "./components/GuestbookSection";
import GiftBoxSection from "./components/GiftBoxSection";
import defaultWeddingData from "@/data/wedding-data.json";

export default function Home() {
  const [weddingData, setWeddingData] = useState<any>(defaultWeddingData);

  useEffect(() => {
    try {
      AOS.init({
        duration: 1000,
        once: true,
        disable: "mobile",
      });
    } catch {
      // Ignore AOS errors in webview environments
    }
  }, []);

  useEffect(() => {
    fetch("/api/invitation")
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) {
          setWeddingData((prev: any) => ({ ...prev, ...json.data }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.title = weddingData.nhaTrai?.title || weddingData.title;
  }, [weddingData.nhaTrai?.title, weddingData.title]);

  // Events for Nhà Trai
  const nhaTraiData = weddingData.nhaTrai;
  const leThanhHon = nhaTraiData?.events?.[0] || weddingData.events?.[0];
  // Tạm ẩn/comment giờ ăn riêng biệt vì tổ chức đám cưới ở quê (chỉ để 1 mốc thời gian chung)
  const tiecMung = nhaTraiData?.events?.[1];

  const heroDateText =
    nhaTraiData?.hero?.weddingDateText ||
    (leThanhHon
      ? `${leThanhHon.dayOfWeek.toUpperCase()} - ${leThanhHon.time}`
      : weddingData.hero.weddingDateText);

  const formattedDate =
    nhaTraiData?.hero?.dateFormatted ||
    (leThanhHon
      ? `${leThanhHon.solarDate.day} . ${leThanhHon.solarDate.month} . ${leThanhHon.solarDate.year}`
      : weddingData.hero.dateFormatted);

  const bankAccount = nhaTraiData?.donation?.bankAccount || weddingData.donation?.bankAccounts?.[0];

  return (
    <div className="py-2 container overflow-x-hidden max-w-full">
      {/* Hero Section */}
      <div className="md:h-screen h-[70vh] relative overflow-hidden overflow-x-hidden">
        {/* Background Image */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[55%] w-[90%] sm:w-3/4 md:w-2/3 lg:w-2/3 z-0">
          <ImgWithFallback
            src={weddingData.hero?.backgroundImage || "/tach-nen.png"}
            fallbackSrc="/tach-nen.png"
            alt="Background"
            className="block w-full max-h-[80vh] sm:max-h-[85vh] md:max-h-[90vh] object-contain 
      [mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)]
      [-webkit-mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)]"
          />
        </div>

        {/* Content nằm trên */}
        <div className="relative z-10 flex items-end justify-center md:h-full h-[70vh]">
          <div className="relative z-10 flex items-end justify-center ">
            <div className="text-center px-3 sm:px-4 pb-4 sm:pb-6 md:pb-8 lg:pb-12 xl:pb-16">
              <h1 data-aos="zoom-in" className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 md:mb-3 lg:mb-4 drop-shadow-lg">
                <span className="font-imperial-script">{weddingData.groom.name}</span>
                <span className="mx-1 sm:mx-2 md:mx-3">-</span>
                <span className="font-imperial-script">{weddingData.bride.name}</span>
              </h1>
              <p
                data-aos="fade-left"
                className="text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl 2xl:text-2xl drop-shadow-md mb-1 sm:mb-2 md:mb-3"
              >
                {weddingData.hero.title}
              </p>
              <hr data-aos="fade-right" className="my-1 sm:my-2 md:my-3 lg:my-4 border-black mx-auto w-8 sm:w-10 md:w-12 lg:w-16 xl:w-20" />
              <p data-aos="fade-left" className="text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl 2xl:text-2xl drop-shadow-md mb-1 sm:mb-2">
                {heroDateText}
              </p>
              <p
                data-aos="fade-right"
                className="text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl 2xl:text-2xl drop-shadow-md mb-1 sm:mb-2 md:mb-3"
              >
                {formattedDate}
              </p>
              <hr data-aos="fade-left" className="my-1 sm:my-2 md:my-3 lg:my-4 border-black mx-auto w-8 sm:w-10 md:w-12 lg:w-16 xl:w-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Personalized Greeting for Guests (from ?to=...) */}
      <PersonalizedGreeting defaultSide="nha-trai" />

      {/* Quote Section */}
      <div data-aos="fade-down" className="text-center px-3 sm:px-4 py-1 md:py-6 lg:py-8 xl:py-10 text-2xl lg:text-4xl">
        <p className="drop-shadow-md font-imperial-script mb-1 sm:mb-2 md:mb-3">{weddingData.quotes.line1}</p>
        <p className="drop-shadow-md font-imperial-script">{weddingData.quotes.line2}</p>
      </div>

      {/* Family Information Section */}
      <div className="px-3 sm:px-4 py-3 sm:py-4 md:py-6 lg:py-8">
        <div className="grid grid-cols-2 text-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 ">
          <div data-aos="fade-right" className="text-xs sm:text-base md:text-lg lg:text-lg xl:text-xl ">
            <p className="font-semibold mb-1 sm:mb-2 md:mb-3">NHÀ TRAI</p>
            <p className="mb-1 sm:mb-2 text-xs sm:text-base">{weddingData.groom.fatherName}</p>
            <p className="mb-1 sm:mb-2 text-xs sm:text-base">{weddingData.groom.motherName}</p>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base">{weddingData.groom.address}</p>
          </div>
          <div data-aos="fade-left" className="text-xs sm:text-base md:text-lg lg:text-lg xl:text-xl">
            <p className="font-semibold mb-1 sm:mb-2 md:mb-3">NHÀ GÁI</p>
            <p className="mb-1 sm:mb-2 text-xs sm:text-base">{weddingData.bride.fatherName}</p>
            <p className="mb-1 sm:mb-2 text-xs sm:text-base">{weddingData.bride.motherName}</p>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base">{weddingData.bride.address}</p>
          </div>
        </div>
      </div>

      {/* Couple Section */}
      <div className="px-3 lg:px-20 py-3 sm:py-4 md:py-6 lg:py-8">
        <div className="flex justify-between items-center text-center pb-2 text-xl lg:text-4xl overflow-hidden h-auto">
          <div className="w-[40%] no-scrollbar">
            <p data-aos="fade-down" className="font-semibold mb-1 sm:mb-2 md:mb-3 lg:mb-4 h-auto">
              Chú Rể
            </p>
            <p data-aos="fade-up" className="font-imperial-script h-8 sm:h-10 md:h-12 lg:h-14 xl:h-16">
              {weddingData.groom.name}
            </p>
          </div>
          <div className="flex-1 flex justify-center overflow-hidden">
            <div className="heart-beat py-1 sm:py-2 h-auto">
              <Image
                src="/trai-tim.png"
                alt="Heart"
                width={60}
                height={60}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 object-contain"
              />
            </div>
          </div>
          <div className="w-[40%] no-scrollbar">
            <p data-aos="fade-down" className="font-semibold py-2">
              Cô Dâu
            </p>
            <p data-aos="fade-up" className="font-imperial-script h-8 sm:h-10 md:h-12 lg:h-14 xl:h-16">
              {weddingData.bride.name}
            </p>
          </div>
        </div>
        <div className="flex justify-between items-center gap-2 sm:gap-2 md:gap-3 lg:gap-4 py-2 sm:py-2 md:py-3 lg:py-4 overflow-hidden">
          <div data-aos="fade-right" className="w-[45%] h-[30vh] md:h-[65vh] lg:h-[70vh] relative no-scrollbar overflow-hidden">
            <ImageWithFallback
              src={weddingData.groom.avatar || "/chu-re.JPG"}
              fallbackSrc="/chu-re.JPG"
              alt="chu-re"
              fill
              className="object-contain"
            />
          </div>
          <div data-aos="fade-left" className="w-[45%] h-[30vh] md:h-[65vh] lg:h-[70vh] relative no-scrollbar overflow-hidden">
            <ImageWithFallback
              src={weddingData.bride.avatar || "/co-dau.JPG"}
              fallbackSrc="/co-dau.JPG"
              alt="co-dau"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
      <hr data-aos="zoom-in" className="border-black mx-auto w-8 sm:w-10 md:w-12 lg:w-16 xl:w-1/2" />
      <div className="px-3 sm:px-4 py-3 sm:py-4 md:py-6 lg:py-8 no-scrollbar">
        <p
          data-aos="fade-down"
          className="text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl 2xl:text-5xl text-center font-imperial-script mb-1 sm:mb-2"
        >
          Thư mời
        </p>
        <p data-aos="fade-up" className="text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl text-center drop-shadow-md mb-2 sm:mb-3 md:mb-4">
          THAM DỰ LỄ CƯỚI
        </p>
      </div>
      <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 p-1 sm:p-2 overflow-hidden">
        <div data-aos="fade-right" className="basis-[40%] sm:basis-[25%] min-w-0 no-scrollbar overflow-hidden">
          <ImageWithFallback
            src={weddingData.invitationImages?.[0]?.url || "/album/anh-phu-2.JPG"}
            fallbackSrc="/album/anh-phu-2.JPG"
            alt="thu-moi"
            width={200}
            height={400}
            style={{ width: "100%", height: "auto" }}
            className="block rounded-sm max-w-full"
          />
        </div>

        <div data-aos="zoom-in" className="basis-[50%] sm:basis-[30%] min-w-0 no-scrollbar overflow-hidden">
          <ImageWithFallback
            src={weddingData.invitationImages?.[1]?.url || "/album/anh-phu.JPG"}
            fallbackSrc="/album/anh-phu.JPG"
            alt="thu-moi"
            width={200}
            height={450}
            style={{ width: "100%", height: "auto" }}
            className="block rounded-sm max-w-full"
          />
        </div>

        <div data-aos="fade-left" className="basis-[40%] sm:basis-[25%] min-w-0 no-scrollbar overflow-hidden">
          <ImageWithFallback
            src={weddingData.invitationImages?.[2]?.url || "/album/anhphu-3.JPG"}
            fallbackSrc="/album/anhphu-3.JPG"
            alt="thu-moi"
            width={200}
            height={400}
            style={{ width: "100%", height: "auto" }}
            className="block rounded-sm max-w-full"
          />
        </div>
      </div>

      {/* Ngày cưới - Lễ Thành Hôn */}
      {leThanhHon && (
        <div data-aos="fade-up" className="text-center px-3 sm:px-4 py-3 sm:py-4 md:py-6 lg:py-8 xl:py-10">
          <h2 className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl 2xl:text-3xl font-semibold mb-2 sm:mb-3 md:mb-4 lg:mb-6 text-gray-800">
            {leThanhHon.title}
          </h2>

          <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-4 mb-2 sm:mb-3 md:mb-4">
            <span className="text-sm sm:text-sm md:text-base lg:text-lg text-gray-700">Vào Lúc</span>
            <span className="text-base sm:text-lg md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900">
              {leThanhHon.time}
            </span>
            <span className="text-gray-500">|</span>
            <span className="text-sm sm:text-sm md:text-base lg:text-lg text-gray-700 uppercase">
              {leThanhHon.dayOfWeek}
            </span>
          </div>

          <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-4 mb-2 sm:mb-3 md:mb-4">
            <span className="text-sm sm:text-sm md:text-base lg:text-lg text-gray-700">Ngày</span>
            <span className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600">
              {leThanhHon.solarDate.day}
            </span>
            <span className="text-gray-500">|</span>
            <span className="text-sm sm:text-sm md:text-base lg:text-lg text-gray-700">Tháng</span>
            <span className="text-base sm:text-lg md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900">
              {leThanhHon.solarDate.month}
            </span>
            <span className="text-gray-500">|</span>
            <span className="text-sm sm:text-sm md:text-base lg:text-lg text-gray-700">Năm</span>
            <span className="text-base sm:text-lg md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900">
              {leThanhHon.solarDate.year}
            </span>
          </div>

          <p className="text-sm sm:text-sm md:text-base text-gray-600 italic">
            ({leThanhHon.lunarDate})
          </p>
        </div>
      )}

      {/* Ngày cưới - Tiệc mừng Lễ Thành Hôn */}
      {tiecMung && (
        <div data-aos="fade-up" className="text-center px-3 sm:px-4 py-3 sm:py-4 md:py-6 lg:py-8 xl:py-10">
          <h2 className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl 2xl:text-3xl font-semibold mb-2 sm:mb-3 md:mb-4 lg:mb-6 text-gray-800">
            {tiecMung.title}
          </h2>

          <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-4 mb-2 sm:mb-3 md:mb-4">
            <span className="text-sm sm:text-sm md:text-base lg:text-lg text-gray-700">Vào Lúc</span>
            <span className="text-base sm:text-lg md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900">
              {tiecMung.time}
            </span>
            <span className="text-gray-500">|</span>
            <span className="text-sm sm:text-sm md:text-base lg:text-lg text-gray-700 uppercase">
              {tiecMung.dayOfWeek}
            </span>
          </div>

          <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-4 mb-2 sm:mb-3 md:mb-4">
            <span className="text-sm sm:text-sm md:text-base lg:text-lg text-gray-700">Ngày</span>
            <span className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600">
              {tiecMung.solarDate.day}
            </span>
            <span className="text-gray-500">|</span>
            <span className="text-sm sm:text-sm md:text-base lg:text-lg text-gray-700">Tháng</span>
            <span className="text-base sm:text-lg md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900">
              {tiecMung.solarDate.month}
            </span>
            <span className="text-gray-500">|</span>
            <span className="text-sm sm:text-sm md:text-base lg:text-lg text-gray-700">Năm</span>
            <span className="text-base sm:text-lg md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900">
              {tiecMung.solarDate.year}
            </span>
          </div>

          <p className="text-sm sm:text-sm md:text-base text-gray-600 italic">
            ({tiecMung.lunarDate})
          </p>
        </div>
      )}

      {/* Calendar Section */}
      <div data-aos="fade-up" className="px-3 sm:px-4 py-3 sm:py-4 md:py-6">
        <Calendar
          className="w-full h-full"
          month={leThanhHon?.solarDate?.month || 12}
          year={leThanhHon?.solarDate?.year || 2026}
          weddingDay={leThanhHon?.solarDate?.day || 6}
        />
      </div>

      {/* Địa điểm tổ chức */}
      <div data-aos="fade-down" className="px-3 text-3xl sm:text-4xl md:text-4xl lg:text-5xl no-scrollbar overflow-hidden pt-3">
        <p className="font-imperial-script text-center ">Địa điểm tổ chức</p>
      </div>
      <div className="px-3 flex items-center justify-center flex-col gap-3 sm:gap-4">
        {leThanhHon && (
          <div data-aos="fade-right" className="flex items-center justify-center flex-col p-6">
            <div className="text-xl lg:text-2xl text-center">
              <p className="text-center ">{leThanhHon.title}</p>
              <p className=" text-center ">
                <span className=" font-imperial-script">{leThanhHon.time}</span> - <span className="text-base font-mono">{leThanhHon.venueName?.toLowerCase().startsWith('tại') || leThanhHon.venueName?.toLowerCase().startsWith('lễ') ? leThanhHon.venueName : `tại ${leThanhHon.venueName}`}</span>
              </p>
            </div>
            <p className="text-gray-600 text-sm sm:text-sm md:text-base text-center pb-2">
              {leThanhHon.address || weddingData.groom.address}
            </p>
          </div>
        )}

        {tiecMung && (
          <div data-aos="fade-left" className="flex items-center justify-center flex-col p-2">
            <div className="text-xl lg:text-2xl text-center">
              <p className="text-center ">{tiecMung.title}</p>
              <p className=" text-center ">
                <span className=" font-imperial-script">{tiecMung.time}</span> - <span className="text-base font-mono">{tiecMung.venueName?.toLowerCase().startsWith('tại') ? tiecMung.venueName : `tại ${tiecMung.venueName}`}</span>
              </p>
            </div>
            <p className="text-gray-600 text-sm sm:text-sm md:text-base text-center pb-2">
              {tiecMung.address}
            </p>
          </div>
        )}

        <div data-aos="fade-up" className="w-full max-w-full overflow-hidden mt-2">
          {(leThanhHon?.mapUrl || tiecMung?.mapUrl) && (
            <iframe
              src={leThanhHon?.mapUrl || tiecMung?.mapUrl}
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          )}
        </div>
      </div>

      {/* RSVP Section */}
      <RsvpSection defaultSide="nha-trai" />

      {/* Photo Album */}
      <div className="px-3 sm:px-4 py-3 sm:py-4 md:py-6 text-2xl sm:text-3xl md:text-3xl">
        <p data-aos="fade-down" className=" lg:text-4xl xl:text-5xl font-imperial-script text-center mb-3 sm:mb-4 md:mb-6">
          Album ảnh cưới
        </p>
        <PhotoAlbum photos={weddingData.album} />
      </div>

      {/* Guestbook Wishes Section */}
      <GuestbookSection currentSide="nha-trai" />

      {/* Gift Box Section */}
      <GiftBoxSection defaultSide="nha-trai" />

      {/* Thank You Banner */}
      <div className="relative w-full lg:h-[50vh] h-[40vh] overflow-hidden rounded-3xl my-8">
        <div className="absolute inset-0 w-full h-full">
          <Image src="/album/anh-cuoi.JPG" alt="anh-cuoi" fill className="object-cover object-top opacity-20" />
        </div>
        <div data-aos="fade-up" className="relative z-10 flex flex-col items-center justify-center h-full px-4">
          <div className="text-center max-w-2xl text-black/85">
            <p className="text-xl sm:text-2xl md:text-3xl font-imperial-script mb-2 text-rose-600">
              Trân trọng cảm ơn
            </p>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-serif font-medium leading-relaxed drop-shadow-xs">
              {weddingData.donation?.thankYouMessage || "Chân thành cảm ơn quý vị – sự hiện diện của quý vị là niềm vinh hạnh lớn đối với chúng tôi."}
            </h1>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-gray-400 space-y-2">
        <p>Hôn lễ của {weddingData.groom.shortName} & {weddingData.bride.shortName} • 2026</p>
        <p>
          <a href="/admin" className="text-gray-400 hover:text-rose-500 underline transition">
            Quản trị Platform (Admin)
          </a>
        </p>
      </footer>
    </div>
  );
}

