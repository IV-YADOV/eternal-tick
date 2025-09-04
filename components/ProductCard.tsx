import Link from "next/link";
import Price from "./Price";

function badgeLabel(badge?: string | null) {
  if (!badge) return null;
  switch (badge) {
    case "NEW":
      return "NEW";
    case "SALE":
      return "SALE";
    case "HIT":
      return "HIT";
    case "LIMITED":
      return "LIMITED";
    default:
      return null;
  }
}

export default function ProductCard({
  product
}: {
  product: {
    id?: string;
    slug: string;
    name: string;
    images: string[];
    variants: { priceCents: number; currency: string }[];
    brand: { name: string };
    createdAt?: string | Date;
    badge?: "NEW" | "SALE" | "HIT" | "LIMITED" | null;
  };
}) {
  const image = product.images?.[0] || "https://picsum.photos/600/600";
  const minPrice = product.variants[0];
  const label = badgeLabel(product.badge);

  return (
    <Link
      href={`/watch/${product.slug}`}
      className="card overflow-hidden hover:shadow-md transition relative"
    >
      <div className="relative aspect-square">
        {/* бейдж поверх фото */}
        {label && (
          <span className="absolute left-2 top-2 z-10 rounded bg-black/80 text-white text-xs px-2 py-0.5">
            {label}
          </span>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${image}?auto=format&fit=crop&w=1200&q=60`}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="p-4 space-y-1">
        <div className="text-xs text-gray-500">{product.brand?.name}</div>
        <div className="line-clamp-2">{product.name}</div>
        <div>
          <Price cents={minPrice.priceCents} currency={minPrice.currency} />
        </div>
      </div>
    </Link>
  );
}
