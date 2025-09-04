"use client";

import { useFormStatus } from "react-dom";

export default function DeleteOrderForm({
  action,
  orderId,
}: {
  action: (formData: FormData) => void; // серверный экшен
  orderId: string;
}) {
  function DeleteButton() {
    const { pending } = useFormStatus();
    return (
      <button
        type="submit"
        className="btn bg-red-600 text-white hover:bg-red-700"
        onClick={(e) => {
          if (!confirm("Удалить заказ? Это действие необратимо.")) {
            e.preventDefault(); // без подтверждения не отправляем
          }
        }}
        disabled={pending}
      >
        {pending ? "Удаляем..." : "Удалить заказ"}
      </button>
    );
  }

  return (
    <form action={action} method="post" className="pt-2">
      <input type="hidden" name="id" value={orderId} />
      <DeleteButton />
      <p className="text-xs text-gray-500 mt-1">
        Внимание: удаление необратимо. Все позиции заказа будут удалены.
      </p>
    </form>
  );
}
