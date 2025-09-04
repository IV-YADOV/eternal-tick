// app/page.tsx (Home)
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Для локальных картинок не добавляем query-параметры (они нужны только CDN)
function buildImgSrc(u: string) {
  const safe = encodeURI(u); // защитим пробелы/кириллицу в имени файла
  const isAbsolute = /^https?:\/\//i.test(safe);
  return isAbsolute ? `${safe}?auto=format&fit=crop&w=1200&q=60` : safe;
}

export default async function Home() {
  // ——— Линейки ———
  const brandsRaw = await prisma.brand.findMany({
    include: {
      _count: { select: { products: true } },
      products: {
        where: { isArchived: false },
        orderBy: { createdAt: "asc" }, // первый добавленный товар — как «обложка»
        take: 1,
        select: { images: true, slug: true, name: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const desired = ["g-shock", "baby-g", "pro-trek", "edifice"];
  const brands = brandsRaw.sort((a, b) => {
    const ia = desired.indexOf(a.slug);
    const ib = desired.indexOf(b.slug);
    const ra = ia === -1 ? Number.POSITIVE_INFINITY : ia;
    const rb = ib === -1 ? Number.POSITIVE_INFINITY : ib;
    return ra - rb || a.name.localeCompare(b.name);
  });

  const brandDescriptions: Record<string, string> = {
    "g-shock": "Ударопрочные спортивные часы для любых испытаний",
    "baby-g": "Компактные и стильные модели для девушек",
    "pro-trek": "Для туризма и активного отдыха: компас, датчики, альтиметр",
    "edifice": "Стиль бизнес + спорт, строгий мужской дизайн",
  };

  // ——— Блог ———
  // Предполагаем модель Post с полями:
  // id, slug, title, images(Json), published(Boolean), createdAt(Date)
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: {
      id: true,
      slug: true,
      title: true,
      images: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-10">
      {/* Хедер */}
      <section className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-semibold">Часы на любой вкус</h1>
        <p className="text-gray-600">Классика, спорт, унисекс — выбирайте свой стиль</p>
        <Link href="/catalog" className="btn btn-primary">Перейти в каталог</Link>
      </section>

      {/* Линейки */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-semibold">Линейки</h2>
          <Link href="/catalog" className="btn btn-primary text-sm px-3 py-1">
            Показать все
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {brands.map((b) => {
            const first = b.products[0];
            const firstImg =
              Array.isArray(first?.images) && (first.images as string[])[0]
                ? String((first.images as string[])[0])
                : "https://picsum.photos/600/600";

            return (
              <Link
                key={b.id}
                href={`/catalog?brand=${encodeURIComponent(b.slug)}`}
                className="group card overflow-hidden hover:shadow-md transition relative"
              >
                <div className="relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={buildImgSrc(firstImg)}
                    alt={b.name}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                    loading="lazy"
                  />

                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent space-y-0.5">
                    <div className="text-white font-semibold">{b.name}</div>
                    {brandDescriptions[b.slug] && (
                      <div className="text-white/80 text-xs">
                        {brandDescriptions[b.slug]}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Блог */}  
<section>
  <div className="mb-4 flex items-end justify-between">
    <h2 className="text-xl font-semibold">Блог</h2>
    <Link href="/blog" className="btn btn-primary text-sm px-3 py-1">
      Все статьи
    </Link>
  </div>

  {posts.length === 0 ? (
    <div className="text-gray-500">Пока нет опубликованных статей.</div>
  ) : (
    <div className="grid md:grid-cols-3 gap-4">
      {posts.map((p) => {
        const img =
          (Array.isArray(p.images) && (p.images as string[])[0]) ||
          "https://picsum.photos/800/600";

        const dateStr = new Date(p.createdAt).toLocaleDateString("ru-RU", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        return (
          <Link
            key={p.id}
            href={`/blog/${encodeURIComponent(p.slug)}`}
            className="card overflow-hidden hover:shadow-md transition flex flex-col"
          >
            {/* фиксированная высота картинки */}
            <div className="w-full h-[250px] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={buildImgSrc(String(img))}
                alt={p.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-3 space-y-1 flex-1 flex flex-col">
              <div className="text-xs text-gray-500">{dateStr}</div>
              <div className="font-medium line-clamp-2">{p.title}</div>
            </div>
          </Link>
        );
      })}
    </div>
  )}
</section>

    </div>
  );
}
