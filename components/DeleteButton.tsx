// components/DeleteButton.tsx
"use client";

export default function DeleteButton({
  action,
  children,
}: {
  action: (formData: FormData) => Promise<void>;
  children?: React.ReactNode;
}) {
  return (
    <button
      className="btn btn-danger"
      formNoValidate
      // Клиентская логика подтверждения и вызов server action
      formAction={async (formData) => {
        if (confirm("Удалить статью безвозвратно?")) {
          await action(formData);
        }
      }}
    >
      {children ?? "Удалить"}
    </button>
  );
}
