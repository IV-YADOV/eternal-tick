// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { PromoType } from "@prisma/client";

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function calcDiscountCents(totalCents: number, promo: { type: PromoType; amount: number }) {
  if (promo.type === "PERCENT") {
    const pct = clamp(promo.amount, 0, 100);
    return clamp(Math.floor((totalCents * pct) / 100), 0, totalCents);
  }
  return clamp(promo.amount, 0, totalCents); // FIXED
}

async function validatePromo({
  codeInput,
  totalCents,
  userId,
}: {
  codeInput?: string | null;
  totalCents: number;
  userId?: string | null;
}) {
  if (!codeInput) return { ok: true as const, promo: null, discountCents: 0 };

  const code = codeInput.trim();
  if (!code) return { ok: true as const, promo: null, discountCents: 0 };

  const promo = await prisma.promoCode.findUnique({ where: { code } });
  if (!promo || !promo.isActive) return { ok: false as const, reason: "Промокод не найден или не активен" };

  const now = new Date();
  if (promo.startsAt && now < promo.startsAt) return { ok: false as const, reason: "Промокод ещё не начал действовать" };
  if (promo.expiresAt && now > promo.expiresAt) return { ok: false as const, reason: "Срок действия промокода истёк" };

  if (promo.maxUses != null && promo.usedCount >= promo.maxUses)
    return { ok: false as const, reason: "Достигнут общий лимит активаций" };

  if (promo.minOrderCents != null && totalCents < promo.minOrderCents)
    return { ok: false as const, reason: "Сумма заказа меньше минимальной для этого промокода" };

  if (userId && promo.perUserLimit != null && promo.perUserLimit > 0) {
    const usedByUser = await prisma.userPromo.count({ where: { userId, promoId: promo.id } });
    if (usedByUser >= promo.perUserLimit)
      return { ok: false as const, reason: "Лимит использований на пользователя исчерпан" };
  }

  const discountCents = calcDiscountCents(totalCents, { type: promo.type, amount: promo.amount });
  if (discountCents <= 0) return { ok: false as const, reason: "Скидка по промокоду равна 0" };

  return { ok: true as const, promo, discountCents };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerName,
      contactMethod,
      contactValue,
      address,
      comment,
      promoCode, // может не прийти из клиента
    } = body as {
      customerName: string;
      contactMethod: "telegram" | "phone" | "email";
      contactValue: string;
      address: string;
      comment?: string;
      promoCode?: string | null;
    };

    if (!customerName || !contactMethod || !contactValue || !address) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const user = await getCurrentUser();

    // корзина
    const cartId = cookies().get("cartId")?.value;
    const cart = cartId
      ? await prisma.cart.findUnique({
          where: { id: cartId },
          include: { items: { include: { variant: true } } },
        })
      : null;
    const items = cart?.items ?? [];
    if (items.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

    const currency = "RUB";
    const subtotalCents = items.reduce((sum, it) => sum + it.variant.priceCents * it.qty, 0);

    // ❶ промокод берём из body ИЛИ из cookie promoCode
    const promoFromCookie = cookies().get("promoCode")?.value ?? null;
    const promoToUse = promoCode ?? promoFromCookie ?? null;

    const promoCheck = await validatePromo({
      codeInput: promoToUse,
      totalCents: subtotalCents,
      userId: user?.id,
    });
    if (!promoCheck.ok) {
      return NextResponse.json({ error: promoCheck.reason }, { status: 400 });
    }

    const discountCents = promoCheck.discountCents ?? 0;
    const promo = promoCheck.promo;
    const totalCents = Math.max(subtotalCents - discountCents, 0);

    // следующий номер
    const last = await prisma.order.aggregate({ _max: { number: true } });
    const nextNumber = (last._max.number ?? 1000) + 1;

    const result = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          number: nextNumber,
          ...(contactMethod === "email" ? { email: contactValue } : {}),
          customerName,
          contactMethod,
          contactValue,
          comment: comment || null,
          totalCents,
          currency,
          address: { text: address },
          status: "pending",
          discountCents,                     // ← Скидка в заказе
          promoCodeId: promo?.id ?? null,    // ← Ссылка на промокод
          ...(user ? { userId: user.id } : {}),
          items: {
            create: items.map((it) => ({
              variantId: it.variantId,
              qty: it.qty,
              priceCents: it.variant.priceCents,
            })),
          },
        },
        select: { id: true, number: true },
      });

      if (promo) {
        await tx.promoCode.update({
          where: { id: promo.id },
          data: { usedCount: { increment: 1 } },
        });
        if (user?.id) {
          await tx.userPromo.create({ data: { userId: user.id, promoId: promo.id } });
        }
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart?.id } });
      return createdOrder;
    });

    // ❷ очищаем cookie промокода после успешного заказа
    cookies().delete("promoCode");

    return NextResponse.json({
      orderId: result.id,
      number: result.number,
      subtotalCents,
      discountCents,
      totalCents,
      currency,
      appliedPromo: promo?.code ?? null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
