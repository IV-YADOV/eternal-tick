// app/account/page.tsx
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const statusLabels: Record<string, string> = {
  pending: "Собирается",
  paid: "В пути",
  fulfilled: "Выдан",
  cancelled: "Отменен",
  refunded: "Возврат",
};

function fmtMoney(cents: number, currency = "RUB") {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function maskPhone(p?: string | null) {
  if (!p) return "—";
  const digits = p.replace(/\D/g, "");
  if (digits.length < 6) return p;
  return p.replace(digits.slice(3, digits.length - 2), "****");
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/tg/help");

  // последние 5 заказов
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      number: true,
      status: true,
      totalCents: true,
      currency: true,
      createdAt: true,
      address: true,
    },
  });

  // открытые заказы (актуальные для пользователя)
  const openOrders = await prisma.order.findMany({
    where: {
      userId: user.id,
      status: { in: ["pending", "paid"] },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, number: true, status: true, totalCents: true, currency: true, createdAt: true },
  });

  // агрегаты
  const aggregates = await prisma.order.aggregate({
    where: { userId: user.id },
    _count: { _all: true },
    _sum: { totalCents: true },
  });

  // пару последних адресов (если есть)
  const lastAddresses = orders
    .map(o => (typeof o.address === "object" && o.address && "text" in (o.address as any) ? (o.address as any).text as string : ""))
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold">Личный кабинет</h1>
        <Link href="api/auth/logout" className="text-sm text-gray-500 hover:underline">
          Выйти
        </Link>
      </div>

      {/* Профиль */}
      <section className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-gray-500">Имя</div>
            <div className="font-medium">{user.name || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Телефон</div>
            <div className="font-medium">{maskPhone(user.phone)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Telegram ID</div>
            <div className="font-medium">{user.tgId}</div>
          </div>
        </div>
        {lastAddresses.length > 0 && (
          <div className="mt-3">
            <div className="text-xs text-gray-500 mb-1">Последние адреса</div>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              {lastAddresses.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Метрики */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="text-xs text-gray-500">Всего заказов</div>
          <div className="text-xl font-semibold">{aggregates._count._all}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">Открытые</div>
          <div className="text-xl font-semibold">{openOrders.length}</div>
        </div>
        <div className="card p-4 md:col-span-2">
          <div className="text-xs text-gray-500">Потрачено</div>
          <div className="text-xl font-semibold">
            {fmtMoney(aggregates._sum.totalCents || 0, orders[0]?.currency || "RUB")}
          </div>
        </div>
      </section>

      {/* Открытые заказы */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Открытые заказы</h2>
          {openOrders.length > 0 && (
            <Link href="/account/orders" className="text-sm text-blue-600 hover:underline">
              История →
            </Link>
          )}
        </div>

        {openOrders.length === 0 ? (
          <div className="rounded-md border p-4 text-sm text-gray-600">
            Открытых заказов нет. Загляните в <Link className="underline" href="/catalog">каталог</Link>.
          </div>
        ) : (
          <div className="space-y-2">
            {openOrders.map(o => (
              <Link
                key={o.id}
                href={`/account/orders/${o.id}`}
                className="block rounded-lg border p-3 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">№{o.number}</div>
                  <div className="text-sm text-gray-500">{o.createdAt.toLocaleDateString()}</div>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <div className="badge">{statusLabels[o.status] ?? o.status}</div>
                  <div className="font-medium">{fmtMoney(o.totalCents, o.currency)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Последние заказы */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Последние заказы</h2>
          {orders.length > 0 && (
            <Link href="/account/orders" className="text-sm text-blue-600 hover:underline">
              Все заказы →
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="rounded-md border p-4 text-sm text-gray-600">
            Пока нет заказов. Начните с <Link className="underline" href="/catalog">каталога</Link>.
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/account/orders/${o.id}`}
                className="block rounded-lg border p-3 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">№{o.number}</div>
                  <div className="text-sm text-gray-500">{o.createdAt.toLocaleDateString()}</div>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <div className="badge">{statusLabels[o.status] ?? o.status}</div>
                  <div className="font-medium">{fmtMoney(o.totalCents, o.currency)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
