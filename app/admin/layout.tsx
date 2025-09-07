// app/admin/layout.tsx
import Link from "next/link";


export const metadata = {
  title: "Админка — Watch.Store",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header className="border-b bg-white">
        <div className="container py-4 flex items-center gap-6">
          <Link href="/admin" className="text-xl font-semibold">Админка</Link>
          <nav className="flex gap-4 text-sm">
            <Link className="hover:underline" href="/admin/products">Товары</Link>
            <Link className="hover:underline" href="/admin/orders">Заказы</Link>
            <Link className="hover:underline" href="/admin/posts">Блог</Link>
            <Link className="hover:underline" href="/admin/promos">Промокоды</Link>
            <form action="/admin/logout" method="post">
              <button className="ml-4 text-sm text-red-600 hover:underline">Выйти</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
