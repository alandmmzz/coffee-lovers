"use client";

import { useState, useRef, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { SmilePlus } from "lucide-react";
import { useReactionState } from "@/lib/useReactionState";
import ReactionSheet, { type ReactionDetail } from "./ReactionSheet";

const REACTION_EMOJIS = ["👍🏻", "👎🏻", "😂", "👀", "👄"];

export default function CommentReactionBar({
  commentId,
  commentUserEmail,
  initialReactions,
  initialMyReaction,
  onDelete,
  children,
}: {
  commentId: string;
  commentUserEmail: string;
  initialReactions: ReactionDetail[];
  initialMyReaction: string | null;
  onDelete?: () => void;
  children: ReactNode;
}) {
  const { data: session } = useSession();
  const { reactions, myReaction, react } = useReactionState(
    `/api/comments/${commentId}/reactions`,
    initialReactions,
    initialMyReaction
  );
  const [showPicker, setShowPicker] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [justSelected, setJustSelected] = useState(false);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressVisualTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const movedRef = useRef(false);

  function handleMouseEnter() {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setShowPicker(true);
  }
  function handleMouseLeave() {
    hideTimerRef.current = setTimeout(() => setShowPicker(false), 250);
  }

  function startPress() {
    movedRef.current = false;
    // Recien mostramos el squish si el toque dura mas que un roce de scroll
    pressVisualTimerRef.current = setTimeout(() => {
      if (!movedRef.current) setPressed(true);
    }, 150);
    pressTimerRef.current = setTimeout(() => {
      setPressed(false);
      if (!movedRef.current) {
        setShowSheet(true);
        setJustSelected(true);
        setTimeout(() => setJustSelected(false), 300);
      }
    }, 600);
  }
  function cancelPress() {
    movedRef.current = true;
    setPressed(false);
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    if (pressVisualTimerRef.current) clearTimeout(pressVisualTimerRef.current);
  }

  const isOwn = !!session?.user?.email && session.user.email === commentUserEmail;

  return (
    <div
      className={`relative no-callout transition-transform duration-150 ${
        pressed ? "scale-[0.97]" : ""
      } ${justSelected ? "press-bounce" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
    >
      {children}

      <div className="flex items-center gap-1 flex-wrap mt-1.5">
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

        {/* Mobile: abre el modal grande. En desktop el hover ya muestra el picker chico. */}
        <button
          type="button"
          onClick={() => setShowSheet(true)}
          aria-label="Reaccionar"
          className="sm:hidden flex items-center gap-1 font-mono text-[10px] text-parchment-dim/60 hover:text-crema transition-colors"
        >
          <SmilePlus size={12} />
          Reaccionar
        </button>
      </div>

      {/* Desktop: picker chico al hacer hover */}
      {showPicker && (
        <div
          className="pop-in absolute bottom-full left-0 mb-2 hidden sm:flex gap-1 bg-ink-soft border border-parchment-dim/25 rounded-full px-2.5 py-1.5 shadow-2xl z-20"
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

      <ReactionSheet
        open={showSheet}
        onClose={() => setShowSheet(false)}
        reactions={reactions}
        myReaction={myReaction}
        onReact={react}
        isOwn={isOwn}
        onDelete={isOwn ? onDelete : undefined}
      />
    </div>
  );
}
