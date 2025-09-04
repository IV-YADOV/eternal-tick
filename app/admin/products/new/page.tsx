// app/admin/products/new/page.tsx
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
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

/** Сохранение всех загруженных файлов из input[name="images"] в /public/uploads */
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
    const safePrefix = (prefix || "img").replace(/[^a-z0-9-_]/gi, "");
    const filename = `${safePrefix}-${Date.now()}-${randomUUID()}.${ext}`;
    await fs.writeFile(path.join(uploadDir, filename), buf);
    urls.push(`/uploads/${filename}`);
  }
  return urls;
}

async function createProduct(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "");
  const slug = String(formData.get("slug") || "");
  const brandId = String(formData.get("brandId") || "");
  const categoryId = String(formData.get("categoryId") || "");
  const price = num(formData.get("price")) ?? 0;
  const description = String(formData.get("description") || "");

  // Бейдж (enum ProductBadge) — пустое значение = undefined
  const badgeRaw = (formData.get("badge") ?? "").toString().trim().toUpperCase();
  const badge =
    badgeRaw === "NEW" || badgeRaw === "SALE" || badgeRaw === "HIT" || badgeRaw === "LIMITED"
      ? (badgeRaw as "NEW" | "SALE" | "HIT" | "LIMITED")
      : undefined;

  // ДИНАМИЧЕСКИЕ характеристики (JSON из скрытого поля "specs")
  let specs: Record<string, any> = {};
  try {
    const json = String(formData.get("specs") || "{}");
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === "object") specs = parsed;
  } catch {
    specs = {};
  }

  // НОВОЕ: доступность + пол — кладём в specs без миграций
  const availability = (formData.get("availability") || "in_stock").toString();
  if (availability === "in_stock" || availability === "preorder") {
    specs.availability = availability; // "in_stock" | "preorder"
  }

  const gender = (formData.get("gender") || "").toString();
  if (["men", "women", "unisex"].includes(gender)) {
    specs.gender = gender; // "men" | "women" | "unisex"
  }

  // Сохраняем загруженные изображения
  const uploadedImages = await saveImagesFromForm(formData, slug);

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      brandId,
      categoryId,
      description,
      specs,
      images: uploadedImages, // массив путей /uploads/...
      badge,
      variants: {
        create: [
          {
            sku: `${slug}-base`,
            priceCents: Math.round(price * 100),
            currency: "RUB",
            attributes: { color: "black" },
            inStock: Number(formData.get("inStock") || 10),
          },
        ],
      },
    },
  });

  redirect(`/admin/products/${product.id}`);
}

export default async function NewProduct() {
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">Новый товар</h1>

      {/* ВАЖНО: enctype для загрузки файлов */}
      <form action={createProduct} className="space-y-4" encType="multipart/form-data">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Название</label>
            <input name="name" className="w-full" required />
          </div>
          <div>
            <label className="text-sm text-gray-600">Slug (ЧПУ)</label>
            <input name="slug" className="w-full" required />
          </div>

          <div>
            <label className="text-sm text-gray-600">Линейка</label>
            <select name="brandId" className="w-full" required>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Категория</label>
            <select name="categoryId" className="w-full" required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Цена (₽)</label>
            <input type="number" min={0} name="price" className="w-full" defaultValue={0} />
          </div>

          <div>
            <label className="text-sm text-gray-600">Остаток (шт)</label>
            <input type="number" min={0} name="inStock" className="w-full" defaultValue={10} />
          </div>

          {/* НОВОЕ: Доступность */}
          <div>
            <label className="text-sm text-gray-600">Доступность</label>
            <select name="availability" className="w-full" defaultValue="in_stock">
              <option value="in_stock">В наличии</option>
              <option value="preorder">Под заказ</option>
            </select>
          </div>

          {/* НОВОЕ: Пол (для витрины) */}
          <div>
            <label className="text-sm text-gray-600">Пол</label>
            <select name="gender" className="w-full" defaultValue="">
              <option value="">— не указано —</option>
              <option value="men">Мужские</option>
              <option value="women">Женские</option>
              <option value="unisex">Унисекс</option>
            </select>
          </div>

          {/* Бейдж (опционально) */}
          <div>
            <label className="text-sm text-gray-600">Бейдж</label>
            <select name="badge" className="w-full" defaultValue="">
              <option value="">— нет —</option>
              <option value="NEW">Новинка</option>
              <option value="SALE">Скидка</option>
              <option value="HIT">Хит</option>
              <option value="LIMITED">Лимит</option>
            </select>
          </div>

          {/* Загрузка изображений с ПК (несколько) */}
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Изображения (можно несколько)</label>
            <input type="file" name="images" accept="image/*" multiple className="w-full" />
            <div className="text-xs text-gray-500 mt-1">
              Форматы: JPG/PNG/WebP. Можно выбрать несколько файлов.
            </div>
          </div>
        </div>

        {/* ДИНАМИЧЕСКИЕ ХАРАКТЕРИСТИКИ */}
        <SpecsEditor name="specs" />

        <div>
          <label className="text-sm text-gray-600">Описание</label>
          <textarea name="description" className="w-full min-h-[120px]" />
        </div>

        <button className="btn btn-primary">Создать</button>
      </form>
    </div>
  );
}
