export const metadata = {
  title: "О нас — Watch.Store",
  description: "Интернет-магазин часов: миссия, ценности, доставка и гарантия.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold">О нас</h1>
      <p className="text-gray-700">
        Watch.Store — это аккуратный интернет-магазин, где мы собрали проверенные модели
        повседневных и классических часов. Мы убеждены, что часы — это не только про время,
        но и про характер. Поэтому уделяем внимание подбору коллекций и честному описанию характеристик.
      </p>

      <div className="card p-5 space-y-2">
        <h2 className="text-xl font-semibold">Почему у нас</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          <li>Официальные бренды и прозрачные цены</li>
          <li>Быстрая отправка по РФ, бережная упаковка</li>
          <li>Поддержка: поможем с выбором под стиль и запястье</li>
          <li>Гарантия и помощь с сервисом</li>
        </ul>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-sm text-gray-500">Доставка</div>
          <div>СДЭК / Почта РФ / Курьер</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500">Оплата</div>
          <div>Картой онлайн (скоро YooKassa), наложенный платёж — по запросу</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500">Гарантия</div>
          <div>Официальная гарантия производителя и наши обязательства по возврату</div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-xl font-semibold mb-2">Контакты</h2>
        <div className="text-gray-700">
          E-mail: support@watch.store<br/>
          Телеграм: @watchstore
        </div>
      </div>
    </div>
  );
}
