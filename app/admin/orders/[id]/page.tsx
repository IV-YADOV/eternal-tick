import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import DeleteOrderForm from "@/components/DeleteOrderForm";

function money(cents: number, currency: string) {
  return (cents / 100).toLocaleString("ru-RU", { style: "currency", currency });
}

async function setStatus(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orders");
  redirect(`/admin/orders/${id}`);
}

async function deleteOrder(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));

  await prisma.orderItem.deleteMany({ where: { orderId: id } });
  await prisma.order.delete({ where: { id } });

  revalidatePath("/admin/orders");
  redirect("/admin/orders?deleted=1");
}

export default async function AdminOrderPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      promoCode: { select: { code: true } },
      items: {
        include: {
          variant: { include: { product: { select: { name: true, slug: true } } } },
        },
      },
    },
  });
  if (!order) notFound();

  const subtotal = order.items.reduce((s, i) => s + i.priceCents * i.qty, 0);
  const hasDiscount = (order.discountCents ?? 0) > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Заказ №{order.number}</h1>
        <Link href="/admin/orders" className="hover:underline">← К списку заказов</Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Покупатель */}
        <div className="card p-4 space-y-2">
          <div className="font-medium">Покупатель</div>
          <div><span className="text-gray-500">Имя:</span> {order.customerName}</div>
          <div>
            <span className="text-gray-500">Контакт:</span> {order.contactMethod}:{" "}
            <span className="font-mono">{order.contactValue}</span>
          </div>
          {order.email && <div><span className="text-gray-500">Email:</span> {order.email}</div>}
          <div>
            <span className="text-gray-500">Адрес:</span>{" "}
            {typeof order.address === "object" && "text" in (order.address as any)
              ? (order.address as any).text
              : JSON.stringify(order.address)}
          </div>
          {order.comment && <div><span className="text-gray-500">Комментарий:</span> {order.comment}</div>}
        </div>

        {/* Оплата и статус + удаление */}
        <div className="card p-4 space-y-3">
          <div className="font-medium">Оплата и статус</div>

          {/* Разбивка суммы с учётом скидки */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Товары</span>
              <span>{money(subtotal, order.currency)}</span>
            </div>

            {hasDiscount && (
              <div className="flex justify-between">
                <span className="text-gray-600">Скидка</span>
                <span className="text-emerald-700">−{money(order.discountCents, order.currency)}</span>
              </div>
            )}

            <div className="flex justify-between font-medium pt-1 border-t">
              <span>Итого к оплате</span>
              <span>{money(order.totalCents, order.currency)}</span>
            </div>

            {order.promoCode?.code && (
              <div className="text-sm text-gray-600">
                Промокод: <span className="rounded bg-gray-100 px-2 py-0.5">{order.promoCode.code}</span>
              </div>
            )}
          </div>

          <div><span className="text-gray-500">Текущий статус:</span> {order.status}</div>

          <form action={setStatus} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={order.id} />
            <select name="status" defaultValue={order.status} className="border rounded-md px-2 py-1">
              <option value="Собирается">Собирается</option>
              <option value="В пути">В пути</option>
              <option value="Ожидает получения">Ожидает получения</option>
              <option value="Выдан">Выдан</option>
              <option value="Отменен">Отменен</option>
              <option value="Возврат">Возврат</option>
            </select>
            <button className="btn">Сохранить</button>
          </form>

          <DeleteOrderForm action={deleteOrder} orderId={order.id} />
        </div>

        {/* Итого (дублируем кратко) */}
        <div className="card p-4 space-y-2">
          <div className="font-medium">Итого</div>
          <div className="flex justify-between"><span>Товары</span><span>{money(subtotal, order.currency)}</span></div>
          {hasDiscount && (
            <div className="flex justify-between">
              <span>Скидка</span><span className="text-emerald-700">−{money(order.discountCents, order.currency)}</span>
            </div>
          )}
          <div className="flex justify-between font-medium border-t pt-1">
            <span>К оплате</span><span>{money(order.totalCents, order.currency)}</span>
          </div>
        </div>
      </div>

      {/* Состав заказа */}
      <div className="card p-4">
        <div className="font-medium mb-3">Состав заказа</div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Товар</th>
                <th className="py-2 pr-4">SKU</th>
                <th className="py-2 pr-4">Кол-во</th>
                <th className="py-2 pr-4">Цена</th>
                <th className="py-2 pr-4">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => (
                <tr key={it.id} className="border-b">
                  <td className="py-2 pr-4">
                    <Link className="hover:underline" href={`/watch/${it.variant.product.slug}`}>
                      {it.variant.product.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-4">{it.variant.sku}</td>
                  <td className="py-2 pr-4">{it.qty}</td>
                  <td className="py-2 pr-4">{money(it.priceCents, order.currency)}</td>
                  <td className="py-2 pr-4">{money(it.priceCents * it.qty, order.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
