import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Watch.Store — Магазин часов",
  description: "Интернет‑магазин часов. Быстро, удобно, надёжно."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Header />
        <main className="container py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
