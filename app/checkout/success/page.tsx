import { prisma } from "@/lib/prisma";

export default async function SuccessPage({ searchParams }: { searchParams: { order?: string } }) {
  const orderId = searchParams.order;
  const order = orderId ? await prisma.order.findUnique({ where: { id: orderId } }) : null;

  return (
    <div className="text-center space-y-4">
      <h1 className="text-2xl font-semibold">Спасибо за заказ!</h1>
      {order ? (
        <p className="text-gray-600">Номер заказа: <b>{order.number}</b>. Статус: {order.status}.</p>
      ) : (
        <p className="text-gray-600">Заказ создан.</p>
      )}
    </div>
  );
}
