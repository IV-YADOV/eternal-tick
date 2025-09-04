"use client";

import { useEffect, useMemo, useState } from "react";

type Pair = { key: string; value: string };

function normalizePairs(pairs: Pair[]): Record<string, string | number> {
  const obj: Record<string, string | number> = {};
  for (const { key, value } of pairs) {
    const k = key.trim();
    if (!k) continue;
    // если value — число, преобразуем
    const n = Number(value);
    obj[k] = Number.isFinite(n) && value.trim() !== "" && /^-?\d+(\.\d+)?$/.test(value.trim())
      ? n
      : value.trim();
  }
  return obj;
}

export default function SpecsEditor({
  name = "specs",
  initial,
  label = "Характеристики",
}: {
  name?: string;
  initial?: Record<string, any> | null;
  label?: string;
}) {
  const [pairs, setPairs] = useState<Pair[]>(() => {
    if (!initial) return [{ key: "", value: "" }];
    const list: Pair[] = Object.entries(initial).map(([k, v]) => ({
      key: k,
      value: v == null ? "" : String(v),
    }));
    return list.length ? list : [{ key: "", value: "" }];
  });

  // валидация: непустые ключи, без дубликатов
  const errors = useMemo(() => {
    const e: string[] = [];
    const keys = pairs.map((p) => p.key.trim()).filter(Boolean);
    const dup = keys.filter((k, i) => keys.indexOf(k) !== i);
    if (dup.length) e.push("Есть дублирующиеся ключи характеристик.");
    return e;
  }, [pairs]);

  // сериализуем в скрытое поле
  const serialized = useMemo(() => JSON.stringify(normalizePairs(pairs)), [pairs]);

  function addRow() {
    setPairs((arr) => [...arr, { key: "", value: "" }]);
  }

  function removeRow(idx: number) {
    setPairs((arr) => arr.filter((_, i) => i !== idx).length ? arr.filter((_, i) => i !== idx) : [{ key: "", value: "" }]);
  }

  function update(idx: number, patch: Partial<Pair>) {
    setPairs((arr) => {
      const next = [...arr];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  // авто-добавление пустой строки в конец для удобства
  useEffect(() => {
    const last = pairs[pairs.length - 1];
    if (last && (last.key.trim() || last.value.trim())) {
      setPairs((arr) => [...arr, { key: "", value: "" }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairs.length > 0 && pairs[pairs.length - 1]?.key, pairs.length > 0 && pairs[pairs.length - 1]?.value]);

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-medium">{label}</div>
        <button type="button" className="btn btn-sm" onClick={addRow}>+ Добавить</button>
      </div>

      {errors.length > 0 && (
        <div className="rounded border border-amber-300 bg-amber-50 text-amber-900 text-sm p-2">
          {errors.map((m, i) => <div key={i}>{m}</div>)}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pairs.map((p, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              className="w-1/2"
              placeholder="Ключ (напр., Стекло)"
              value={p.key}
              onChange={(e) => update(idx, { key: e.target.value })}
            />
            <input
              className="w-1/2"
              placeholder="Значение (напр., Сапфировое)"
              value={p.value}
              onChange={(e) => update(idx, { value: e.target.value })}
            />
            <button
              type="button"
              aria-label="Удалить"
              className="btn"
              onClick={() => removeRow(idx)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* сериализованное значение для server action */}
      <input type="hidden" name={name} value={serialized} />
      <div className="text-xs text-gray-500">Пустые строки игнорируются. Числа сохраняются как числа.</div>
    </div>
  );
}
