export const metadata = {
  title: "Политика конфиденциальности — Watch.Store",
  description: "Как мы собираем, используем и храним персональные данные.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold">Политика конфиденциальности</h1>
      <p className="text-sm text-gray-500">Обновлено: 18.08.2025</p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">1. Что мы собираем</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>Контактные данные (имя, e-mail, телефон);</li>
          <li>Данные заказа и доставки;</li>
          <li>Технические данные (IP, куки, аналитика).</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">2. Зачем мы это используем</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>Исполнение договора купли-продажи;</li>
          <li>Поддержка пользователей и улучшение сервиса;</li>
          <li>Юридические обязательства (бухучёт и пр.).</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">3. Передача третьим лицам</h2>
        <p>Курьерские службы, платёжные провайдеры (после подключения YooKassa), хостинг/почтовые сервисы — строго по договору и минимуму данных.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">4. Хранение и безопасность</h2>
        <p>Данные хранятся на серверах провайдера БД. Доступ ограничен, используется журналирование и резервное копирование.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">5. Права субъекта данных</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>Доступ, исправление, удаление, переносимость;</li>
          <li>Отзыв согласия и возражение против обработки;</li>
          <li>Запрос: <a className="underline" href="mailto:privacy@watch.store">privacy@watch.store</a>.</li>
        </ul>
      </section>
    </div>
  );
}
