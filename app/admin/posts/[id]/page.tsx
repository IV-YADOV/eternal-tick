// app/admin/posts/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

function stripQuery(u: string) {
  // чтобы при сохранении не оставить ?auto=...
  try { return new URL(u, "http://x").pathname.replace(/^\/x/, "") || u; } catch { return u; }
}

async function saveImagesFromForm(formData: FormData, prefix: string) {
  const files = formData.getAll("images") as File[];
  const urls: string[] = [];
  if (!files?.length) return urls;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  for (const file of files) {
    if (!file || file.size === 0 || !file.type.startsWith("image/")) continue;
    const ext = (file.type.split("/")[1] || "bin").toLowerCase();
    const safePrefix = (prefix || "post").replace(/[^a-z0-9-_]/gi, "");
    const filename = `${safePrefix}-${Date.now()}-${randomUUID()}.${ext}`;
    await fs.writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
    urls.push(`/uploads/${filename}`);
  }
  return urls;
}

async function tryDeleteFiles(paths: string[]) {
  for (const p of paths) {
    if (!p.startsWith("/uploads/")) continue;
    const abs = path.join(process.cwd(), "public", p);
    try { await fs.unlink(abs); } catch {}
  }
}

async function updatePost(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "");
  const excerpt = String(formData.get("excerpt") || "");
  const contentMd = String(formData.get("contentMd") || "");
  const wantPublish = (formData.get("published") || "") === "on";

  // берём текущий пост (для изображений и статуса)
  const current = await prisma.post.findUnique({ where: { id }, select: { slug: true, images: true, published: true, publishedAt: true } });
  if (!current) throw new Error("Post not found");

  const currentImages: string[] = Array.isArray(current.images) ? (current.images as string[]) : [];
  const removeList = (formData.getAll("removeImages") as string[]).map(stripQuery);

  const keep = currentImages.filter((u) => !removeList.includes(u));
  const uploaded = await saveImagesFromForm(formData, slug || current.slug);
  const images = [...keep, ...uploaded];

  const becamePublished = wantPublish && !current.published;
  const becameDraft = !wantPublish && current.published;

  await prisma.post.update({
    where: { id },
    data: {
      title, slug, excerpt, contentMd,
      images,
      published: wantPublish,
      publishedAt: becamePublished ? new Date() : (becameDraft ? null : current.publishedAt),
    },
  });

  // удалить физически снятые файлы
  await tryDeleteFiles(removeList);

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  redirect(`/admin/posts/${id}?saved=1`);
}

async function deletePost(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const p = await prisma.post.findUnique({ where: { id }, select: { slug: true, images: true } });
  if (!p) return redirect("/admin/posts");

  await prisma.post.delete({ where: { id } });

  await tryDeleteFiles(((p.images as string[]) ?? []).filter(Boolean));

  revalidatePath("/blog");
  revalidatePath(`/blog/${p.slug}`);
  redirect("/admin/posts?deleted=1");
}

export default async function EditPostPage({ params, searchParams }: { params: { id: string }, searchParams?: { saved?: string }}) {
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) notFound();

  const imgs: string[] = Array.isArray(post.images) ? (post.images as string[]) : [];

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Редактирование статьи</h1>
        <a href="/admin/posts" className="hover:underline">← К списку</a>
      </div>

      {searchParams?.saved === "1" && (
        <div className="rounded-md border border-green-300 bg-green-50 text-green-800 px-3 py-2 text-sm">
          Сохранено
        </div>
      )}

      <form action={updatePost} encType="multipart/form-data" className="space-y-4">
        <input type="hidden" name="id" value={post.id} />

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Заголовок</label>
            <input name="title" className="w-full" defaultValue={post.title} required />
          </div>
          <div>
            <label className="text-sm text-gray-600">Slug</label>
            <input name="slug" className="w-full" defaultValue={post.slug} required />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600">Краткое описание</label>
          <textarea name="excerpt" className="w-full min-h-[80px]" defaultValue={post.excerpt || ""} />
        </div>

        <div>
          <label className="text-sm text-gray-600">Текст (Markdown)</label>
          <textarea name="contentMd" className="w-full min-h-[220px]" defaultValue={post.contentMd || ""} />
        </div>

        {/* изображения: добавить/удалить */}
        <div>
          <label className="text-sm text-gray-600">Добавить изображения</label>
          <input type="file" name="images" multiple accept="image/*" className="w-full" />
          {imgs.length > 0 && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
              {imgs.map((src, i) => (
                <label key={src + i} className="group relative rounded border overflow-hidden cursor-pointer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`img-${i}`} className="w-full h-36 object-cover" />
                  <input type="checkbox" name="removeImages" value={src} className="absolute top-2 left-2 h-4 w-4 accent-black" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition">
                    Удалить
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="published" defaultChecked={post.published} />
          <span>Опубликована</span>
        </label>

        <div className="flex gap-3">
          <button className="btn btn-primary">Сохранить</button>
          <form action={deletePost}>
            <input type="hidden" name="id" value={post.id} />
            <button className="btn" type="submit">Удалить</button>
          </form>
        </div>
      </form>
    </div>
  );
}
