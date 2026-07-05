"use client";

import { useState } from "react";
import { Coffee, Check } from "lucide-react";

export default function BrandLogoRow({
  brand,
  initialLogoUrl,
}: {
  brand: string;
  initialLogoUrl: string | null;
}) {
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/brand-logos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, logo_url: logoUrl.trim() || null }),
      });
      const data = await res.json();
      if (data.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-cascara/20 flex items-center justify-center shrink-0">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={brand} className="w-full h-full object-cover" />
        ) : (
          <Coffee size={16} className="text-cream" />
        )}
      </div>
      <span className="font-body text-sm text-cream w-32 shrink-0 truncate">{brand}</span>
      <input
        value={logoUrl}
        onChange={(e) => setLogoUrl(e.target.value)}
        className="input-field flex-1"
        placeholder="https://... (link al logo)"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="px-3 py-2 border border-parchment-dim/25 hover:border-crema text-parchment font-mono text-xs rounded-sm transition-colors shrink-0 disabled:opacity-50"
      >
        {saved ? <Check size={14} className="text-crema" /> : saving ? "..." : "Guardar"}
      </button>
    </div>
  );
}
