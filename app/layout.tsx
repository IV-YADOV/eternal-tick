// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";

export const metadata: Metadata = {
  title: "EternalTick — Магазин часов",
  description: "Интернет-магазин часов. Быстро, удобно, надёжно.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Header />
        <main className="container py-8">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
