import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AdminToaster } from "@/components/admin-toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "คลังภาคนิพนธ์ วิทยาการคอมพิวเตอร์ ม.พะเยา",
  description: "ค้นพบภาคนิพนธ์และโครงงานของนิสิตวิทยาการคอมพิวเตอร์ มหาวิทยาลัยพะเยา",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}<AdminToaster /></body>
    </html>
  );
}
