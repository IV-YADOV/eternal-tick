import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  const products = await prisma.product.findMany({
    include: {
      brand: true,
      variants: { orderBy: { id: "desc" } }, // если у варианта нет createdAt
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Товары</h1>
        <Link href="/admin/products/new" className="btn btn-primary">Добавить товар</Link>
      </div>

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Название</th>
              <th className="py-2 pr-4">Линейка</th>
              <th className="py-2 pr-4">Цена</th>
              <th className="py-2 pr-4">Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              // сначала берём вариант со sku, оканчивающимся на "-base", иначе первый по id desc
              const base = p.variants.find(v => v.sku?.endsWith("-base"));
              const v = base ?? p.variants[0];

              return (
                <tr key={p.id} className="border-b">
                  <td className="py-2 pr-4">{p.name}</td>
                  <td className="py-2 pr-4">{p.brand?.name}</td>
                  <td className="py-2 pr-4">
                    {v ? formatMoney(v.priceCents, v.currency) : "—"}
                  </td>
                  <td className="py-2 pr-4">
                    <Link href={`/admin/products/${p.id}`} className="hover:underline">
                      Редактировать
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
