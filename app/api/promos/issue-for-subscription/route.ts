// app/api/promos/issue-for-subscription/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePromoCode } from "@/lib/promo";

export async function POST(req: Request) {
  const secret = process.env.PROMO_ISSUE_SECRET;
  if (!secret) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  const hdr = req.headers.get("x-webhook-secret");
  if (hdr !== secret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null) as { tgId?: string; userName?: string | null } | null;
  const tgId = body?.tgId?.trim();
  if (!tgId) return NextResponse.json({ error: "tgId required" }, { status: 400 });

  // Находим/создаём пользователя по tgId (если у тебя всегда уже есть User — просто findUnique)
  const user = await prisma.user.findUnique({ where: { tgId } });
  if (!user) {
    return NextResponse.json({ error: "User with this tgId not found" }, { status: 404 });
  }

  // Проверяем, не выдавали ли уже персональный код за подписку
  const existing = await prisma.promoCode.findFirst({
    where: { ownerUserId: user.id, isActive: true, type: "PERCENT", amount: 10 },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    return NextResponse.json({
      code: existing.code,
      message: "Промокод уже был выдан ранее",
    });
  }

  // Генерим новый персональный промокод на 10%:
  const code = generatePromoCode("TG10");
  const promo = await prisma.promoCode.create({
    data: {
      code,
      type: "PERCENT",
      amount: 10,            // 10%
      isActive: true,
      startsAt: new Date(),
      // expiresAt: addMonths(new Date(), 1) — если нужно ограничение по времени
      minOrderCents: null,
      maxUses: 1,            // максимум 1 активация по коду
      usedCount: 0,
      perUserLimit: 1,       // и одному пользователю — 1 использование
      ownerUserId: user.id,  // персональный
    },
  });

  return NextResponse.json({
    code: promo.code,
    message: "Промокод выдан",
  });
}
