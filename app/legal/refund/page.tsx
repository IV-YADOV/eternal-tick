export const metadata = {
  title: "Политика возвратов и обмена — Watch.Store",
  description: "Сроки и порядок возврата/обмена товара.",
};

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold">Политика возвратов и обмена</h1>
      <p className="text-sm text-gray-500">Обновлено: 18.08.2025</p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">1. Сроки и условия</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>Возврат возможен в течение 14 дней с момента получения, если товар не был в употреблении и сохранены пломбы/упаковка.</li>
          <li>При наличии брака — согласно гарантии производителя.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">2. Процедура</h2>
        <p>Напишите на <a className="underline" href="mailto:returns@watch.store">returns@watch.store</a>, приложите номер заказа, фото состояния товара и упаковки.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">3. Возврат средств</h2>
        <p>Средства возвращаются тем же способом оплаты после получения и проверки товара складом.</p>
      </section>
    </div>
  );
}
