"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function AddToCart({ variantId }: { variantId: string }) {
  const [pending, start] = useTransition();
  const [ok, setOk] = useState(false);
  const router = useRouter();

  return (
    <button
      className="btn btn-primary w-full"
      disabled={pending}
      onClick={() => {
        start(async () => {
          const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "add", variantId, qty: 1 })
          });
          if (res.ok) {
            setOk(true);
            router.refresh();
          }
        });
      }}
    >
      {pending ? "Добавляем..." : ok ? "✅ В корзине" : "В корзину"}
    </button>
  );
}
