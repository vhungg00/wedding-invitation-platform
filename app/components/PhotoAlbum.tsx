"use client";

import { ImageWithFallback } from "@/app/components/ui/ImageWithFallback";
import { useEffect, useState } from "react";
import AOS from "aos";
import weddingData from "@/data/wedding-data.json";

export interface PhotoItem {
  src?: string;
  url?: string;
  alt?: string;
  aos?: string;
  aosAnimation?: string;
}

interface PhotoAlbumProps {
  photos?: PhotoItem[];
}

const PUBLIC_FALLBACK_PHOTOS = [
  "/album/anh-chinh.JPG",
  "/album/anh-cuoi.JPG",
  "/album/anh-phu-2.JPG",
  "/album/anh-phu.JPG",
  "/album/anhphu-3.JPG",
  "/album/anhphu-4.JPG",
  "/album/anhphu-5.JPG",
  "/album/anhphu-6.JPG",
];

const PhotoAlbum: React.FC<PhotoAlbumProps> = ({ photos }) => {
  const [dynamicPhotos, setDynamicPhotos] = useState<PhotoItem[] | null>(null);

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
    if (!photos) {
      fetch("/api/invitation")
        .then((res) => res.json())
        .then((json) => {
          if (json?.data?.album && Array.isArray(json.data.album) && json.data.album.length > 0) {
            setDynamicPhotos(json.data.album);
          }
        })
        .catch(() => {});
    }
  }, [photos]);

  const displayPhotos: PhotoItem[] =
    photos && photos.length > 0
      ? photos
      : dynamicPhotos || ((weddingData.album as PhotoItem[]) || []);

  return (
    <div className="px-3 sm:px-4 py-3 sm:py-4 md:py-6 no-scrollbar">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 no-scrollbar overflow-hidden">
        {displayPhotos.map((photo, index) => {
          const fallback = PUBLIC_FALLBACK_PHOTOS[index % PUBLIC_FALLBACK_PHOTOS.length];
          const imgSrc = photo.src || photo.url || fallback;
          const anim = photo.aos || photo.aosAnimation || "zoom-in";

          return (
            <div key={index} className="relative group cursor-pointer" data-aos={anim}>
              <div className="aspect-[3/4] relative overflow-hidden rounded-md sm:rounded-lg shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 no-scrollbar">
                <ImageWithFallback
                  src={imgSrc}
                  fallbackSrc={fallback}
                  alt={photo.alt || "Ảnh cưới"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PhotoAlbum;
