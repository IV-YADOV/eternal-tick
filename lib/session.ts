// lib/session.ts
import { cookies } from "next/headers";
import { randomBytes, createHmac } from "crypto";
import { prisma } from "@/lib/prisma";

const COOKIE = "sid";
const SEC = process.env.SESSION_SECRET!;

function sign(v: string) {
  const sig = createHmac("sha256", SEC).update(v).digest("base64url");
  return `${v}.${sig}`;
}
function verify(signed?: string | null) {
  if (!signed) return null;
  const [val, sig] = signed.split(".");
  if (!val || !sig) return null;
  const good = createHmac("sha256", SEC).update(val).digest("base64url");
  return good === sig ? val : null;
}

export async function createSessionForUser(userId: string) {
  const raw = randomBytes(24).toString("base64url");
  await prisma.session.create({ data: { userId, token: raw } });

  cookies().set({
    name: COOKIE,
    value: sign(raw),
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
  });
}

export async function destroySession() {
  const token = verify(cookies().get(COOKIE)?.value);
  if (token) {
    await prisma.session.updateMany({
      where: { token, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  cookies().delete(COOKIE);
}

export async function getCurrentUser() {
  const token = verify(cookies().get(COOKIE)?.value);
  if (!token) return null;
  const s = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!s || s.revokedAt) return null;
  return s.user;
}
