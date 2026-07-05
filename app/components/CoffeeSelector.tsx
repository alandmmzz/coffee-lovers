"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus, Check, ChevronDown } from "lucide-react";
import type { Coffee } from "@/lib/db";
import { PROCESS_LABELS } from "@/lib/constants";

export default function CoffeeSelector({
  value,
  onChange,
}: {
  value: Coffee | null;
  onChange: (coffee: Coffee) => void;
}) {
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [newBrand, setNewBrand] = useState("");
  const [newLine, setNewLine] = useState("");
  const [newOrigin, setNewOrigin] = useState("");
  const [newFarm, setNewFarm] = useState("");
  const [newVariety, setNewVariety] = useState("");
  const [newProcess, setNewProcess] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/coffees")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setCoffees(data.coffees);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = coffees.filter((c) =>
    `${c.brand} ${c.line}`.toLowerCase().includes(query.toLowerCase())
  );

  async function handleCreate() {
    if (!newBrand.trim() || !newLine.trim()) {
      setError("Marca y línea/tipo son obligatorios.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/coffees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: newBrand.trim(),
          line: newLine.trim(),
          origin: newOrigin.trim() || null,
          farm: newFarm.trim() || null,
          variety: newVariety.trim() || null,
          process: newProcess.trim() || null,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "No se pudo crear el café.");
        setSaving(false);
        return;
      }
      const created: Coffee = data.coffee;
      setCoffees((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
      onChange(created);
      setCreating(false);
      setOpen(false);
      setNewBrand("");
      setNewLine("");
      setNewOrigin("");
      setNewFarm("");
      setNewVariety("");
      setNewProcess("");
    } catch (err: any) {
      setError(err.message ?? "No se pudo crear el café.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input-field w-full flex items-center justify-between text-left"
      >
        <span className={value ? "text-cream" : "text-parchment-dim/50"}>
          {value ? `${value.brand} — ${value.line}` : "Elegí o creá un café"}
        </span>
        <ChevronDown size={16} className="text-parchment-dim shrink-0" />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 w-full bg-ink-soft border border-parchment-dim/25 rounded-sm shadow-xl max-h-80 overflow-y-auto">
          {!creating ? (
            <>
              <div className="p-2 border-b border-parchment-dim/15 sticky top-0 bg-ink-soft">
                <div className="flex items-center gap-2 px-2">
                  <Search size={14} className="text-parchment-dim shrink-0" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar marca o línea..."
                    className="w-full bg-transparent py-1.5 text-sm text-cream placeholder:text-parchment-dim/50 outline-none"
                  />
                </div>
              </div>

              {loading && (
                <p className="px-4 py-3 font-mono text-xs text-parchment-dim">Cargando...</p>
              )}

              {!loading && filtered.length === 0 && (
                <p className="px-4 py-3 font-body text-sm text-parchment-dim">
                  Ningún café coincide con “{query}”.
                </p>
              )}

              <ul>
                {filtered.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(c);
                        setOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-parchment/5 transition-colors flex items-center justify-between gap-2"
                    >
                      <span>
                        <span className="font-body text-sm text-cream">
                          {c.brand} — {c.line}
                        </span>
                        {(c.origin || c.process || c.variety) && (
                          <span className="block font-mono text-[11px] text-parchment-dim mt-0.5">
                            {[c.origin, c.variety, c.process ? PROCESS_LABELS[c.process] ?? c.process : null]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        )}
                      </span>
                      {value?.id === c.id && <Check size={15} className="text-crema shrink-0" />}
                    </button>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => {
                  setCreating(true);
                  setNewBrand(query);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-crema hover:bg-parchment/5 transition-colors border-t border-parchment-dim/15"
              >
                <Plus size={15} />
                Agregar un café nuevo
              </button>
            </>
          ) : (
            <div
              className="p-4 space-y-3"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreate();
                }
              }}
            >
              <p className="font-mono text-[11px] text-parchment-dim uppercase tracking-wide">
                Nuevo café
              </p>
              <div>
                <label className="field-label">Marca</label>
                <input
                  autoFocus
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  className="input-field"
                  placeholder="Ej: Doré"
                />
              </div>
              <div>
                <label className="field-label">Línea / tipo</label>
                <input
                  value={newLine}
                  onChange={(e) => setNewLine(e.target.value)}
                  className="input-field"
                  placeholder="Ej: 07"
                />
              </div>
              <div>
                <label className="field-label">Origen (opcional)</label>
                <input
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  className="input-field"
                  placeholder="Ej: Brasil, Mantiqueira de Minas"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Finca (opcional)</label>
                  <input
                    value={newFarm}
                    onChange={(e) => setNewFarm(e.target.value)}
                    className="input-field"
                    placeholder="Ej: Capadoccia"
                  />
                </div>
                <div>
                  <label className="field-label">Variedad (opcional)</label>
                  <input
                    value={newVariety}
                    onChange={(e) => setNewVariety(e.target.value)}
                    className="input-field"
                    placeholder="Ej: Catuaí rojo"
                  />
                </div>
              </div>
              <div>
                <label className="field-label">Proceso (opcional)</label>
                <input
                  list="process-suggestions"
                  value={newProcess}
                  onChange={(e) => setNewProcess(e.target.value)}
                  className="input-field"
                  placeholder="Ej: Lavado, Honey, Natural..."
                />
                <datalist id="process-suggestions">
                  <option value="Lavado" />
                  <option value="Honey" />
                  <option value="Natural" />
                  <option value="Natural fermentado" />
                  <option value="Fermentación anaeróbica" />
                </datalist>
              </div>

              {error && <p className="text-cascara-light text-xs">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={saving}
                  className="flex-1 py-2 bg-cascara hover:bg-cascara-light disabled:opacity-60 text-cream text-sm rounded-sm transition-colors"
                >
                  {saving ? "Guardando..." : "Crear y usar"}
                </button>
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="px-4 py-2 border border-parchment-dim/25 text-parchment text-sm rounded-sm hover:border-crema transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
