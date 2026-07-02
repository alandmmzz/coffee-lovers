"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X, Copy, Users } from "lucide-react";
import type { Group } from "@/lib/db";

export default function GroupHeader({ group }: { group: Group }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(group.name);
  const [imageUrl, setImageUrl] = useState(group.image_url ?? "");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/groups/${group.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), image_url: imageUrl.trim() || null }),
      });
      const data = await res.json();
      if (data.ok) {
        setEditing(false);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  function copyInvite() {
    const url = `${window.location.origin}/groups/join/${group.invite_code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      {!editing ? (
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-cascara/20 flex items-center justify-center shrink-0">
            {group.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={group.image_url} alt={group.name} className="w-full h-full object-cover" />
            ) : (
              <Users size={22} className="text-cream" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl text-cream truncate">{group.name}</h1>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Editar grupo"
            className="text-parchment-dim hover:text-crema transition-colors shrink-0"
          >
            <Pencil size={16} />
          </button>
        </div>
      ) : (
        <div className="space-y-3 mb-4 bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
          <div>
            <label className="field-label">Nombre del grupo</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="field-label">Foto (pegá un link)</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input-field"
              placeholder="https://..."
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-cascara hover:bg-cascara-light disabled:opacity-60 text-cream text-sm rounded-sm transition-colors"
            >
              <Check size={14} />
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setName(group.name);
                setImageUrl(group.image_url ?? "");
              }}
              className="flex items-center gap-1.5 px-4 py-2 border border-parchment-dim/25 hover:border-crema text-parchment text-sm rounded-sm transition-colors"
            >
              <X size={14} />
              Cancelar
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={copyInvite}
        className="flex items-center gap-2 font-mono text-xs text-parchment-dim hover:text-crema transition-colors"
      >
        <Copy size={13} />
        {copied ? "¡Copiado!" : "Copiar link de invitación"}
      </button>
    </div>
  );
}
