export const metadata = {
  title: "Политика использования файлов cookies — Watch.Store",
  description: "Мы используем только необходимые cookies для работы интернет-магазина.",
};

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold">Политика использования файлов cookies</h1>
      <p className="text-sm text-gray-500">Обновлено: 18.08.2025</p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">1. Что такое cookies</h2>
        <p>
          Cookies — это небольшие текстовые файлы, которые сохраняются в вашем браузере при
          посещении сайта. Они помогают обеспечивать корректную работу сервисов и сохранять
          некоторые ваши настройки.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">2. Какие cookies мы используем</h2>
        <p>
          Watch.Store использует <strong>только обязательные cookies</strong>, необходимые для
          работы интернет-магазина. Они не содержат персональной информации и не применяются для
          маркетинга или аналитики.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li><strong>Сессионные cookies</strong> — обеспечивают авторизацию и вход в личный кабинет.</li>
          <li><strong>Корзина</strong> — сохраняют выбранные вами товары до оформления заказа.</li>
          <li><strong>Настройки интерфейса</strong> — например, выбранный язык или валюта.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">3. Управление cookies</h2>
        <p>
          Так как мы используем только технически необходимые cookies, их отключение может
          привести к некорректной работе сайта (например, невозможности добавить товары в корзину
          или войти в аккаунт).
        </p>
        <p>
          При желании вы можете полностью отключить или удалить cookies через настройки вашего
          браузера, однако в этом случае функциональность магазина будет ограничена.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">4. Контакты</h2>
        <p>
          Если у вас есть вопросы по использованию cookies на нашем сайте, свяжитесь с нами по
          электронной почте:{" "}
          <a href="mailto:support@watch.store" className="underline hover:text-gray-600">
            support@watch.store
          </a>
          .
        </p>
      </section>
    </div>
  );
}
