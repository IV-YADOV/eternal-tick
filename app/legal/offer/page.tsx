export const metadata = {
  title: "Публичная оферта — Watch.Store",
  description: "Условия продажи товаров дистанционным способом.",
};

export default function OfferPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold">Публичная оферта</h1>
      <p className="text-sm text-gray-500">Обновлено: 18.08.2025</p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">1. Предмет договора</h2>
        <p>Продавец — <b>ООО «[Название компании]»</b>, Покупатель — любое дееспособное лицо, оформившее заказ на сайте.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">2. Порядок оформления заказа</h2>
        <p>Заказ оформляется на сайте. Подтверждение — письмо на e-mail. Оплата — онлайн (после подключения YooKassa) или иные способы по согласованию.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">3. Доставка</h2>
        <p>По РФ службами СДЭК/Почта РФ/курьер. Сроки и стоимость зависят от региона.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">4. Гарантия и возврат</h2>
        <p>Официальная гарантия производителя. Возврат/обмен — см. Политику возвратов.</p>
      </section>
    </div>
  );
}
