// lib/promo.ts
import { prisma } from "@/lib/prisma";

type ValidateInput = {
  code: string;            // как ввёл пользователь
  userId?: string | null;  // может быть пустым (гость)
  subtotalCents: number;   // сумма товаров без доставки, в центах
};

export type ValidateResult =
  | { ok: false; reason: string }
  | { ok: true; discountCents: number; promoId: string; appliedCode: string };

function now() {
  return new Date();
}

// Приводим промо-код к каноническому виду: UPPERCASE & trim
export function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

// lib/promo.ts
export function generatePromoCode(prefix = "SALE") {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${prefix}-${s}`;
}


export async function validateAndCalcDiscount(input: ValidateInput): Promise<ValidateResult> {
  const code = normalizeCode(input.code);
  if (!code) return { ok: false, reason: "Введите промокод" };

  const promo = await prisma.promoCode.findUnique({ where: { code } });
  if (!promo) return { ok: false, reason: "Промокод не найден" };
  if (!promo.isActive) return { ok: false, reason: "Промокод отключён" };

  const nowDt = now();
  if (promo.startsAt && nowDt < promo.startsAt) return { ok: false, reason: "Промокод ещё не активен" };
  if (promo.expiresAt && nowDt > promo.expiresAt) return { ok: false, reason: "Срок действия промокода истёк" };

  if (promo.minOrderCents && input.subtotalCents < promo.minOrderCents) {
    return { ok: false, reason: "Недостаточная сумма заказа для применения промокода" };
  }

  // Общий лимит
  if (promo.maxUses && promo.usedCount >= promo.maxUses) {
    return { ok: false, reason: "Достигнут лимит использований промокода" };
  }

  // Персональные коды — должны совпадать по пользователю
  if (promo.ownerUserId && input.userId && promo.ownerUserId !== input.userId) {
    return { ok: false, reason: "Этот промокод не предназначен вашему аккаунту" };
  }
  if (promo.ownerUserId && !input.userId) {
    return { ok: false, reason: "Промокод персональный — войдите в аккаунт" };
  }

  // Лимит на пользователя
  if (promo.perUserLimit && input.userId) {
    const usedByUser = await prisma.userPromo.count({ where: { promoId: promo.id, userId: input.userId } });
    if (usedByUser >= promo.perUserLimit) {
      return { ok: false, reason: "Вы уже использовали этот промокод" };
    }
  }

  // Расчёт скидки
  let discountCents = 0;
  if (promo.type === "PERCENT") {
    discountCents = Math.floor((input.subtotalCents * promo.amount) / 100);
  } else {
    discountCents = promo.amount;
  }

  // Скидка не должна превышать сумму
  if (discountCents > input.subtotalCents) discountCents = input.subtotalCents;

  if (discountCents <= 0) return { ok: false, reason: "Скидка по промокоду равна нулю" };

  return {
    ok: true,
    discountCents,
    promoId: promo.id,
    appliedCode: promo.code,
  };
}

/** Фиксируем успешное использование промокода (вызываем при создании заказа) */
export async function commitPromoUsage(promoId: string, userId?: string | null) {
  await prisma.$transaction(async (tx) => {
    await tx.promoCode.update({
      where: { id: promoId },
      data: { usedCount: { increment: 1 } },
    });
    if (userId) {
      await tx.userPromo.create({
        data: { promoId, userId },
      });
    }
  });
}
