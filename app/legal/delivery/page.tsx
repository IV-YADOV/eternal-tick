export const metadata = {
  title: "Доставка и оплата — Watch.Store",
  description: "Способы доставки и оплаты, сроки и стоимость.",
};

export default function DeliveryPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold">Доставка и оплата</h1>
      <p className="text-sm text-gray-500">Обновлено: 18.08.2025</p>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-1">Доставка</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>СДЭК / Почта РФ / Курьер</li>
            <li>Сроки: 1–7 рабочих дней по РФ</li>
            <li>Стоимость: по тарифам службы, рассчитывается при оформлении</li>
          </ul>
        </div>
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-1">Оплата</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>Онлайн-оплата (YooKassa — скоро)</li>
            <li>Наложенный платёж — по согласованию</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
