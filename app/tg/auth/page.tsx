"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function TgAuthPage() {
  const sp = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = sp.get("code");
    if (!code) return;
    (async () => {
      const r = await fetch("/api/auth/tg/consume", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      router.replace(r.ok ? "/account" : "/auth/tg/code?e=1");
    })();
  }, [sp, router]);

  return <div className="p-8">Авторизация через Telegram…</div>;
}
