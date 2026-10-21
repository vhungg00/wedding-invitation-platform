import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Imperial_Script } from "next/font/google";
import { Monsieur_La_Doulaise } from "next/font/google";
import "./globals.css";
import "aos/dist/aos.css";
import MusicPlayer from "./components/MusicPlayer";
import weddingData from "@/data/wedding-data.json";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const monsieurLaDoulaise = Monsieur_La_Doulaise({
  variable: "--font-monsieur-la-doulaise",
  subsets: ["latin"],
  weight: "400",
});

const imperialScript = Imperial_Script({
  variable: "--font-imperial-script",
  subsets: ["latin"],
  weight: "400",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_URL
  ? (process.env.VERCEL_URL.startsWith("http") ? process.env.VERCEL_URL : `https://${process.env.VERCEL_URL}`)
  : "http://localhost:3000";
const siteUrl = rawSiteUrl.replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: weddingData.nhaTrai?.title || weddingData.title,
  description: weddingData.nhaTrai?.description || weddingData.description,
  icons: {
    icon: [
      {
        url: "/favicons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/favicons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicons/favicon.ico",
      },
    ],
    apple: [
      {
        url: "/favicons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/favicons/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: siteUrl,
    title: weddingData.nhaTrai?.title || weddingData.title,
    description: weddingData.nhaTrai?.description || weddingData.description,
    siteName: "Thiệp Cưới Việt Hùng & Xuân Ly",
    images: [
      {
        url: weddingData.ogImageUrl || "/album/anh-chinh.JPG",
        width: 1200,
        height: 630,
        alt: weddingData.nhaTrai?.title || weddingData.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: weddingData.nhaTrai?.title || weddingData.title,
    description: weddingData.nhaTrai?.description || weddingData.description,
    images: [weddingData.ogImageUrl || "/album/anh-chinh.JPG"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className="overflow-x-hidden">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${monsieurLaDoulaise.variable} ${imperialScript.variable} antialiased overflow-x-hidden`}
      >
        {children}
        <MusicPlayer />
      </body>
    </html>
  );
}
