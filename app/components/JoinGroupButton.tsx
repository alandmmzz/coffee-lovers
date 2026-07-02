"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function JoinGroupButton({
  inviteCode,
  loggedIn,
}: {
  inviteCode: string;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!loggedIn) {
    return (
      <div className="space-y-3">
        <p className="font-body text-sm text-parchment-dim mb-4">Iniciá sesión para unirte.</p>
        <button
          onClick={() => signIn("github", { callbackUrl: `/groups/join/${inviteCode}` })}
          className="w-full py-3 bg-parchment/[0.06] border border-parchment-dim/25 hover:border-crema text-cream font-body text-sm rounded-sm transition-colors"
        >
          Continuar con GitHub
        </button>
        <button
          onClick={() => signIn("google", { callbackUrl: `/groups/join/${inviteCode}` })}
          className="w-full py-3 bg-parchment/[0.06] border border-parchment-dim/25 hover:border-crema text-cream font-body text-sm rounded-sm transition-colors"
        >
          Continuar con Google
        </button>
      </div>
    );
  }

  async function handleJoin() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/groups/join/${inviteCode}`, { method: "POST" });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "No se pudo unir al grupo.");
        setLoading(false);
        return;
      }
      router.push(`/groups/${data.groupId}`);
    } catch (err: any) {
      setError(err.message ?? "No se pudo conectar con el servidor.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleJoin}
        disabled={loading}
        className="px-6 py-3 bg-cascara hover:bg-cascara-light disabled:opacity-60 text-cream font-body text-sm rounded-sm transition-colors"
      >
        {loading ? "Uniéndote..." : "Unirme al grupo"}
      </button>
      {error && <p className="text-cascara-light text-sm mt-3">{error}</p>}
    </div>
  );
}
