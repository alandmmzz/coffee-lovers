"use client";

import { useState, useRef, type ReactNode } from "react";

const REACTION_EMOJIS = ["👍🏻", "👎🏻", "😂", "👀", "👄"];

type ReactionCount = { emoji: string; count: number };

export default function ReviewReactions({
  reviewId,
  initialReactions,
  initialMyReaction,
  children,
}: {
  reviewId: string;
  initialReactions: ReactionCount[];
  initialMyReaction: string | null;
  children: ReactNode;
}) {
  const [reactions, setReactions] = useState<ReactionCount[]>(initialReactions);
  const [myReaction, setMyReaction] = useState<string | null>(initialMyReaction);
  const [showPicker, setShowPicker] = useState(false);
  const [sending, setSending] = useState(false);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function react(emoji: string) {
    if (sending) return;
    setSending(true);
    setShowPicker(false);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
      const data = await res.json();
      if (data.ok) {
        setReactions(data.reactions);
        setMyReaction(data.myReaction);
      }
    } finally {
      setSending(false);
    }
  }

  function handleMouseEnter() {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setShowPicker(true);
  }
  function handleMouseLeave() {
    // Pequeño margen antes de ocultar: si el mouse pasa por el huequito
    // entre la tarjeta y el picker (movimiento diagonal, etc.), no se cierra.
    hideTimerRef.current = setTimeout(() => setShowPicker(false), 250);
  }

  function startPress() {
    pressTimerRef.current = setTimeout(() => setShowPicker(true), 450);
  }
  function cancelPress() {
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
  }

  return (
    <div
      className="relative bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-5"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
    >
      {children}

      {reactions.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-3 border-t border-parchment-dim/15">
          {reactions.map((r) => (
            <button
              key={r.emoji}
              type="button"
              onClick={() => react(r.emoji)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs transition-colors ${
                myReaction === r.emoji
                  ? "border-crema bg-crema/10"
                  : "border-parchment-dim/20 hover:border-parchment-dim/40"
              }`}
            >
              <span>{r.emoji}</span>
              {r.count > 1 && (
                <span className="font-mono text-[10px] text-parchment-dim">{r.count}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {showPicker && (
        <div
          className="absolute bottom-full left-5 flex gap-1 bg-ink-soft border border-parchment-dim/25 rounded-full px-2.5 py-1.5 shadow-xl z-20"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => react(emoji)}
              aria-label={`Reaccionar con ${emoji}`}
              className="text-lg hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
