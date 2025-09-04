// app/admin/products/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import SavedToast from "@/components/SavedToast";
import { revalidatePath } from "next/cache";
import SpecsEditor from "@/components/admin/SpecsEditor";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

function num(v: FormDataEntryValue | null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
function str(v: FormDataEntryValue | null) {
  const s = (v ?? "").toString().trim();
  return s.length ? s : undefined;
}

async function saveImagesFromForm(formData: FormData, prefix: string) {
  const files = formData.getAll("images") as File[]; // name="images"
  const urls: string[] = [];
  if (!files || files.length === 0) return urls;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  for (const file of files) {
    if (!file || file.size === 0) continue;
    if (!file.type?.startsWith?.("image/")) continue;

    const buf = Buffer.from(await file.arrayBuffer());
    const ext = (file.type.split("/")[1] || "bin").toLowerCase();
    const safePrefix = prefix.replace(/[^a-z0-9-_]/gi, "");
    const filename = `${safePrefix || "img"}-${Date.now()}-${randomUUID()}.${ext}`;
    await fs.writeFile(path.join(uploadDir, filename), buf);
    urls.push(`/uploads/${filename}`);
  }
  return urls;
}

async function tryDeleteFiles(paths: string[]) {
  for (const p of paths) {
    // Удаляем только из нашей папки uploads для безопасности
    if (!p.startsWith("/uploads/")) continue;
    const abs = path.join(process.cwd(), "public", p);
    try {
      await fs.unlink(abs);
    } catch {
      // файл мог уже отсутствовать — ок
    }
  }
}

async function updateProduct(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const variantId = String(formData.get("variantId") || "");
  const name = String(formData.get("name") || "");
  const slug = String(formData.get("slug") || "");
  const brandId = String(formData.get("brandId") || "");
  const categoryId = String(formData.get("categoryId") || "");
  const price = num(formData.get("price")) ?? 0;
  const inStock = num(formData.get("inStock")) ?? 0;
  const description = String(formData.get("description") || "");

  // badge: enum ProductBadge | null
  const badgeRaw = (formData.get("badge") ?? "").toString().trim().toUpperCase();
  const badge =
    badgeRaw === "NEW" || badgeRaw === "SALE" || badgeRaw === "HIT" || badgeRaw === "LIMITED"
      ? (badgeRaw as "NEW" | "SALE" | "HIT" | "LIMITED")
      : null;

  // Выбранные поля-управлялки для витрины:
  const availability = (formData.get("availability") || "").toString(); // "in_stock" | "preorder" | ""
  const gender = (formData.get("gender") || "").toString();             // "men" | "women" | "unisex" | ""

  // Текущий продукт (для текущих изображений и текущих specs)
  const current = await prisma.product.findUnique({
    where: { id },
    select: { images: true, slug: true, specs: true },
  });
  if (!current) throw new Error("Product not found");

  const currentImages: string[] = Array.isArray(current.images) ? (current.images as string[]) : [];
  const currentSpecs: Record<string, any> = (current.specs ?? {}) as Record<string, any>;

  // ДИНАМИЧЕСКИЕ характеристики из скрытого поля "specs" (JSON)
  let editorSpecs: Record<string, any> = {};
  try {
    const json = String(formData.get("specs") || "{}");
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === "object") editorSpecs = parsed;
  } catch {
    editorSpecs = {};
  }

  // ИТОГОВЫЕ SPECS: берём старые → накладываем editorSpecs → сверху — поля из селектов
  const nextSpecs: Record<string, any> = { ...currentSpecs, ...editorSpecs };
  if (availability === "in_stock" || availability === "preorder") {
    nextSpecs.availability = availability;
  } else {
    // если в форме "— не указано —", удалим ключ, чтобы не мусорить
    delete nextSpecs.availability;
  }
  if (["men", "women", "unisex"].includes(gender)) {
    nextSpecs.gender = gender;
  } else {
    delete nextSpecs.gender;
  }

  // Что пометили на удаление
  const removeList = formData.getAll("removeImages") as string[]; // значения = src
  const keepImages = currentImages.filter((src) => !removeList.includes(src));

  // Новые загрузки
  const uploadedImages = await saveImagesFromForm(formData, slug || current.slug);

  // Итоговый список: оставшиеся + новые
  const nextImages = [...keepImages, ...uploadedImages];

  // Обновляем продукт
  await prisma.product.update({
    where: { id },
    data: {
      name,
      slug,
      brandId,
      categoryId,
      description,
      images: nextImages,
      specs: nextSpecs,
      badge,
    },
  });

  // Пытаемся удалить файлы с диска, которые убрали из продукта
  const removedFiles = removeList.filter((src) => src.startsWith("/uploads/"));
  if (removedFiles.length) {
    await tryDeleteFiles(removedFiles);
  }

  // Вариант (цена/остаток)
  if (variantId) {
    await prisma.productVariant.update({
      where: { id: variantId },
      data: { priceCents: Math.round(price * 100), inStock },
    });
  } else {
    const existing = await prisma.productVariant.findFirst({ where: { productId: id } });
    if (existing) {
      await prisma.productVariant.update({
        where: { id: existing.id },
        data: { priceCents: Math.round(price * 100), inStock },
      });
    } else {
      await prisma.productVariant.create({
        data: {
          productId: id,
          sku: `${slug}-base`,
          priceCents: Math.round(price * 100),
          currency: "RUB",
          attributes: { color: "black" },
          inStock,
        },
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath(`/watch/${slug}`);
  revalidatePath("/admin/products");

  redirect(`/admin/products/${id}?saved=1`);
}

async function deleteProduct(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));

  const variants = await prisma.productVariant.findMany({
    where: { productId: id },
    select: { id: true },
  });
  const variantIds = variants.map((v) => v.id);

  const hasOrders =
    variantIds.length > 0
      ? (await prisma.orderItem.count({ where: { variantId: { in: variantIds } } })) > 0
      : false;

  if (hasOrders) {
    await prisma.product.update({
      where: { id },
      data: { isArchived: true },
    });
    await prisma.productVariant.updateMany({
      where: { productId: id },
      data: { inStock: 0 },
    });

    revalidatePath("/");
    revalidatePath("/catalog");
    revalidatePath("/admin/products");
    return redirect(`/admin/products/${id}?result=archived`);
  }

  // Пытаемся удалить файлы картинок товара с диска перед удалением
  const current = await prisma.product.findUnique({ where: { id }, select: { images: true } });
  const imgs = (current?.images as string[]) ?? [];
  if (imgs.length) await tryDeleteFiles(imgs);

  if (variantIds.length) {
    await prisma.productVariant.deleteMany({ where: { id: { in: variantIds } } });
  }
  await prisma.product.delete({ where: { id } });

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/catalog");
  return redirect("/admin/products?result=deleted");
}

export default async function EditProduct({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { saved?: string; result?: "archived" | "deleted" };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { brand: true, category: true, variants: true },
  });
  if (!product) notFound();

  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const base = product.variants.find((vv) => vv.sku?.endsWith("-base"));
  const v = base ?? product.variants[0];

  const imgs = (product.images as string[]) || [];
  const specs = (product.specs ?? {}) as Record<string, any>;
  const availability = (specs.availability as string) || ""; // "in_stock" | "preorder" | ""
  const gender = (specs.gender as string) || "";             // "men" | "women" | "unisex" | ""

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Редактирование товара</h1>

      <nav className="text-sm text-gray-500">
        <Link className="hover:underline" href="/admin/products">
          ← К списку товаров
        </Link>
      </nav>

      {searchParams?.saved === "1" && <SavedToast message="Сохранено" />}

      {searchParams?.result === "archived" && (
        <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-900 px-4 py-3 text-sm">
          Товар архивирован, потому что по его вариантам есть оформленные заказы. Он скрыт с витрины и недоступен к покупке.
        </div>
      )}
      {searchParams?.result === "deleted" && (
        <div className="rounded-md border border-green-300 bg-green-50 text-green-800 px-4 py-3 text-sm">
          Товар удалён.
        </div>
      )}

      {/* enctype обязателен для загрузки файлов */}
      <form action={updateProduct} className="space-y-4" encType="multipart/form-data">
        <input type="hidden" name="id" value={product.id} />
        <input type="hidden" name="variantId" value={v?.id ?? ""} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Название</label>
            <input name="name" defaultValue={product.name} className="w-full" required />
          </div>
          <div>
            <label className="text-sm text-gray-600">Slug (ЧПУ)</label>
            <input name="slug" defaultValue={product.slug} className="w-full" required />
          </div>

          <div>
            <label className="text-sm text-gray-600">Линейка</label>
            <select name="brandId" className="w-full" defaultValue={product.brandId}>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Категория</label>
            <select name="categoryId" className="w-full" defaultValue={product.categoryId}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Цена (₽)</label>
            <input type="number" min={0} name="price" className="w-full" defaultValue={v ? v.priceCents / 100 : 0} />
          </div>

          <div>
            <label className="text-sm text-gray-600">Остаток (шт)</label>
            <input type="number" min={0} name="inStock" className="w-full" defaultValue={v?.inStock ?? 0} />
          </div>

          {/* Доступность */}
          <div>
            <label className="text-sm text-gray-600">Доступность</label>
            <select name="availability" className="w-full" defaultValue={availability || ""}>
              <option value="">— не указано —</option>
              <option value="in_stock">В наличии</option>
              <option value="preorder">Под заказ</option>
            </select>
          </div>

          {/* Пол */}
          <div>
            <label className="text-sm text-gray-600">Пол</label>
            <select name="gender" className="w-full" defaultValue={gender || ""}>
              <option value="">— не указано —</option>
              <option value="men">Мужские</option>
              <option value="women">Женские</option>
              <option value="unisex">Унисекс</option>
            </select>
          </div>

          {/* Бейдж */}
          <div>
            <label className="text-sm text-gray-600">Бейдж</label>
            <select name="badge" className="w-full" defaultValue={(product as any).badge ?? ""}>
              <option value="">— нет —</option>
              <option value="NEW">Новинка</option>
              <option value="SALE">Скидка</option>
              <option value="HIT">Хит</option>
              <option value="LIMITED">Лимит</option>
            </select>
          </div>

          {/* Добавление новых изображений */}
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Добавить изображения</label>
            <input type="file" name="images" accept="image/*" multiple className="w-full" />
            <div className="text-xs text-gray-500 mt-1">
              Новые файлы добавятся к оставшимся. Чтобы убрать старые — отметьте чекбоксы «Удалить».
            </div>

            {/* Текущие изображения с чекбоксами удаления */}
            {imgs.length > 0 && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                {imgs.map((src, i) => (
                  <label
                    key={src + i}
                    className="group relative cursor-pointer select-none rounded border overflow-hidden"
                    title={src}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`image-${i}`} className="w-full h-36 object-cover" />
                    <input
                      type="checkbox"
                      name="removeImages"
                      value={src}
                      className="absolute top-2 left-2 h-4 w-4 accent-black"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition">
                      Удалить
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ДИНАМИЧЕСКИЕ ХАРАКТЕРИСТИКИ */}
        <SpecsEditor name="specs" initial={specs} />

        <div>
          <label className="text-sm text-gray-600">Описание</label>
          <textarea name="description" className="w-full min-h-[120px]}" defaultValue={product.description} />
        </div>

        <div className="flex gap-3">
          <button className="btn btn-primary">Сохранить</button>
          <button className="btn" formAction={deleteProduct}>
            Удалить
          </button>
        </div>
      </form>
    </div>
  );
}
