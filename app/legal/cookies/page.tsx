export const metadata = {
  title: "Политика использования файлов cookies — Watch.Store",
  description: "Какие cookie мы используем и как ими управлять.",
};

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold">Политика cookies</h1>
      <p className="text-sm text-gray-500">Обновлено: 18.08.2025</p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">1. Что такое cookies</h2>
        <p>Небольшие файлы, которые помогают распознавать ваш браузер и улучшать работу сайта.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">2. Какие cookies мы используем</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>Технические (сессии, корзина);</li>
          <li>Аналитические (например, GA4);</li>
          <li>Функциональные (настройки языка/валюты).</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">3. Как управлять cookies</h2>
        <p>Можно ограничить или отключить cookies в настройках браузера. Это может повлиять на работу некоторых функций (например, корзины).</p>
      </section>
    </div>
  );
}
