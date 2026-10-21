import type { Metadata } from "next";
import weddingData from "@/data/wedding-data.json";

export const metadata: Metadata = {
  title: weddingData.nhaGai.title,
  description: weddingData.nhaGai.description,
  openGraph: {
    type: "website",
    locale: "vi_VN",
    title: weddingData.nhaGai.title,
    description: weddingData.nhaGai.description,
    siteName: "Thiệp Cưới Việt Hùng & Xuân Ly - Nhà Gái",
    images: [
      {
        url: weddingData.ogImageUrl || "/album/anh-chinh.JPG",
        width: 1200,
        height: 630,
        alt: weddingData.nhaGai.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: weddingData.nhaGai.title,
    description: weddingData.nhaGai.description,
    images: [weddingData.ogImageUrl || "/album/anh-chinh.JPG"],
  },
};

export default function NhaGaiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
