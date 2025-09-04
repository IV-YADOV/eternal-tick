// app/api/cart/count/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  // пока упрощённо берём первую корзину (или ищем по сессии/куке)
  const cart = await prisma.cart.findFirst({
    include: { items: true },
  });

  const count = cart ? cart.items.reduce((sum, it) => sum + it.qty, 0) : 0;

  return NextResponse.json({ count });
}
