"use client";
import { useState } from "react";

export default function AdminLogin({ searchParams }: { searchParams: { next?: string } }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const next = searchParams.next || "/admin";

  return (
    <div className="max-w-sm mx-auto card p-6">
      <h1 className="text-xl font-semibold mb-4">Вход в админку</h1>
      <form method="post" action="/api/admin/login" className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div className="space-y-2">
          <label className="text-sm text-gray-600">E-mail</label>
          <input name="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full" placeholder="admin@example.com" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Пароль</label>
          <input type="password" name="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full" placeholder="••••••••" />
        </div>
        <button className="btn btn-primary w-full">Войти</button>
        <p className="text-xs text-gray-500">Логин/пароль берутся из переменных окружения ADMIN_EMAIL / ADMIN_PASSWORD</p>
      </form>
    </div>
  );
}