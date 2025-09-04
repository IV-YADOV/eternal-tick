# Eternal Tick — Next.js + Prisma (RUB) Starter

Готовый старт для интернет‑магазина часов на **Next.js 14 (App Router)** + **PostgreSQL + Prisma** + **Tailwind**.
Оплата **отключена** (тестовый режим), заказы создаются со статусом `pending`. Валюта по умолчанию — **RUB**.

## Быстрый старт

1. Установите зависимости:
   ```bash
   npm i
   # или pnpm i / yarn
   ```

2. Поднимите PostgreSQL (Docker):
   ```bash
   docker compose up -d
   ```

3. Создайте `.env`:
   ```bash
   cp .env.example .env
   ```

4. Примените миграции и залейте сиды:
   ```bash
   npx prisma migrate dev --name init
   npm run seed
   ```

5. Запустите dev‑сервер:
   ```bash
   npm run dev
   ```

Откройте http://localhost:3000

## Что внутри

- Каталог `/catalog` с фильтром по бренду
- Карточка товара `/watch/[slug]`
- Корзина `/cart`
- Чекаут `/checkout` — создаёт заказ со статусом `pending` (без оплаты)
- API:
  - `POST /api/cart { action: 'add'|'remove'|'clear', variantId, qty }`
  - `GET /api/cart`
  - `POST /api/checkout { email, address }`

## План по YooKassa (когда будете готовы)

- Создать `payments/yookassa.ts` с методами `createPayment`, `handleWebhook`
- На `/api/checkout` вместо "pending" создавать платёж и возвращать `confirmation_url`
- Добавить `/api/webhooks/yookassa` для callback'ов статусов
- Обновлять `Order.status` на `paid` после `succeeded`

## Замечания по продакшену

- Генерацию номера заказа вынести в sequence/Redis (сейчас — простой счётчик)
- Добавить склад/остатки с блокировкой при оформлении (optimistic/pessimistic)
- SEO: добавить JSON‑LD Product/Offer и sitemap
- Admin: защитить /admin и реализовать CRUD товаров, цен, остатков

## 📜 License & Copyright

All rights reserved © 2025 **YADOV**  

The source code of **Eternal Tick** is provided for reference and personal learning only.  

- ❌ It is NOT allowed to copy or redistribute this project as your own  
- ❌ It is NOT allowed to use this code in commercial or production projects without explicit written permission from **YADOV**  
- ✅ You may review and learn from the code  
- ✅ You may use small snippets for educational purposes with proper attribution  

For licensing inquiries or commercial use, please contact:  
👉 [GitHub Profile](https://github.com/IV-YADOV) | [velvetachannel@gmail.com]

