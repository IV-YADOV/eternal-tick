import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { createSessionForUser } from "@/lib/session";
import { claimGuestOrdersForUser } from "@/lib/orders";
import { mergeGuestCartToUser } from "@/lib/cart";

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(process.env.AUTH_JWT_SECRET!);
  const { payload } = await jwtVerify(token, secret);
  return payload as { sub?: string; tgId?: string; exp?: number };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) return NextResponse.redirect(new URL("/?login=fail", url));

  try {
    const payload = await verifyToken(token);
    if (!payload.sub) return NextResponse.redirect(new URL("/?login=fail", url));

    const user = await prisma.user.findUnique({ where: { id: String(payload.sub) } });
    if (!user) return NextResponse.redirect(new URL("/?login=fail", url));

    await createSessionForUser(user.id);
    await mergeGuestCartToUser(user.id); // ← вот здесь
    await claimGuestOrdersForUser(user.id); // ← вот здесь

    // редиректим в личный кабинет
    const base = process.env.PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${base}/account`);
  } catch {
    const base = process.env.PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${base}/auth/tg/help?e=invalid`);
  }
}
