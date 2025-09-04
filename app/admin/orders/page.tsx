import { prisma } from "@/lib/prisma";
import Link from "next/link";

function money(cents: number, currency: string) {
  return (cents / 100).toLocaleString("ru-RU", { style: "currency", currency });
}

async function setStatus(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await prisma.order.update({ where: { id }, data: { status } });
}

export default async function AdminOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      // чтобы показать промокод рядом
      promoCode: { select: { code: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Заказы</h1>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">№</th>
              <th className="py-2 pr-4">Имя</th>
              <th className="py-2 pr-4">Контакт</th>
              <th className="py-2 pr-4">Сумма</th>
              <th className="py-2 pr-4">Промокод</th>
              <th className="py-2 pr-4">Статус</th>
              <th className="py-2 pr-4">Действия</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b">
                <td className="py-2 pr-4">{o.number}</td>
                <td className="py-2 pr-4">{o.customerName}</td>
                <td className="py-2 pr-4">
                  {o.contactMethod}: <span className="font-mono">{o.contactValue}</span>
                </td>
                <td className="py-2 pr-4">
                  {/* Итого к оплате — уже со скидкой */}
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{money(o.totalCents, o.currency)}</span>
                    {o.discountCents > 0 && (
                      <span className="badge bg-emerald-100 text-emerald-700">
                        −{money(o.discountCents, o.currency)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2 pr-4">
                  {o.promoCode?.code ? (
                    <span className="rounded bg-gray-100 px-2 py-0.5">{o.promoCode.code}</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="py-2 pr-4">{o.status}</td>
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                      Подробнее
                    </Link>
                    <form action={setStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={o.id} />
                      <select name="status" defaultValue={o.status} className="border rounded-md px-2 py-1">
                        <option value="Собирается">Собирается</option>
                        <option value="В пути">В пути</option>
                        <option value="Ожидает получения">Ожидает получения</option>
                        <option value="Выдан">Выдан</option>
                        <option value="Отменен">Отменен</option>
                        <option value="Возврат">Возврат</option>
                      </select>
                      <button className="btn">Сохранить</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
