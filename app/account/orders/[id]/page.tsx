import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

function money(cents: number, cur: string) {
  return `${(cents / 100).toFixed(2)} ${cur}`;
}

export default async function OrderDetails({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/tg/help");

  // грузим заказ и проверяем владельца
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: {
          variant: {
            include: { product: true }
          }
        }
      }
    }
  });

  if (!order || order.userId !== user.id) notFound();

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Заказ №{order.number}</h1>
        <Link href="/account/orders" className="text-sm text-blue-600 hover:underline">← К заказам</Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border p-3">
          <div className="text-sm text-gray-500">Статус</div>
          <div className="font-medium">{order.status}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-sm text-gray-500">Дата</div>
          <div className="font-medium">{order.createdAt.toLocaleString()}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-sm text-gray-500">Контакт</div>
          <div className="font-medium">{order.contactMethod}: {order.contactValue}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-sm text-gray-500">Сумма</div>
          <div className="font-medium">{money(order.totalCents, order.currency)}</div>
        </div>
        <div className="sm:col-span-2 rounded-lg border p-3">
          <div className="text-sm text-gray-500">Адрес</div>
          <div className="font-medium">{(order.address as any)?.text ?? "—"}</div>
        </div>
        {order.comment && (
          <div className="sm:col-span-2 rounded-lg border p-3">
            <div className="text-sm text-gray-500">Комментарий</div>
            <div className="font-medium whitespace-pre-wrap">{order.comment}</div>
          </div>
        )}
      </div>

      <section>
        <h2 className="font-medium mb-2">Состав заказа</h2>
        <div className="divide-y rounded-lg border">
          {order.items.map((it) => (
            <div key={it.id} className="p-3 text-sm flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-medium truncate">{it.variant.product.name}</div>
                <div className="text-gray-600">SKU: {it.variantId}</div>
              </div>
              <div className="shrink-0 text-right">
                <div>{money(it.priceCents, order.currency)}</div>
                <div className="text-gray-600">× {it.qty}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
