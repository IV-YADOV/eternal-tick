export const metadata = {
  title: "О нас — почему выбирают EternalTick",
  description:
    "Мы — интернет-магазин EternalTick. Продаём не просто часы, а эмоции от времени. Только оригинальные модели с гарантией и заботой о клиентах.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-3xl font-semibold">
        О нас — почему выбирают EternalTick
      </h1>
      <p className="text-gray-700">
        EternalTick — это интернет-магазин, где мы продаём не просто часы, а{" "}
        <strong>эмоции от времени</strong>. Мы работаем напрямую с официальными
        дилерами и предлагаем только оригинальные модели. Каждая покупка у нас —
        это не просто аксессуар, а надёжный спутник, подчеркивающий стиль и
        характер.
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Наша миссия</h2>
        <p className="text-gray-700">
          Делать время доступным и надёжным. Мы хотим, чтобы качественные часы
          были не роскошью, а частью повседневной жизни каждого человека.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Как мы работаем</h2>
        <p className="text-gray-700">
          EternalTick использует механизм{" "}
          <strong>параллельного импорта</strong>. Это значит, что мы закупаем
          часы у официальных дилеров в Китае и доставляем их напрямую нашим
          клиентам. Такой подход позволяет предлагать оригинальные товары по
          более доступным ценам без посредников.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Почему выбирают нас</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li> Только оригинальные часы</li>
          <li> Прямые поставки от официальных дилеров</li>
          <li> Поддержка клиентов 24/7</li>
          <li> Быстрая и надёжная доставка</li>
          <li> Гарантия и сервисное обслуживание</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Наша команда</h2>
        <p className="text-gray-700">
          За EternalTick стоят энтузиасты, которые увлечены миром часов.
          Мы верим, что каждая модель — это история, и делаем всё, чтобы клиент
          чувствовал нашу заботу от выбора до доставки.
        </p>
        <div className="bg-gray-100 border rounded-md p-4 text-center text-gray-500">
          📸 Здесь будет фото нашей команды
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Сертификаты и партнёрство</h2>
        <p className="text-gray-700">
          EternalTick работает официально. Мы предоставляем документы,
          подтверждающие оригинальность продукции, ИП-регистрацию и наши
          партнёрские соглашения.
        </p>
        <div className="bg-gray-100 border rounded-md p-4 text-center text-gray-500">
          📄 Здесь будут сканы сертификатов
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Отзывы и упоминания</h2>
        <p className="text-gray-700">
          Наши часы рекомендуют блогеры и нас отмечают в СМИ. Нам важно делиться
          реальными историями клиентов, ведь именно они формируют доверие.
        </p>
        <div className="bg-gray-100 border rounded-md p-4 text-center text-gray-500">
          ⭐ Здесь будут отзывы клиентов и блогеров
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Контакты</h2>
        <div className="text-gray-700">
          📧 E-mail:{" "}
          <a
            href="mailto:support@eternaltick.store"
            className="underline hover:text-gray-600"
          >
            support@eternaltick.store
          </a>
          <br />
          💬 Телеграм:{" "}
          <a
            href="https://t.me/eternaltick"
            className="underline hover:text-gray-600"
          >
            @eternaltick
          </a>
        </div>
      </section>
    </div>
  );
}
