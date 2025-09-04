// prisma/seed.ts
import { prisma } from "../lib/prisma"; // поправь путь если lib лежит в другом месте

async function main() {
  // очистим старые тестовые статьи
  await prisma.post.deleteMany({ where: { slug: "pervaya-statya" } });

  await prisma.post.create({
    data: {
      slug: "pervaya-statya",
      title: "Первая тестовая статья",
      content: `
Это первая тестовая статья для блога.

Здесь можно писать длинный текст, делать переносы строк и всё остальное.
Например:

- Список преимуществ
- Описание товара
- Лайфхаки по уходу за часами

Текст хранится в базе и показывается на странице блога.
      `,
      published: true,
      images: ["/uploads/test-blog.jpg"], // положи картинку в public/uploads/
    },
  });

  console.log("✓ Тестовая статья создана");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
