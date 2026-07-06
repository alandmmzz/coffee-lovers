"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Trash2, Send } from "lucide-react";
import type { ReviewComment } from "@/lib/db";

export default function ReviewComments({
  reviewId,
  initialComments,
  open,
  onCommentsChange,
}: {
  reviewId: string;
  initialComments: ReviewComment[];
  open: boolean;
  onCommentsChange: (comments: ReviewComment[]) => void;
}) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<ReviewComment[]>(initialComments);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  function update(next: ReviewComment[]) {
    setComments(next);
    onCommentsChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/reviews/${reviewId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "No se pudo comentar.");
        return;
      }
      update([...comments, data.comment]);
      setText("");
    } catch (err: any) {
      setError(err.message ?? "No se pudo conectar con el servidor.");
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(commentId: string) {
    update(comments.filter((c) => c.id !== commentId));
    try {
      await fetch(`/api/reviews/${reviewId}/comments/${commentId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Error al borrar comentario:", err);
    }
  }

  if (!open) return null;

  return (
    <div className="mt-3 space-y-3">
      {comments.map((c) => (
        <div key={c.id} className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-full overflow-hidden bg-cascara/20 flex items-center justify-center shrink-0 mt-0.5">
            {c.user_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.user_image} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-mono text-[9px] text-cream">
                {(c.user_name ?? c.user_email)[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0 bg-parchment/[0.05] rounded-sm px-3 py-2">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-[11px] text-parchment">
                {c.user_name ?? c.user_email}
              </span>
              {session?.user?.email === c.user_email && (
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  aria-label="Borrar comentario"
                  className="text-parchment-dim/50 hover:text-cascara-light transition-colors"
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>
            <p className="font-body text-sm text-parchment mt-0.5 break-words">{c.body}</p>
          </div>
        </div>
      ))}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          placeholder="Escribí un comentario..."
          className="input-field h-9 !py-0 flex-1 text-sm"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          aria-label="Enviar comentario"
          className="h-9 w-9 flex items-center justify-center shrink-0 bg-cascara hover:bg-cascara-light disabled:opacity-50 text-cream rounded-sm transition-colors"
        >
          <Send size={14} />
        </button>
      </form>
      {error && <p className="font-mono text-[11px] text-cascara-light">{error}</p>}
    </div>
  );
}
