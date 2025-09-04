// app/catalog/page.tsx
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import type { Prisma } from "@prisma/client";
import Link from "next/link";

export const dynamic = "force-dynamic";

type SearchParams = {
  brand?: string;
  min?: string;
  max?: string;
  q?: string;            // поиск по названию/бренду
  stock?: "1";           // только в наличии
  new?: "1";             // новинки (за 30 дней)
  sort?: "price_asc" | "price_desc" | "new" | "default";
};

// продукт со связями brand + variants
type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { brand: true; variants: true };
}>;

export default async function Catalog({ searchParams }: { searchParams: SearchParams }) {
  // Бренды (для селекта)
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });

  // ---------- ФИЛЬТРЫ ----------
  const where: Prisma.ProductWhereInput = {
    isArchived: false,
  };

  // бренд по slug
  if (searchParams.brand) {
    const brand = await prisma.brand.findUnique({ where: { slug: searchParams.brand } });
    if (brand) where.brandId = brand.id;
  }

  // цена от/до (в копейках)
  const minRub = searchParams.min ? Math.max(0, Math.floor(Number(searchParams.min))) : undefined;
  const maxRub = searchParams.max ? Math.max(0, Math.floor(Number(searchParams.max))) : undefined;

  if (minRub !== undefined || maxRub !== undefined) {
    const priceFilter: Prisma.IntFilter = {};
    if (minRub !== undefined) priceFilter.gte = minRub * 100;
    if (maxRub !== undefined) priceFilter.lte = maxRub * 100;
    where.variants = {
      some: {
        priceCents: priceFilter,
      },
    };
  }

  // только в наличии
  if (searchParams.stock === "1") {
    where.AND = [...(where.AND as any[] ?? []), { variants: { some: { inStock: { gt: 0 } } } }];
  }

  // новинки: товары, созданные за последние 30 дней
  if (searchParams.new === "1") {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    where.createdAt = { gte: since };
  }

  // поиск по названию/бренду
  if (searchParams.q && searchParams.q.trim().length > 0) {
    const q = searchParams.q.trim();
    where.AND = [
      ...(where.AND as any[] ?? []),
      {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { brand: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
    ];
  }

  // ---------- СОРТИРОВКА ----------
  // По умолчанию — новее сверху
  // ---------- СОРТИРОВКА ----------
let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
if (searchParams.sort === "new" || !searchParams.sort || searchParams.sort === "default") {
  orderBy = { createdAt: "desc" };
}

// ---------- ДАННЫЕ ----------
const productsRaw = await prisma.product.findMany({
  where,
  include: {
    brand: true,
    variants: { orderBy: { id: "desc" } },
  },
  orderBy,     // тут больше не пытаемся сортировать по цене!
  take: 48,
});

// helper: минимальная цена варианта
const minPrice = (p: { variants: { priceCents: number }[] }) =>
  p.variants.length ? Math.min(...p.variants.map(v => v.priceCents)) : Number.POSITIVE_INFINITY;

// если нужна сортировка по цене — делаем на приложении
let sorted = [...productsRaw];
if (searchParams.sort === "price_asc") {
  sorted.sort((a, b) => minPrice(a) - minPrice(b));
} else if (searchParams.sort === "price_desc") {
  sorted.sort((a, b) => minPrice(b) - minPrice(a));
}

// Ставим вариант `*-base` первым
const products: ProductWithRelations[] = sorted.map((p) => {
  const base = p.variants.find((v) => v.sku?.endsWith("-base"));
  if (!base) return p as ProductWithRelations;
  return { ...p, variants: [base, ...p.variants.filter((v) => v.id !== base.id)] } as ProductWithRelations;
});


  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Каталог</h1>

      {/* ---- Мобильные фильтры (collapsible) ---- */}
      <details className="md:hidden rounded-lg border p-3" {...(hasAnyFilter(searchParams) ? { open: true } : {})}>
        <summary className="cursor-pointer select-none font-medium">Фильтры и сортировка</summary>
        <div className="pt-3">
          <FilterForm brands={brands} searchParams={searchParams} mobile />
        </div>
      </details>

      <div className="grid md:grid-cols-[280px_1fr] gap-6">
        {/* ---- Десктоп фильтры ---- */}
        <aside className="hidden md:block card p-4 space-y-4 h-max sticky top-4">
          <FilterForm brands={brands} searchParams={searchParams} />
        </aside>

        {/* ---- Товары ---- */}
        <section>
          {products.length === 0 ? (
            <div className="text-sm text-gray-600">
              По вашим условиям ничего не найдено.{" "}
              <Link href="/catalog" className="hover:underline">Сбросить фильтры</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p as any} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ===== ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ (серверные) ===== */

function hasAnyFilter(sp: SearchParams) {
  return Boolean(sp.brand || sp.min || sp.max || sp.q || sp.stock === "1" || sp.new === "1" || (sp.sort && sp.sort !== "default"));
}

function FilterForm({
  brands,
  searchParams,
  mobile = false,
}: {
  brands: { id: string; name: string; slug: string }[];
  searchParams: SearchParams;
  mobile?: boolean;
}) {
  return (
    <form className="space-y-3" method="GET">
      {/* Поиск */}
      <div className="space-y-2">
        <label className="text-sm text-gray-600">Поиск</label>
        <input
          type="text"
          name="q"
          placeholder="Название"
          defaultValue={searchParams.q ?? ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      {/* Бренд */}
      <div className="space-y-2">
        <label className="text-sm text-gray-600">Линейка</label>
        <select
          name="brand"
          defaultValue={searchParams.brand ?? ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="">Все</option>
          {brands.map((b) => (
            <option key={b.id} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Цена */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Цена от, ₽</label>
          <input
            type="number"
            min={0}
            name="min"
            className="w-full rounded-lg text-center border border-gray-300 px-3 py-2"
            defaultValue={searchParams.min ?? ""}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Цена до, ₽</label>
          <input
            type="number"
            min={0}
            name="max"
            className="w-full rounded-lg text-center border border-gray-300 px-3 py-2"
            defaultValue={searchParams.max ?? ""}
          />
        </div>
      </div>

      {/* Флаги */}
      <div className="space-y-2">
        <label className="text-sm text-gray-600">Дополнительно</label>
        <div className="flex flex-col gap-2">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="stock" value="1" defaultChecked={searchParams.stock === "1"} />
            <span className="text-sm">Только в наличии</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="new" value="1" defaultChecked={searchParams.new === "1"} />
            <span className="text-sm">Новинки (за 30 дней)</span>
          </label>
        </div>
      </div>

      {/* Сортировка */}
      <div className="space-y-2">
        <label className="text-sm text-gray-600">Сортировка</label>
        <select
          name="sort"
          defaultValue={searchParams.sort ?? "default"}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="default">По умолчанию (новее)</option>
          <option value="price_asc">Сначала дешевле</option>
          <option value="price_desc">Сначала дороже</option>
          <option value="new">Сначала новинки</option>
        </select>
      </div>

      {/* Кнопки */}
      <div className={mobile ? "grid grid-cols-2 gap-2" : "flex gap-2"}>
        <button className="btn w-full">Фильтровать</button>
        <Link href="/catalog" className="btn w-full text-center">
          Сбросить
        </Link>
      </div>
    </form>
  );
}
