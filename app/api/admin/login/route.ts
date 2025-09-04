import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");
  const next = String(form.get("next") || "/admin");

  // базовый URL — из запроса (надежнее, чем APP_URL)
  const base = new URL(req.url);

  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const res = NextResponse.redirect(new URL(next, base));
    res.cookies.set("admin", "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  }

  const url = new URL("/admin/login", base);
  url.searchParams.set("error", "1");
  return NextResponse.redirect(url);
}
