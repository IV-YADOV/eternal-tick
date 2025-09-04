import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t mt-16">
      <div className="container py-10 text-sm text-gray-600 grid md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <div className="font-semibold">Watch.Store</div>
          <div>© {new Date().getFullYear()} Watch.Store</div>
        </div>
        <div className="space-y-2">
          <div className="font-semibold">Компания</div>
          <ul className="space-y-1">
            <li><Link className="hover:underline" href="/about">О нас</Link></li>
            <li><Link className="hover:underline" href="/legal/terms">Пользовательское соглашение</Link></li>
            <li><Link className="hover:underline" href="/legal/offer">Публичная оферта</Link></li>
          </ul>
        </div>
        <div className="space-y-2">
          <div className="font-semibold">Политики</div>
          <ul className="space-y-1">
            <li><Link className="hover:underline" href="/legal/privacy">Конфиденциальность</Link></li>
            <li><Link className="hover:underline" href="/legal/cookies">Cookies</Link></li>
            <li><Link className="hover:underline" href="/legal/refund">Возврат и обмен</Link></li>
          </ul>
        </div>
        <div className="space-y-2">
          <div className="font-semibold">Контакты</div>
          <div>E-mail: support@watch.store</div>
          <div>Телеграм: @watchstore</div>
        </div>
      </div>
      {/* Подпись */}
      <div className="text-center text-xs text-gray-500 pb-4">
        Code is art. Signed by <span className="font-semibold">YADOV</span>
      </div>
    </footer>
  );
}
