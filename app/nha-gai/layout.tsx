import type { Metadata } from "next";
import weddingData from "@/data/wedding-data.json";

const defaultSiteUrl = "https://damcuoihungly.vercel.app";
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
  ? (process.env.VERCEL_URL.startsWith("http") ? process.env.VERCEL_URL : `https://${process.env.VERCEL_URL}`)
  : defaultSiteUrl;
const siteUrl = rawSiteUrl.replace(/\/$/, "");

const ogImageAbsolute = weddingData.ogImageUrl?.startsWith("http")
  ? weddingData.ogImageUrl
  : `${siteUrl}${weddingData.ogImageUrl || "/og-image.jpg"}?v=2`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: weddingData.nhaGai.title,
  description: weddingData.nhaGai.description,
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: `${siteUrl}/nha-gai`,
    title: weddingData.nhaGai.title,
    description: weddingData.nhaGai.description,
    siteName: "Thiệp Cưới Việt Hùng & Xuân Ly - Nhà Gái",
    images: [
      {
        url: ogImageAbsolute,
        secureUrl: ogImageAbsolute,
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: weddingData.nhaGai.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: weddingData.nhaGai.title,
    description: weddingData.nhaGai.description,
    images: [ogImageAbsolute],
  },
};

export default function NhaGaiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
