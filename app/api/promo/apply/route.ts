// app/api/promo/apply/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateAndCalcDiscount, normalizeCode } from "@/lib/promo";
import { getCurrentUser } from "@/lib/session";

const PROMO_COOKIE = "promoCode";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, subtotalCents } = body as { code: string; subtotalCents: number };

    const user = await getCurrentUser().catch(() => null);

    const res = await validateAndCalcDiscount({
      code,
      subtotalCents: Number(subtotalCents) || 0,
      userId: user?.id,
    });

    if (!res.ok) {
      // чистим cookie, если был некорректный код
      cookies().delete(PROMO_COOKIE);
      return NextResponse.json({ ok: false, reason: res.reason }, { status: 400 });
    }

    // Сохраняем код в cookie (используем нормализованный вид)
    cookies().set({
      name: PROMO_COOKIE,
      value: normalizeCode(code),
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 день
    });

    return NextResponse.json({
      ok: true,
      discountCents: res.discountCents,
      promoId: res.promoId,
      code: res.appliedCode,
    });
  } catch (e) {
    console.error("promo/apply error", e);
    return NextResponse.json({ ok: false, reason: "Server error" }, { status: 500 });
  }
}
