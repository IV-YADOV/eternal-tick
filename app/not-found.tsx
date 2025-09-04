import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center space-y-4">
      <h1 className="text-3xl font-semibold">Страница не найдена</h1>
      <p className="text-gray-600">Похоже, ссылка неверная или устарела.</p>
      <Link href="/" className="btn">На главную</Link>
    </div>
  );
}
