// app/cart/page.tsx
import { getCart } from "@/lib/cart";
import Link from "next/link";
import Price from "@/components/Price";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PromoType } from "@prisma/client";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function discountByPromo(totalCents: number, promo?: { type: PromoType; amount: number } | null) {
  if (!promo) return 0;
  if (promo.type === "PERCENT") {
    const pct = clamp(promo.amount, 0, 100);
    return clamp(Math.floor((totalCents * pct) / 100), 0, totalCents);
  }
  return clamp(promo.amount, 0, totalCents); // FIXED
}

// ——— server actions ———
async function removeItem(formData: FormData) {
  "use server";
  const itemId = String(formData.get("itemId") || "");
  const cartId = cookies().get("cartId")?.value;
  if (!itemId || !cartId) redirect("/cart");

  await prisma.cartItem.deleteMany({ where: { id: itemId, cartId } });
  revalidatePath("/cart");
  redirect("/cart");
}

async function applyPromo(formData: FormData) {
  "use server";
  const code = String(formData.get("promoCode") || "").trim();
  if (!code) {
    cookies().delete("promoCode");
  } else {
    cookies().set({
      name: "promoCode",
      value: code,
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 дней
    });
  }
  revalidatePath("/cart");
  redirect("/cart");
}

async function clearPromo() {
  "use server";
  cookies().delete("promoCode");
  revalidatePath("/cart");
  redirect("/cart");
}

export default async function CartPage() {
  const cart = await getCart();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">Корзина</h1>
        <p className="text-gray-600">Ваша корзина пуста.</p>
        <Link href="/catalog" className="btn btn-primary">Перейти в каталог</Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, it) => sum + it.qty * it.variant.priceCents, 0);

  // читаем промокод из cookie
  const promoCode = cookies().get("promoCode")?.value ?? null;
  let promo: { type: PromoType; amount: number } | null = null;
  if (promoCode) {
    const found = await prisma.promoCode.findUnique({ where: { code: promoCode } });
    const now = new Date();
    if (
      found &&
      found.isActive &&
      (!found.startsAt || now >= found.startsAt) &&
      (!found.expiresAt || now <= found.expiresAt) &&
      (found.maxUses == null || found.usedCount < found.maxUses) &&
      (found.minOrderCents == null || subtotal >= found.minOrderCents)
    ) {
      promo = { type: found.type, amount: found.amount };
    }
  }

  const discount = discountByPromo(subtotal, promo);
  const total = Math.max(subtotal - discount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Корзина</h1>
      <div className="grid md:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          {cart.items.map((it) => (
            <div key={it.id} className="card p-4 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${(it.variant.product.images as string[])[0]}?auto=format&fit=crop&w=400&q=60`}
                alt={it.variant.product.name}
                className="w-20 h-20 object-cover rounded-md"
              />
              <div className="flex-1">
                <div className="font-medium">{it.variant.product.name}</div>
                <div className="text-sm text-gray-500">Количество: {it.qty}</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="whitespace-nowrap">
                  <Price cents={it.variant.priceCents * it.qty} />
                </div>
                <form action={removeItem}>
                  <input type="hidden" name="itemId" value={it.id} />
                  <button className="btn" aria-label="Удалить из корзины" title="Удалить">
                    Удалить
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>

        {/* Итоги + промокод + оформление */}
        <aside className="card p-4 space-y-3 h-max">
          <div className="flex justify-between">
            <span>Товары</span>
            <Price cents={subtotal} />
          </div>

          {/* Промокод: применить/сбросить */}
          <div className="space-y-2">
            <form action={applyPromo} className="flex gap-2">
              <input
                id="promoCode"
                name="promoCode"
                className="w-full rounded-md border px-2 py-1"
                placeholder="Введите промокод"
                defaultValue={promoCode ?? ""}
                autoComplete="off"
              />
              <button type="submit" className="btn">Применить</button>
            </form>

            {promoCode && (
              <form action={clearPromo}>
                <button type="submit" className="text-xs text-gray-600 hover:underline">
                  Сбросить промокод
                </button>
              </form>
            )}

            {discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Скидка</span>
                <Price cents={-discount} />
              </div>
            )}
          </div>

          <div className="flex justify-between font-medium border-t pt-2">
            <span>Итого</span>
            <Price cents={total} />
          </div>

          {/* На /checkout промокод теперь не обязателен — возьмём из cookie */}
          <Link href="/checkout" className="btn btn-primary w-full text-center">
            Оформить заказ
          </Link>
        </aside>
      </div>
    </div>
  );
}
