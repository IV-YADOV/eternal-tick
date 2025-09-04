import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCartId } from "@/lib/cart";

export async function GET() {
  const cartId = await getOrCreateCartId();
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { variant: { include: { product: true } } } } }
  });
  return NextResponse.json(cart);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { action, variantId, qty } = body as { action: string; variantId?: string; qty?: number };

  const cartId = await getOrCreateCartId();

  if (action === "add" && variantId) {
    const existing = await prisma.cartItem.findFirst({ where: { cartId, variantId } });
    if (existing) {
      await prisma.cartItem.update({ where: { id: existing.id }, data: { qty: existing.qty + (qty || 1) } });
    } else {
      await prisma.cartItem.create({ data: { cartId, variantId, qty: qty || 1 } });
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "remove" && variantId) {
    await prisma.cartItem.deleteMany({ where: { cartId, variantId } });
    return NextResponse.json({ ok: true });
  }

  if (action === "clear") {
    await prisma.cartItem.deleteMany({ where: { cartId } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Bad request" }, { status: 400 });
}
