// app/auth/logout/route.ts
import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";

export async function GET(req: Request) {
  await destroySession();
  return NextResponse.redirect(new URL("/", req.url)); // на главную (можно сменить)
}
