import { prisma } from "@/lib/prisma";

/**
 * Присваивает гостевые заказы пользователю:
 * - если contactMethod=telegram и contactValue == user.tgId
 * - либо contactMethod=phone и contactValue == user.phone (если есть)
 * - либо contactMethod=email и contactValue == user.email (если добавите email в User)
 * Ограничим последние N дней, чтобы не трогать старую историю (по желанию).
 */
export async function claimGuestOrdersForUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const or: any[] = [];
  if (user.tgId) or.push({ contactMethod: "telegram", contactValue: String(user.tgId) });
  if (user.phone) or.push({ contactMethod: "phone", contactValue: user.phone });
  // if (user.email) or.push({ contactMethod: "email", contactValue: user.email });

  if (or.length === 0) return;

  await prisma.order.updateMany({
    where: {
      userId: null,
      OR: or,
      // опционально: ограничить время, например, за последние 90 дней
      // createdAt: { gte: new Date(Date.now() - 90*24*60*60*1000) }
    },
    data: { userId },
  });
}
