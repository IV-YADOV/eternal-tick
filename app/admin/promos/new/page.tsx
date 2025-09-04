// app/admin/promos/new/page.tsx
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { generatePromoCode } from "@/lib/promo";

function toInt(v: FormDataEntryValue | null): number | null {
  const n = Number(v); return Number.isFinite(n) ? Math.trunc(n) : null;
}

// amount: для PERCENT — проценты (целое), для FIXED — СЕНТЫ!
async function createPromo(formData: FormData) {
  "use server";
  const code = (formData.get("code") || "").toString().trim().toUpperCase() || generatePromoCode("SALE");
  const type = (formData.get("type") || "PERCENT").toString() as "PERCENT" | "FIXED";
  const amount = toInt(formData.get("amount")) ?? 0;
  const isActive = (formData.get("isActive") || "on") === "on";

  const startsAt = formData.get("startsAt") ? new Date(String(formData.get("startsAt"))) : null;
  const expiresAt = formData.get("expiresAt") ? new Date(String(formData.get("expiresAt"))) : null;

  const minOrderCents = toInt(formData.get("minOrderCents"));
  const maxUses = toInt(formData.get("maxUses"));
  const perUserLimit = toInt(formData.get("perUserLimit"));

  const ownerTgId = (formData.get("ownerTgId") || "").toString().trim();
  let ownerUserId: string | null = null;
  if (ownerTgId) {
    const u = await prisma.user.findUnique({ where: { tgId: ownerTgId }});
    ownerUserId = u?.id ?? null;
  }

  const created = await prisma.promoCode.create({
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
      ownerUserId: ownerUserId ?? undefined,
    },
    select: { id: true },
  });

  redirect(`/admin/promos/${created.id}`);
}

export default function NewPromoPage() {
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Новый промокод</h1>

      <form action={createPromo} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Код</label>
            <input name="code" placeholder="(пусто — сгенерируем)" className="w-full" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Активен</label>
            <input type="checkbox" name="isActive" defaultChecked className="ml-2 align-middle" />
          </div>

          <div>
            <label className="text-sm text-gray-600">Тип</label>
            <select name="type" className="w-full" defaultValue="PERCENT">
              <option value="PERCENT">% (amount — проценты)</option>
              <option value="FIXED">Фикс (amount — в центах)</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Amount</label>
            <input type="number" min={0} name="amount" className="w-full" placeholder="10 = 10% или 1000 = 10.00 ₽" />
          </div>

          <div>
            <label className="text-sm text-gray-600">Начало</label>
            <input type="datetime-local" name="startsAt" className="w-full" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Окончание</label>
            <input type="datetime-local" name="expiresAt" className="w-full" />
          </div>

          <div>
            <label className="text-sm text-gray-600">Мин. сумма (₽)</label>
            <input type="number" min={0} name="minOrderCents" className="w-full" placeholder="в рублях" />
            <div className="text-xs text-gray-500">Можно в рублях — конвертируем в центы на сервере, если хочешь.</div>
          </div>
          <div>
            <label className="text-sm text-gray-600">Макс. использований</label>
            <input type="number" min={0} name="maxUses" className="w-full" placeholder="пусто = без лимита" />
          </div>

          <div>
            <label className="text-sm text-gray-600">Лимит на пользователя</label>
            <input type="number" min={0} name="perUserLimit" className="w-full" placeholder="например, 1" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Персонально (tgId)</label>
            <input name="ownerTgId" className="w-full" placeholder="если персональный" />
          </div>
        </div>

        <button className="btn btn-primary">Создать</button>
      </form>
    </div>
  );
}
