import type { Metadata } from "next";
import weddingData from "@/data/wedding-data.json";

export const metadata: Metadata = {
  title: weddingData.nhaGai.title,
  description: weddingData.nhaGai.description,
  openGraph: {
    title: weddingData.nhaGai.title,
    description: weddingData.nhaGai.description,
    images: [
      {
        url: weddingData.ogImageUrl || "/album/anh-chinh.JPG",
        width: 1200,
        height: 630,
        alt: weddingData.nhaGai.title,
      },
    ],
  },
};

export default function NhaGaiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
