export const metadata = {
  title: "Пользовательское соглашение — Watch.Store",
  description: "Условия использования сайта и сервиса.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold">Пользовательское соглашение</h1>
      <p className="text-sm text-gray-500">Обновлено: 18.08.2025</p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">1. Общие положения</h2>
        <p>
          Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между
          <b> ООО «[Название компании]»</b> (ИНН [ИНН], ОГРН [ОГРН], адрес: [адрес])
          и пользователем сайта <b>Watch.Store</b>.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">2. Регистрация и аккаунт</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          <li>Пользователь обязуется предоставлять достоверные данные.</li>
          <li>Ответственность за безопасность доступа к аккаунту несёт пользователь.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">3. Каталог и цены</h2>
        <p>Цены в каталоге указаны в рублях РФ и могут быть изменены до момента оформления заказа.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">4. Запрещённые действия</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          <li>Несанкционированный доступ, скрапинг, вмешательство в работу сайта.</li>
          <li>Размещение незаконного контента и спама.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">5. Ответственность</h2>
        <p>Сервис предоставляется «как есть». Компания не несёт ответственность за перебои связи, действия третьих лиц и пр.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">6. Заключительные положения</h2>
        <p>Вопросы направляйте на <a className="underline" href="mailto:support@watch.store">support@watch.store</a>.</p>
      </section>
    </div>
  );
}
