// app/admin/posts/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const Page = async () => {
  const posts = await prisma.post.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      published: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Статьи</h1>
        <Link href="/admin/posts/new" className="btn btn-primary">
          Новая статья
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 px-3">Заголовок</th>
              <th className="py-2 px-3">Slug</th>
              <th className="py-2 px-3">Статус</th>
              <th className="py-2 px-3">Создана</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td className="py-6 px-3 text-gray-500" colSpan={5}>
                  Пока нет статей.
                </td>
              </tr>
            ) : (
              posts.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="py-2 px-3">{p.title}</td>
                  <td className="py-2 px-3 font-mono">{p.slug}</td>
                  <td className="py-2 px-3">
                    {p.published ? "Опубликована" : "Черновик"}
                    {p.publishedAt && (
                      <span className="text-gray-500">
                        {" "}
                        — {p.publishedAt.toLocaleDateString()}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {p.createdAt.toLocaleDateString()}
                  </td>
                  <td className="py-2 px-3">
                    <Link className="btn" href={`/admin/posts/${p.id}`}>
                      Редактировать
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Page;
