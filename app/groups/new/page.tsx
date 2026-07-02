"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewGroupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), image_url: imageUrl.trim() || null }),
      });
      const data = await res.json();
      if (!data.ok) {
        setStatus("error");
        setError(data.error ?? "No se pudo crear el grupo.");
        return;
      }
      router.push(`/groups/${data.group.id}`);
    } catch (err: any) {
      setStatus("error");
      setError(err.message ?? "No se pudo conectar con el servidor.");
    }
  }

  return (
    <main className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-md mx-auto">
        <Link
          href="/groups"
          className="inline-flex items-center gap-1.5 text-parchment-dim text-sm hover:text-crema transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Volver a mis grupos
        </Link>
        <h1 className="font-display text-3xl text-cream mb-8">Crear grupo</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="field-label">Nombre del grupo</label>
            <input
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Ej: Oficina, Amigos del café..."
            />
          </div>
          <div>
            <label className="field-label">Foto del grupo (opcional, pegá un link)</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input-field"
              placeholder="https://..."
            />
          </div>
          {status === "error" && <p className="text-cascara-light text-sm">{error}</p>}
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full py-3.5 bg-cascara hover:bg-cascara-light disabled:opacity-60 text-cream font-body text-sm rounded-sm transition-colors"
          >
            {status === "sending" ? "Creando..." : "Crear grupo"}
          </button>
        </form>
      </div>
    </main>
  );
}
