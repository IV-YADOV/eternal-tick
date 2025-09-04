import { formatMoney } from "@/lib/format";

export default function Price({ cents, currency = "RUB" }: { cents: number; currency?: string }) {
  return <span className="font-semibold">{formatMoney(cents, currency)}</span>;
}
