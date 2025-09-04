// app/blog/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Локальные картинки не трогаем query-параметрами
function buildImgSrc(u: string) {
  const safe = encodeURI(u);
  const isAbsolute = /^https?:\/\//i.test(safe);
  return isAbsolute ? `${safe}?auto=format&fit=crop&w=1200&q=70` : safe;
}

function formatDate(d?: Date | null) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function excerpt(text: string, n = 180) {
  const s = text.replace(/\s+/g, " ").trim();
  return s.length > n ? s.slice(0, n).trimEnd() + "…" : s;
}

export default async function BlogIndexPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    // если есть publishedAt — сортируем по нему, иначе по createdAt
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      contentMd: true,
      images: true,
      createdAt: true,
      publishedAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold">Блог</h1>
        <p className="text-gray-600">Новости, обзоры и полезные материалы</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center text-gray-500">Пока нет опубликованных статей.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {posts.map((p) => {
            const firstImg =
              Array.isArray(p.images) && (p.images as string[])[0]
                ? String((p.images as string[])[0])
                : "https://picsum.photos/800/800";

            const date = p.publishedAt ?? p.createdAt;

            return (
              <Link
                key={p.id}
                href={`/blog/${encodeURIComponent(p.slug)}`}
                className="group card overflow-hidden hover:shadow-md transition"
              >
                <div className="relative aspect-[4/3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={buildImgSrc(firstImg)}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <div className="text-xs text-gray-500">{formatDate(date)}</div>
                  <h3 className="font-medium line-clamp-2">{p.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {excerpt(p.contentMd || "")}
                  </p>
                  <span className="inline-block text-sm text-blue-600 group-hover:underline">
                    Читать →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
