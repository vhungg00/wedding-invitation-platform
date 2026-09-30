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

export const metadata: Metadata = {
  title: weddingData.nhaTrai?.title || weddingData.title,
  description: weddingData.nhaTrai?.description || weddingData.description,
  icons: [
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: weddingData.faviconUrl || "/favicons/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      url: weddingData.faviconUrl || "/favicons/favicon-16x16.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      url: weddingData.faviconUrl || "/favicons/apple-touch-icon.png",
    },
  ],
  openGraph: {
    title: weddingData.nhaTrai?.title || weddingData.title,
    description: weddingData.nhaTrai?.description || weddingData.description,
    images: [
      {
        url: weddingData.ogImageUrl || "/album/anh-chinh.JPG",
        width: 1200,
        height: 630,
        alt: weddingData.nhaTrai?.title || weddingData.title,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="overflow-x-hidden">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${monsieurLaDoulaise.variable} ${imperialScript.variable} antialiased overflow-x-hidden`}
      >
        {children}
        <MusicPlayer />
        <script src="/scroll-animations.js" defer></script>
      </body>
    </html>
  );
}
