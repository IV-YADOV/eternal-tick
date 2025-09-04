// app/admin/posts/new/page.tsx
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

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

async function createPost(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "");
  const excerpt = String(formData.get("excerpt") || "");
  const contentMd = String(formData.get("contentMd") || "");
  const published = (formData.get("published") || "") === "on";

  const images = await saveImagesFromForm(formData, slug || "post");

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      excerpt,
      contentMd,
      images,
      published,
      publishedAt: published ? new Date() : null,
    },
    select: { id: true },
  });

  // Инвалидации
  // @ts-ignore
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/blog");
  if (published) revalidatePath(`/blog/${slug}`);

  redirect(`/admin/posts/${post.id}?saved=1`);
}

export default function NewPostPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Новая статья</h1>

      <form action={createPost} encType="multipart/form-data" className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Заголовок</label>
            <input name="title" className="w-full" required />
          </div>
          <div>
            <label className="text-sm text-gray-600">Slug</label>
            <input name="slug" className="w-full" required />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600">Краткое описание</label>
          <textarea name="excerpt" className="w-full min-h-[80px]" />
        </div>

        <div>
          <label className="text-sm text-gray-600">Текст (Markdown)</label>
          <textarea name="contentMd" className="w-full min-h-[220px]" />
        </div>

        <div>
          <label className="text-sm text-gray-600">Изображения (можно несколько)</label>
          <input type="file" name="images" accept="image/*" multiple className="w-full" />
        </div>

        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="published" />
          <span>Опубликовать</span>
        </label>

        <div>
          <button className="btn btn-primary">Создать</button>
        </div>
      </form>
    </div>
  );
}
