"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Coffee } from "@/lib/db";

export default function EditCoffeeForm({ coffee }: { coffee: Coffee }) {
  const router = useRouter();
  const [brand, setBrand] = useState(coffee.brand);
  const [line, setLine] = useState(coffee.line);
  const [origin, setOrigin] = useState(coffee.origin ?? "");
  const [farm, setFarm] = useState(coffee.farm ?? "");
  const [variety, setVariety] = useState(coffee.variety ?? "");
  const [process, setProcess] = useState(coffee.process ?? "");
  const [tastingNotes, setTastingNotes] = useState(coffee.tasting_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!brand.trim() || !line.trim()) {
      setError("Marca y línea son obligatorios.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/coffees/${coffee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: brand.trim(),
          line: line.trim(),
          origin: origin.trim() || null,
          farm: farm.trim() || null,
          variety: variety.trim() || null,
          process: process.trim() || null,
          tasting_notes: tastingNotes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "No se pudo guardar.");
        setSaving(false);
        return;
      }
      router.push("/admin/coffees");
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "No se pudo conectar con el servidor.");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Link
        href="/admin/coffees"
        className="inline-flex items-center gap-1.5 text-parchment-dim text-sm hover:text-crema transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        Volver al catálogo
      </Link>

      <div>
        <label className="field-label">Marca</label>
        <input value={brand} onChange={(e) => setBrand(e.target.value)} className="input-field" />
      </div>
      <div>
        <label className="field-label">Línea / tipo</label>
        <input value={line} onChange={(e) => setLine(e.target.value)} className="input-field" />
      </div>
      <div>
        <label className="field-label">Origen</label>
        <input value={origin} onChange={(e) => setOrigin(e.target.value)} className="input-field" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Finca</label>
          <input value={farm} onChange={(e) => setFarm(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="field-label">Variedad</label>
          <input value={variety} onChange={(e) => setVariety(e.target.value)} className="input-field" />
        </div>
      </div>
      <div>
        <label className="field-label">Proceso</label>
        <input value={process} onChange={(e) => setProcess(e.target.value)} className="input-field" />
      </div>
      <div>
        <label className="field-label">Notas</label>
        <textarea
          value={tastingNotes}
          onChange={(e) => setTastingNotes(e.target.value)}
          className="input-field min-h-24 resize-y"
        />
      </div>

      {error && <p className="text-cascara-light text-sm">{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3.5 bg-cascara hover:bg-cascara-light disabled:opacity-60 text-cream font-body text-sm rounded-sm transition-colors"
      >
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  );
}
