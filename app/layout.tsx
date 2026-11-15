import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...(process.env.NEXT_PUBLIC_SITE_URL ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL) } : {}),
  title: {
    default: "FabriTrack | Fabric Business Management",
    template: "%s | FabriTrack",
  },
  applicationName: "FabriTrack",
  description: "Manage fabric and thread inventory, employees, production counts, earnings, payments, and billing in one workspace built for fabric businesses.",
  keywords: [
    "fabric business management",
    "textile inventory management",
    "thread tracking",
    "fabric production tracking",
    "employee earnings and payments",
    "textile billing software",
  ],
  creator: "Faraz Ahmad",
  publisher: "FabriTrack",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "FabriTrack",
    title: "FabriTrack | Fabric Business Management",
    description: "Track fabric and thread, manage employees and earnings, and keep billing organized with FabriTrack.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "FabriTrack fabric business management" }],
    ...(process.env.NEXT_PUBLIC_SITE_URL ? { url: process.env.NEXT_PUBLIC_SITE_URL } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: "FabriTrack | Fabric Business Management",
    description: "Track fabric and thread, manage employees and earnings, and keep billing organized with FabriTrack.",
    images: ["/opengraph-image"],
  },
};

import TabHeader from "./components/TabHeader";
import LayoutWrapper from "./components/LayoutWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-5 font-inter">
        <TabHeader />
        <LayoutWrapper>{children}</LayoutWrapper>
        <footer className="fixed bottom-1 right-0 z-40 flex items-center rounded-l-md bg-gray-900 p-1 pl-2">
          <span className="text-[9px] font-medium text-gray-400">Created By Faraz Ahmad</span>
        </footer>
      </body>
    </html>
  );
}
