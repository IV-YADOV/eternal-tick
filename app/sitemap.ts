import { prisma } from "@/lib/prisma";

export default async function sitemap() {
  const base = process.env.APP_URL || "http://localhost:3000";
  const staticUrls = [
  "", "/catalog", "/about", "/cart",
  "/legal/terms", "/legal/privacy", "/legal/offer",
  "/legal/refund", "/legal/delivery", "/legal/cookies"
].map((p) => ({ url: `${base}${p}`, lastModified: new Date() }));


  const products = await prisma.product.findMany({ select: { slug: true, updatedAt: true } });
  const productUrls = products.map((p) => ({
    url: `${base}/watch/${p.slug}`,
    lastModified: p.updatedAt
  }));

  return [...staticUrls, ...productUrls];
}
