import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Пускаем на страницу логина без проверки
  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  // Проверяем cookie admin=1
  if (pathname.startsWith("/admin")) {
    const admin = req.cookies.get("admin")?.value;
    if (admin !== "1") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};