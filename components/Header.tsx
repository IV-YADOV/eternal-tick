"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const BOT_LINK = "https://t.me/eternaltick_bot?start=login"; // поменяй на своего бота, если нужно

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/", label: "Главная" },
    { href: "/catalog", label: "Каталог" },
    { href: "/about", label: "О нас" },
  ];

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex items-center justify-between gap-4 py-3 px-4 md:px-0">
        {/* Лого */}
        <Link href="/" className="text-lg md:text-xl font-semibold">
          Watch.Store
        </Link>

        {/* Навигация (desktop) */}
        <nav className="hidden md:flex gap-2 text-sm">
          {nav.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              aria-current={isActive(i.href) ? "page" : undefined}
              className={
                "px-2 py-1 rounded-md " +
                (isActive(i.href) ? "bg-gray-900 text-white" : "hover:bg-gray-100")
              }
            >
              {i.label}
            </Link>
          ))}
        </nav>

        {/* Действия */}
        <div className="flex items-center gap-2">
          <AccountLink />
          <CartLink />

          {/* Бургер (mobile) */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100"
            aria-label="Открыть меню"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Открыть меню</span>
            <div className="relative w-6 h-4">
              <span
                className={
                  "absolute left-0 top-0 h-0.5 w-6 bg-gray-900 transition-transform duration-300 " +
                  (open ? "translate-y-2 rotate-45" : "")
                }
              />
              <span
                className={
                  "absolute left-0 top-1/2 -mt-[1px] h-0.5 w-6 bg-gray-900 transition-opacity duration-200 " +
                  (open ? "opacity-0" : "opacity-100")
                }
              />
              <span
                className={
                  "absolute left-0 bottom-0 h-0.5 w-6 bg-gray-900 transition-transform duration-300 " +
                  (open ? "-translate-y-2 -rotate-45" : "")
                }
              />
            </div>
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      <MobileMenu open={open} nav={nav} />
    </header>
  );
}

/** Мобильное меню с учётом логина */
function MobileMenu({ open, nav }: { open: boolean; nav: { href: string; label: string }[] }) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return setLoggedIn(false);
        const data = await res.json();
        setLoggedIn(!!data.user);
      } catch {
        setLoggedIn(false);
      }
    })();
  }, []);

  return (
    <div
      className={
        "md:hidden border-t overflow-hidden transition-all duration-300 ease-out motion-reduce:transition-none " +
        (open ? "max-h-[60vh] opacity-100" : "max-h-0 opacity-0")
      }
    >
      <nav
        className={
          "container flex flex-col px-4 py-2 transition-transform duration-300 ease-out " +
          (open ? "translate-y-0" : "-translate-y-2")
        }
      >
        {nav.map((i, idx) => (
          <Link
            key={i.href}
            href={i.href}
            className="px-3 py-2 rounded-md transition-colors hover:bg-gray-100"
            style={{ transitionDelay: open ? `${idx * 30}ms` : "0ms" }}
          >
            {i.label}
          </Link>
        ))}

        <Link
          href="/cart"
          className="px-3 py-2 rounded-md hover:bg-gray-100"
          style={{ transitionDelay: open ? `${nav.length * 30}ms` : "0ms" }}
        >
          🛒 Корзина
        </Link>

        {/* Профиль / Войти через бота */}
        {loggedIn ? (
          <Link
            href="/account"
            className="px-3 py-2 rounded-md hover:bg-gray-100"
            style={{ transitionDelay: open ? `${(nav.length + 1) * 30}ms` : "0ms" }}
          >
            👤 Личный кабинет
          </Link>
        ) : (
          <a
            href={BOT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-md hover:bg-gray-100"
            style={{ transitionDelay: open ? `${(nav.length + 1) * 30}ms` : "0ms" }}
          >
            👤 Войти через Telegram
          </a>
        )}
      </nav>
    </div>
  );
}

/** Ссылка на корзину с количеством товаров */
function CartLink() {
  const count = useCartCount();

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100"
      aria-label={count > 0 ? `Корзина, товаров: ${count}` : "Корзина пуста"}
    >
      <span aria-hidden>🛒</span>
      <span className="hidden sm:inline">Корзина</span>
      {count > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-black text-white text-xs
                     flex items-center justify-center"
          aria-live="polite"
        >
          {count}
        </span>
      )}
    </Link>
  );
}

/** Ссылка на личный кабинет / вход через бота (desktop) */
function AccountLink() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return setLoggedIn(false);
        const data = await res.json();
        setLoggedIn(!!data.user);
      } catch {
        setLoggedIn(false);
      }
    })();
  }, []);

  if (loggedIn) {
    return (
      <Link
        href="/account"
        className="inline-flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100"
      >
        {/* <span aria-hidden>👤</span> */}
        <span className="hidden sm:inline">ЛК</span>
      </Link>
    );
  }

  // Гость → ведём прямо в бота
  return (
    <a
      href="https://t.me/eternaltick_bot"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100"
    >
      {/* <span aria-hidden>👤</span> */}
      <span className="hidden sm:inline">Войти</span>
    </a>
  );
}

/** Хук для получения количества товаров (poll + события) */
function useCartCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchCount() {
      try {
        const res = await fetch("/api/cart/count", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setCount(Number(data.count) || 0);
      } catch {
        /* noop */
      }
    }

    fetchCount();
    const t = setInterval(fetchCount, 10000);

    const onCartChanged = () => fetchCount();
    window.addEventListener("cart:changed", onCartChanged);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "cartUpdated") fetchCount();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      cancelled = true;
      clearInterval(t);
      window.removeEventListener("cart:changed", onCartChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return count;
}
