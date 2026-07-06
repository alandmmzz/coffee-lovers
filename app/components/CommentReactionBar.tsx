"use client";

import { useState, useRef, useEffect } from "react";
import { SmilePlus } from "lucide-react";

const REACTION_EMOJIS = ["👍🏻", "👎🏻", "😂", "👀", "👄"];

type ReactionCount = { emoji: string; count: number };

export default function CommentReactionBar({
  commentId,
  initialReactions,
  initialMyReaction,
}: {
  commentId: string;
  initialReactions: ReactionCount[];
  initialMyReaction: string | null;
}) {
  const [reactions, setReactions] = useState<ReactionCount[]>(initialReactions);
  const [myReaction, setMyReaction] = useState<string | null>(initialMyReaction);
  const [showPicker, setShowPicker] = useState(false);
  const [sending, setSending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPicker) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPicker]);

  async function react(emoji: string) {
    if (sending) return;
    setSending(true);
    setShowPicker(false);
    try {
      const res = await fetch(`/api/comments/${commentId}/reactions`, {
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

  return (
    <div ref={containerRef} className="relative flex items-center gap-1 shrink-0">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          type="button"
          onClick={() => react(r.emoji)}
          className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border text-[10px] transition-colors ${
            myReaction === r.emoji
              ? "border-crema bg-crema/10"
              : "border-parchment-dim/20 hover:border-parchment-dim/40"
          }`}
        >
          <span>{r.emoji}</span>
          {r.count > 1 && <span className="font-mono text-parchment-dim">{r.count}</span>}
        </button>
      ))}

      <button
        type="button"
        onClick={() => setShowPicker((s) => !s)}
        aria-label="Reaccionar"
        className="text-parchment-dim/50 hover:text-crema transition-colors"
      >
        <SmilePlus size={13} />
      </button>

      {showPicker && (
        <div className="pop-in absolute top-0 right-0 -translate-y-full flex gap-1 bg-ink-soft border border-parchment-dim/25 rounded-full px-2 py-1 shadow-2xl z-20">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => react(emoji)}
              aria-label={`Reaccionar con ${emoji}`}
              className="text-sm hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
