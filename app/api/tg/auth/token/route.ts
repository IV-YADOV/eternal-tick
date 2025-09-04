import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

function assertBot(req: Request) {
  return req.headers.get("x-bot-secret") === process.env.BOT_SHARED_SECRET;
}

async function signToken(payload: any, ttlSeconds: number) {
  const secret = new TextEncoder().encode(process.env.AUTH_JWT_SECRET!);
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;

  return await new SignJWT({ ...payload, exp })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(secret);
}

export async function POST(req: Request) {
  if (!assertBot(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { tgId, phone, name } = await req.json();
  if (!tgId) return NextResponse.json({ error: "tgId required" }, { status: 400 });

  // апсерт пользователя
  const user = await prisma.user.upsert({
    where: { tgId: String(tgId) },
    create: { tgId: String(tgId), phone, name },
    update: { phone: phone ?? undefined, name: name ?? undefined },
    select: { id: true },
  });

  // создаём токен на 10 минут
  const token = await signToken({ sub: user.id, tgId: String(tgId) }, 600);

  // ⚡️ ссылка идёт в API, не в /auth
  const deepLink = `${process.env.PUBLIC_APP_URL}/api/auth/tg/accept?token=${encodeURIComponent(token)}`;

  return NextResponse.json({ ok: true, token, deepLink, ttlSeconds: 600 });
}
