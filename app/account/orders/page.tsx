import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/tg/help");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, number: true, status: true, totalCents: true, currency: true, createdAt: true }
  });

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Мои заказы</h1>
      {orders.length === 0 && <div className="text-gray-500">Заказов пока нет.</div>}
      <div className="space-y-2">
        {orders.map((o) => (
          <Link key={o.id} href={`/account/orders/${o.id}`} className="block rounded-lg border p-3 hover:bg-gray-50">
            №{o.number} — {o.status} — {(o.totalCents / 100).toFixed(2)} {o.currency} —{" "}
            {o.createdAt.toLocaleDateString()}
          </Link>
        ))}
      </div>
    </div>
  );
}
