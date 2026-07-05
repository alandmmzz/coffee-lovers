"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Check, ChevronRight, ArrowLeft, X, Coffee as CoffeeIcon } from "lucide-react";
import type { Coffee, BrandLogo } from "@/lib/db";
import { PROCESS_LABELS } from "@/lib/constants";

type Step = "brands" | "lines" | "create";

export default function CoffeeSelector({
  value,
  onChange,
}: {
  value: Coffee | null;
  onChange: (coffee: Coffee) => void;
}) {
  const [open, setOpen] = useState(false);
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState<Step>("brands");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [newBrand, setNewBrand] = useState("");
  const [newLine, setNewLine] = useState("");
  const [newOrigin, setNewOrigin] = useState("");
  const [newFarm, setNewFarm] = useState("");
  const [newVariety, setNewVariety] = useState("");
  const [newProcess, setNewProcess] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([
      fetch("/api/coffees").then((r) => r.json()),
      fetch("/api/brand-logos").then((r) => r.json()),
    ]).then(([coffeesData, logosData]) => {
      if (coffeesData.ok) setCoffees(coffeesData.coffees);
      if (logosData.ok) {
        const map: Record<string, string> = {};
        for (const l of logosData.logos as BrandLogo[]) {
          if (l.logo_url) map[l.brand] = l.logo_url;
        }
        setLogos(map);
      }
      setLoading(false);
    });
  }, [open]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const brands = useMemo(() => {
    const set = new Map<string, number>();
    for (const c of coffees) {
      set.set(c.brand, (set.get(c.brand) ?? 0) + 1);
    }
    return [...set.entries()]
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => a.brand.localeCompare(b.brand));
  }, [coffees]);

  const filteredBrands = brands.filter((b) =>
    b.brand.toLowerCase().includes(query.toLowerCase())
  );

  const linesForBrand = useMemo(() => {
    if (!selectedBrand) return [];
    return coffees
      .filter((c) => c.brand === selectedBrand)
      .filter((c) => c.line.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => a.line.localeCompare(b.line));
  }, [coffees, selectedBrand, query]);

  function openSelector() {
    setOpen(true);
    setStep("brands");
    setSelectedBrand(null);
    setQuery("");
    setError("");
  }

  function close() {
    setOpen(false);
  }

  function goToBrand(brand: string) {
    setSelectedBrand(brand);
    setStep("lines");
    setQuery("");
  }

  function backToBrands() {
    setSelectedBrand(null);
    setStep("brands");
    setQuery("");
  }

  function startCreate() {
    setNewBrand(step === "lines" && selectedBrand ? selectedBrand : query);
    setNewLine("");
    setNewOrigin("");
    setNewFarm("");
    setNewVariety("");
    setNewProcess("");
    setNewNotes("");
    setError("");
    setStep("create");
  }

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
          tasting_notes: newNotes.trim() || null,
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
      close();
    } catch (err: any) {
      setError(err.message ?? "No se pudo crear el café.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openSelector}
        className="input-field w-full flex items-center justify-between text-left"
      >
        <span className={value ? "text-cream" : "text-parchment-dim/50"}>
          {value ? `${value.brand} — ${value.line}` : "Elegí o creá un café"}
        </span>
        <ChevronRight size={16} className="text-parchment-dim shrink-0" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-ink flex flex-col">
          {/* Header fijo arriba, con volver/cerrar y buscador */}
          <div className="shrink-0 border-b border-parchment-dim/15 bg-ink">
            <div className="flex items-center gap-2 px-4 pt-4">
              {step === "lines" ? (
                <button
                  type="button"
                  onClick={backToBrands}
                  aria-label="Volver a marcas"
                  className="p-1.5 -ml-1.5 text-parchment hover:text-crema transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
              ) : step === "create" ? (
                <button
                  type="button"
                  onClick={() => setStep(selectedBrand ? "lines" : "brands")}
                  aria-label="Cancelar"
                  className="p-1.5 -ml-1.5 text-parchment hover:text-crema transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
              ) : (
                <div className="w-8" />
              )}
              <h2 className="font-display text-lg text-cream flex-1">
                {step === "brands" && "Elegí la marca"}
                {step === "lines" && selectedBrand}
                {step === "create" && "Nuevo café"}
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar"
                className="p-1.5 -mr-1.5 text-parchment-dim hover:text-crema transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {step !== "create" && (
              <div className="flex items-center gap-2 px-4 py-3">
                <Search size={16} className="text-parchment-dim shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={step === "brands" ? "Buscar marca..." : "Buscar línea..."}
                  className="w-full bg-transparent text-cream placeholder:text-parchment-dim/50 outline-none"
                  style={{ fontSize: 16 }}
                />
              </div>
            )}
          </div>

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {loading && (
              <p className="font-mono text-xs text-parchment-dim text-center mt-8">Cargando...</p>
            )}

            {!loading && step === "brands" && (
              <>
                {filteredBrands.length === 0 && (
                  <p className="font-body text-sm text-parchment-dim text-center mt-8">
                    Ninguna marca coincide con “{query}”.
                  </p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
                  {filteredBrands.map(({ brand, count }) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => goToBrand(brand)}
                      className="flex flex-col items-center gap-2 p-4 bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm hover:border-crema transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-cascara/20 flex items-center justify-center shrink-0">
                        {logos[brand] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={logos[brand]} alt={brand} className="w-full h-full object-cover" />
                        ) : (
                          <CoffeeIcon size={20} className="text-cream" />
                        )}
                      </div>
                      <span className="font-body text-sm text-cream text-center">{brand}</span>
                      <span className="font-mono text-[10px] text-parchment-dim">
                        {count} línea{count === 1 ? "" : "s"}
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={startCreate}
                  className="flex items-center justify-center gap-2 w-full max-w-xl mx-auto mt-6 py-3.5 border border-dashed border-parchment-dim/30 hover:border-crema text-crema font-body text-sm rounded-sm transition-colors"
                >
                  <Plus size={16} />
                  Agregar un café nuevo
                </button>
              </>
            )}

            {!loading && step === "lines" && (
              <div className="max-w-xl mx-auto">
                {linesForBrand.length === 0 && (
                  <p className="font-body text-sm text-parchment-dim text-center mt-8">
                    Ninguna línea coincide con “{query}”.
                  </p>
                )}
                <ul className="divide-y divide-parchment-dim/10 border-t border-b border-parchment-dim/10">
                  {linesForBrand.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onChange(c);
                          close();
                        }}
                        className="w-full text-left px-2 py-3.5 hover:bg-parchment/[0.04] transition-colors flex items-center justify-between gap-3"
                      >
                        <span className="min-w-0">
                          <span className="font-body text-sm text-cream block truncate">{c.line}</span>
                          {(c.origin || c.variety || c.process) && (
                            <span className="block font-mono text-[11px] text-parchment-dim mt-0.5 truncate">
                              {[c.origin, c.variety, c.process ? PROCESS_LABELS[c.process] ?? c.process : null]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          )}
                        </span>
                        {value?.id === c.id ? (
                          <Check size={16} className="text-crema shrink-0" />
                        ) : (
                          <ChevronRight size={16} className="text-parchment-dim shrink-0" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={startCreate}
                  className="flex items-center justify-center gap-2 w-full mt-4 py-3.5 border border-dashed border-parchment-dim/30 hover:border-crema text-crema font-body text-sm rounded-sm transition-colors"
                >
                  <Plus size={16} />
                  Agregar una línea nueva de {selectedBrand}
                </button>
              </div>
            )}

            {step === "create" && (
              <div
                className="max-w-md mx-auto space-y-4"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreate();
                  }
                }}
              >
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
                <div>
                  <label className="field-label">Notas (opcional)</label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="input-field min-h-20 resize-y"
                    placeholder="Notas de cata, de dónde lo sacaste, lo que sea..."
                  />
                </div>

                {error && <p className="text-cascara-light text-xs">{error}</p>}

                <div className="flex gap-2 pt-1 pb-6">
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={saving}
                    className="flex-1 py-3 bg-cascara hover:bg-cascara-light disabled:opacity-60 text-cream text-sm rounded-sm transition-colors"
                  >
                    {saving ? "Guardando..." : "Crear y usar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(selectedBrand ? "lines" : "brands")}
                    className="px-4 py-3 border border-parchment-dim/25 text-parchment text-sm rounded-sm hover:border-crema transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
