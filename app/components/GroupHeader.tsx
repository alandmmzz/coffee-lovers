"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X, Copy, Users } from "lucide-react";
import type { Group } from "@/lib/db";

function resizeImageToDataUrl(file: File, maxSize = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        const canvas = document.createElement("canvas");
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo procesar la imagen."));
          return;
        }
        ctx.drawImage(img, sx, sy, side, side, 0, 0, maxSize, maxSize);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => reject(new Error("No se pudo leer la imagen."));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
}

export default function GroupHeader({ group }: { group: Group }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(group.name);
  const [imageUrl, setImageUrl] = useState(group.image_url ?? "");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setImageUrl(dataUrl);
    } catch (err: any) {
      setUploadError(err.message ?? "No se pudo procesar la imagen.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

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
        <div className="space-y-4 mb-4 bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
          <div>
            <label className="field-label">Nombre del grupo</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </div>

          <div>
            <label className="field-label">Foto del grupo</label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-cascara/20 flex items-center justify-center shrink-0 border border-parchment-dim/20">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Users size={18} className="text-cream" />
                )}
              </div>
              <label className="cursor-pointer px-3 py-2 border border-parchment-dim/25 hover:border-crema text-parchment font-mono text-xs rounded-sm transition-colors">
                {uploading ? "Procesando..." : "Subir foto"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="font-mono text-[11px] text-parchment-dim hover:text-cascara-light transition-colors"
                >
                  Sacar foto
                </button>
              )}
            </div>
            {uploadError && <p className="font-mono text-[11px] text-cascara-light mt-1.5">{uploadError}</p>}

            <button
              type="button"
              onClick={() => setShowUrlInput((s) => !s)}
              className="mt-2 font-mono text-[11px] text-parchment-dim underline underline-offset-2 hover:text-crema transition-colors"
            >
              {showUrlInput ? "Ocultar" : "...o pegar un link a mano"}
            </button>
            {showUrlInput && (
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="input-field mt-2"
                placeholder="https://..."
              />
            )}
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
                setShowUrlInput(false);
                setUploadError("");
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
