import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Price from "@/components/Price";
import AddToCart from "@/components/AddToCart";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/ProductGallery";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      brand: true,
      category: true, // ← берём категорию (пол)
      variants: { orderBy: { id: "desc" } },
    },
  });

  if (!product) notFound();

  const base = product.variants.find((v) => v.sku?.endsWith("-base"));
  const v = base ?? product.variants[0] ?? null;

  const images = (product.images as string[]) ?? [];
  const firstImage = images[0] ?? "https://picsum.photos/1200/1200";

  const inStock = v?.inStock ?? 0;
  const currency = v?.currency ?? "RUB";
  const priceCents = v?.priceCents ?? 0;

  // ----- Доступность из specs -----
  const availabilityRaw = String((product.specs as any)?.availability ?? "").toLowerCase();
  const availability: "in_stock" | "preorder" | null =
    availabilityRaw === "in_stock" ? "in_stock" : availabilityRaw === "preorder" ? "preorder" : null;

  const availabilityLabel =
    availability === "preorder" ? "Под заказ" : availability === "in_stock" ? "В наличии" : inStock > 0 ? "В наличии" : "Под заказ";

  // ----- Пол из категории -----
  const catSlug = (product.category?.slug || "").toLowerCase();
  const catName = (product.category?.name || "").toLowerCase();

  // Пытаемся понять пол по slug/name категории
  let genderSchema: "male" | "female" | "unisex" | null = null;
  let genderLabel: string | null = null;

  if (/(^|[-_ ])men|муж/i.test(catSlug) || /муж/i.test(catName)) {
    genderSchema = "male";
    genderLabel = "Мужские";
  } else if (/(^|[-_ ])women|жен/i.test(catSlug) || /жен/i.test(catName)) {
    genderSchema = "female";
    genderLabel = "Женские";
  } else if (/uni|unisex|унис/i.test(catSlug) || /унис/i.test(catName)) {
    genderSchema = "unisex";
    genderLabel = "Унисекс";
  }

  // Показываем кнопку «Купить» только если явно «В наличии» (или есть остаток)
  const canBuy = (availability === "in_stock" && inStock > 0) || (availability == null && inStock > 0);

  return (
    <div className="space-y-6">
      {/* Хлебные крошки */}
      <nav className="text-sm text-gray-500">
        <Link href="/" className="hover:underline">Главная</Link> ·{" "}
        <Link href="/catalog" className="hover:underline">Каталог</Link> ·{" "}
        {product.brand ? (
          <Link
            href={`/catalog?brand=${encodeURIComponent(product.brand.slug)}`}
            className="hover:underline"
          >
            {product.brand.name}
          </Link>
        ) : (
          <span>Бренд</span>
        )}
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        <ProductGallery images={images} />

        <div className="space-y-4">
          <div className="text-sm text-gray-500">{product.brand?.name}</div>

          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{product.name}</h1>
            {/* Плашка пола из категории */}
            {genderLabel && (
              <span className="ml-1 inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                {genderLabel}
              </span>
            )}
          </div>

          {v ? (
            <div className="flex items-center gap-3">
              <Price cents={priceCents} currency={currency} />
              <span
                className={`badge ${availabilityLabel === "В наличии" ? "bg-green-100 text-green-700" : ""}`}
                title={availabilityLabel}
              >
                {availabilityLabel}
              </span>
            </div>
          ) : (
            <div className="text-red-600">Варианты товара не заданы</div>
          )}

          <div className="prose max-w-none">
            <p>{product.description}</p>
          </div>

          {v && canBuy ? (
            <AddToCart variantId={v.id} />
          ) : (
            <button className="btn w-full" disabled>
              Недоступно к заказу
            </button>
          )}

          {/* Характеристики */}
          {product.specs && (
            <div className="card p-4 text-sm space-y-2">
              <div className="font-medium">Характеристики</div>
              <dl className="divide-y">
                {Object.entries(product.specs as Record<string, any>)
                  .filter(([k, val]) => {
                    if (k === "gender") return false; // пол теперь из категории
                    if (k === "availability") return false; // доступность показываем сверху
                    return val !== undefined && val !== null && String(val) !== "";
                  })
                  .map(([k, val]) => (
                    <div key={k} className="grid grid-cols-2 gap-4 py-1.5">
                      <dt className="text-gray-500">{formatSpecKey(k)}</dt>
                      <dd className="text-gray-900 text-right">{String(val)}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.name,
            brand: product.brand?.name,
            image: firstImage,
            description: product.description,
            ...(genderSchema ? { audience: { "@type": "PeopleAudience", suggestedGender: genderSchema } } : {}),
            offers:
              v && {
                "@type": "Offer",
                priceCurrency: currency,
                price: (priceCents / 100).toFixed(2),
                availability:
                  availability === "preorder"
                    ? "https://schema.org/PreOrder"
                    : availability === "in_stock" || inStock > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
              },
          }),
        }}
      />
    </div>
  );
}

/** Подписи для характеристик */
function formatSpecKey(key: string) {
  const map: Record<string, string> = {
    mechanism: "Механизм",
    waterResistanceATM: "Водозащита (ATM)",
    glass: "Стекло",
    caseMaterial: "Материал корпуса",
    diameterMM: "Диаметр (мм)",
    thicknessMM: "Толщина (мм)",
    weightG: "Вес (г)",
    powerReserveH: "Запас хода (ч)",
    // gender и availability не отображаем здесь — они визуализируются отдельными бейджами
  };
  return map[key] ?? key;
}
