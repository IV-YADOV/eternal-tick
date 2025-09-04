// app/blog/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function buildImgSrc(u: string) {
  const safe = encodeURI(u);
  const isAbsolute = /^https?:\/\//i.test(safe);
  return isAbsolute ? `${safe}?auto=format&fit=crop&w=1600&q=75` : safe;
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

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      title: true,
      contentMd: true,
      images: true,
      createdAt: true,
      publishedAt: true,
      published: true,
    },
  });

  if (!post || !post.published) notFound();

  const images = (Array.isArray(post.images) ? (post.images as string[]) : []) || [];
  const cover = images[0];
  const date = post.publishedAt ?? post.createdAt;

  return (
    <article className="space-y-6">
      <nav className="text-sm text-gray-500">
        <Link href="/" className="hover:underline">
          Главная
        </Link>{" "}
        ·{" "}
        <Link href="/blog" className="hover:underline">
          Блог
        </Link>{" "}
        · <span>{post.title}</span>
      </nav>

      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold">{post.title}</h1>
        <div className="text-sm text-gray-500">{formatDate(date)}</div>
      </header>

      {cover && (
        <div className="relative aspect-[16/9] card overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={buildImgSrc(cover)} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Пока без MD-рендера: выводим как текст с переносами.
         Когда решишь — подключим markdown-парсер и заменим этот блок. */}
      <div className="prose max-w-none">
        <p style={{ whiteSpace: "pre-wrap" }}>{post.contentMd}</p>
      </div>

      {/* JSON-LD (Article) для SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            image: cover,
            datePublished: (date ?? new Date()).toISOString(),
            author: { "@type": "Organization", name: "Watch Shop" },
          }),
        }}
      />
    </article>
  );
}
