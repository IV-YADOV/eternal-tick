"use client";
import { useState } from "react";

type ContactMethod = "telegram" | "phone" | "email";

export default function CheckoutPage() {
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");

  const [name, setName] = useState("");
  const [contactMethod, setContactMethod] = useState<ContactMethod>("telegram");
  const [contactValue, setContactValue] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");

  // ошибки
  const [errors, setErrors] = useState<{ name?: string; contact?: string; address?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Введите имя";
    if (!contactValue.trim()) newErrors.contact = "Укажите контакт";
    if (!address.trim()) newErrors.address = "Введите адрес";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const placeOrder = async () => {
    if (!validate()) return;

    setStatus("processing");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          contactMethod,
          contactValue: contactValue.trim(),
          address,
          comment,
        }),
      });
      if (!res.ok) throw new Error("fail");
      const data = await res.json();
      window.location.href = `/checkout/success?order=${data.orderId}`;
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Оформление заказа</h1>

      {/* Имя */}
      <div className="space-y-1">
        <label className="text-sm text-gray-600">Имя</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full rounded-lg border px-3 py-2 ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Иван Иванов"
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* Контакты */}
      <div className="space-y-1">
        <label className="text-sm text-gray-600">Контакт</label>
        <div className="grid grid-cols-3 gap-2">
          {(["telegram", "phone", "email"] as ContactMethod[]).map((method) => (
            <label key={method} className={`btn ${contactMethod === method ? "btn-primary" : ""}`}>
              <input
                type="radio"
                name="contactMethod"
                value={method}
                className="hidden"
                checked={contactMethod === method}
                onChange={() => setContactMethod(method)}
              />
              {method === "telegram" ? "Telegram" : method === "phone" ? "Телефон" : "Email"}
            </label>
          ))}
        </div>
        <input
          value={contactValue}
          onChange={(e) => setContactValue(e.target.value)}
          className={`w-full rounded-lg border px-3 py-2 ${
            errors.contact ? "border-red-500" : "border-gray-300"
          }`}
          placeholder={
            contactMethod === "telegram"
              ? "@username"
              : contactMethod === "phone"
              ? "+7 999 000 00 00"
              : "you@example.com"
          }
        />
        {errors.contact && <p className="text-xs text-red-500">{errors.contact}</p>}
      </div>

      {/* Адрес */}
      <div className="space-y-1">
        <label className="text-sm text-gray-600">Адрес доставки</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Город, улица, дом, квартира"
          className={`w-full min-h-[100px] rounded-lg border px-3 py-2 ${
            errors.address ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
      </div>

      {/* Комментарий */}
      <div className="space-y-2">
        <label className="text-sm text-gray-600">Комментарий к заказу</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="К примеру: позвонить заранее, удобное время доставки и т.п."
          className="w-full min-h-[80px] rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="text-sm text-gray-500">
        Оплата отключена (тестовый режим). Заказ будет создан со статусом <b>pending</b>.
      </div>

      <button onClick={placeOrder} className="btn btn-primary w-full" disabled={status === "processing"}>
        {status === "processing" ? "Создаём заказ..." : "Создать заказ (тест)"}
      </button>

      {status === "error" && <div className="text-sm text-red-600">Не удалось создать заказ. Попробуйте ещё раз.</div>}
    </div>
  );
}
