"use client";
import { useState, useMemo, useCallback } from "react";

export default function ProductGallery({ images }: { images: string[] }) {
  const pics = useMemo(
    () => (Array.isArray(images) && images.length ? images : ["https://picsum.photos/1200/1200"]),
    [images]
  );
  const [idx, setIdx] = useState(0);

  const prev = useCallback(() => setIdx((n) => (n - 1 + pics.length) % pics.length), [pics.length]);
  const next = useCallback(() => setIdx((n) => (n + 1) % pics.length), [pics.length]);
  const go = useCallback((i: number) => setIdx(i), []);

  return (
    <div className="space-y-3">
      {/* Основное изображение */}
      <div className="relative aspect-square overflow-hidden rounded-lg border group">
        {/* Кнопки навигации (если больше 1 фото) */}
        {pics.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Предыдущее фото"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 backdrop-blur px-3 py-2 hover:bg-white"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Следующее фото"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 backdrop-blur px-3 py-2 hover:bg-white"
            >
              ›
            </button>
          </>
        )}

        {/* Лупа-оверлей */}
        <div className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition">
          <div className="absolute right-2 top-2 select-none rounded-md bg-black/50 px-2 py-1 text-xs text-white">
            🔍 Увеличить
          </div>
        </div>

        {/* Картинка c «лупой»: курсор-лупа + лёгкий зум при ховере */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${pics[idx]}?auto=format&fit=crop&w=1600&q=80`}
          alt={`Фото ${idx + 1}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05] cursor-zoom-in"
          draggable={false}
        />
      </div>

      {/* Миниатюры */}
      {pics.length > 1 && (
        <div className="flex gap-2">
          {pics.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => go(i)}
              className={`relative h-16 w-16 overflow-hidden rounded border ${
                i === idx ? "ring-2 ring-black" : "opacity-80 hover:opacity-100"
              }`}
              aria-label={`Показать фото ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${src}?auto=format&fit=crop&w=200&q=60`} alt={`thumb-${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
