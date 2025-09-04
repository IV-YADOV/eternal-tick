export const CURRENCY = process.env.CURRENCY_DEFAULT || "RUB";

export function formatMoney(cents: number, currency: string = CURRENCY) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency
  }).format(cents / 100);
}
