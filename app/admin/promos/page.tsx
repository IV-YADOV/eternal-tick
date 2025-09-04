// app/admin/promos/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPromosList() {
  const promos = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      ownerUser: { select: { id: true, tgId: true, name: true } },
      _count: { select: { orders: true, userUsages: true } },
    },
    take: 200,
  });

  return (
    <div className="max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Промокоды</h1>
        <Link href="/admin/promos/new" className="btn btn-primary">Создать</Link>
      </div>

      <div className="card divide-y">
        <div className="grid grid-cols-12 gap-3 px-4 py-2 text-sm text-gray-500">
          <div className="col-span-3">Код</div>
          <div className="col-span-2">Тип</div>
          <div className="col-span-2">Статус</div>
          <div className="col-span-2">Ограничения</div>
          <div className="col-span-3">Владелец</div>
        </div>
        {promos.map(p => (
          <Link
            key={p.id}
            href={`/admin/promos/${p.id}`}
            className="grid grid-cols-12 gap-3 px-4 py-3 hover:bg-gray-50"
          >
            <div className="col-span-3 font-mono">{p.code}</div>
            <div className="col-span-2">
              {p.type === "PERCENT" ? `- ${p.amount}%` : `- ${(p.amount/100).toFixed(2)} ₽`}
            </div>
            <div className="col-span-2 text-sm">
              {p.isActive ? "Активен" : "Выключен"} · использовано {p.usedCount}
              {p.maxUses != null && ` / ${p.maxUses}`}
            </div>
            <div className="col-span-2 text-xs text-gray-600">
              {p.startsAt && <>с {new Date(p.startsAt).toLocaleDateString()}<br/></>}
              {p.expiresAt && <>до {new Date(p.expiresAt).toLocaleDateString()}<br/></>}
              {p.minOrderCents != null && <>мин. {(p.minOrderCents/100).toFixed(2)} ₽</>}
            </div>
            <div className="col-span-3 text-xs text-gray-600">
              {p.ownerUser ? `user: ${p.ownerUser.name ?? ""} tg:${p.ownerUser.tgId}` : "—"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
