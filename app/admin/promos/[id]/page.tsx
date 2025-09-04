// app/admin/promos/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function toInt(v: FormDataEntryValue | null): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

async function updatePromo(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const code = (formData.get("code") || "").toString().trim().toUpperCase();
  const type = (formData.get("type") || "PERCENT").toString() as "PERCENT" | "FIXED";
  const amount = toInt(formData.get("amount")) ?? 0;
  const isActive = (formData.get("isActive") || "") === "on";

  const startsAt = formData.get("startsAt") ? new Date(String(formData.get("startsAt"))) : null;
  const expiresAt = formData.get("expiresAt") ? new Date(String(formData.get("expiresAt"))) : null;

  const minOrderCents = toInt(formData.get("minOrderCents"));
  const maxUses = toInt(formData.get("maxUses"));
  const perUserLimit = toInt(formData.get("perUserLimit"));

  const ownerTgId = (formData.get("ownerTgId") || "").toString().trim();
  let ownerUserId: string | null = null;
  if (ownerTgId) {
    const u = await prisma.user.findUnique({ where: { tgId: ownerTgId } });
    ownerUserId = u?.id ?? null;
  }

  await prisma.promoCode.update({
    where: { id },
    data: {
      code,
      type,
      amount,
      isActive,
      startsAt: startsAt ?? undefined,
      expiresAt: expiresAt ?? undefined,
      minOrderCents: minOrderCents ?? undefined,
      maxUses: maxUses ?? undefined,
      perUserLimit: perUserLimit ?? undefined,
      ownerUserId: ownerUserId ?? null,
    },
  });

  revalidatePath("/admin/promos");
  redirect(`/admin/promos/${id}?saved=1`);
}

async function deletePromo(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));

  await prisma.$transaction(async (tx) => {
    // 1) Отвяжем промо от заказов, если где-то использовался
    await tx.order.updateMany({
      where: { promoCodeId: id },
      data: { promoCodeId: null },
    });

    // 2) Удалим записи об использовании пользователями
    await tx.userPromo.deleteMany({
      where: { promoId: id },
    });

    // 3) Удалим сам промокод
    await tx.promoCode.delete({
      where: { id },
    });
  });

  revalidatePath("/admin/promos");
  redirect("/admin/promos?deleted=1");
}

export default async function EditPromoPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { saved?: string };
}) {
  const promo = await prisma.promoCode.findUnique({ where: { id: params.id } });
  if (!promo) notFound();

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Промокод {promo.code}</h1>
        {/* Кнопка удаления */}
        <form action={deletePromo}>
          <input type="hidden" name="id" value={promo.id} />
          <button
            className="btn"
            style={{ background: "#ef4444", color: "white" }}
            title="Удалить промокод"
          >
            Удалить
          </button>
        </form>
      </div>

      {searchParams?.saved === "1" && (
        <div className="rounded-md border border-green-300 bg-green-50 text-green-800 px-3 py-2 text-sm">
          Сохранено
        </div>
      )}

      <form action={updatePromo} className="space-y-4">
        <input type="hidden" name="id" value={promo.id} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Код</label>
            <input name="code" defaultValue={promo.code} className="w-full" />
          </div>

          <div className="flex items-end gap-2">
            <label className="text-sm text-gray-600">Активен</label>
            <input type="checkbox" name="isActive" defaultChecked={promo.isActive} className="ml-2" />
          </div>

          <div>
            <label className="text-sm text-gray-600">Тип</label>
            <select name="type" className="w-full" defaultValue={promo.type}>
              <option value="PERCENT">% (amount — проценты)</option>
              <option value="FIXED">Фикс (amount — в центах)</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Amount</label>
            <input type="number" min={0} name="amount" className="w-full" defaultValue={promo.amount} />
          </div>

          <div>
            <label className="text-sm text-gray-600">Начало</label>
            <input
              type="datetime-local"
              name="startsAt"
              className="w-full"
              defaultValue={promo.startsAt ? new Date(promo.startsAt).toISOString().slice(0, 16) : ""}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Окончание</label>
            <input
              type="datetime-local"
              name="expiresAt"
              className="w-full"
              defaultValue={promo.expiresAt ? new Date(promo.expiresAt).toISOString().slice(0, 16) : ""}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Мин. сумма, центы</label>
            <input
              type="number"
              min={0}
              name="minOrderCents"
              className="w-full"
              defaultValue={promo.minOrderCents ?? ""}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Макс. использований</label>
            <input
              type="number"
              min={0}
              name="maxUses"
              className="w-full"
              defaultValue={promo.maxUses ?? ""}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Лимит на пользователя</label>
            <input
              type="number"
              min={0}
              name="perUserLimit"
              className="w-full"
              defaultValue={promo.perUserLimit ?? ""}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Персонально (tgId)</label>
            <input name="ownerTgId" className="w-full" placeholder="tgId" />
          </div>
        </div>

        <button className="btn btn-primary">Сохранить</button>
      </form>
    </div>
  );
}
