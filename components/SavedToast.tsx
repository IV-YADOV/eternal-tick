"use client";

import { useEffect, useState } from "react";

export default function SavedToast({ message }: { message: string }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="rounded-xl shadow-lg border border-green-200 bg-white px-4 py-2 text-sm text-green-700">
        {message}
      </div>
    </div>
  );
}
