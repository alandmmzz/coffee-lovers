"use client";

import { useState, useRef, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useReactionState } from "@/lib/useReactionState";
import ReactionSheet, { type ReactionDetail } from "./ReactionSheet";

const REACTION_EMOJIS = ["👍🏻", "👎🏻", "😂", "👀", "👄"];

export default function ReviewReactions({
  reviewId,
  reviewUserEmail,
  initialReactions,
  initialMyReaction,
  commentCount,
  onToggleComments,
  children,
}: {
  reviewId: string;
  reviewUserEmail?: string | null;
  initialReactions: ReactionDetail[];
  initialMyReaction: string | null;
  commentCount: number;
  onToggleComments: () => void;
  children: ReactNode;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const { reactions, myReaction, react } = useReactionState(
    `/api/reviews/${reviewId}/reactions`,
    initialReactions,
    initialMyReaction
  );
  const [showPicker, setShowPicker] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    pressTimerRef.current = setTimeout(() => {
      if (!movedRef.current) setShowSheet(true);
    }, 450);
  }
  function cancelPress() {
    movedRef.current = true;
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
  }

  const isOwn = !!session?.user?.email && session.user.email === reviewUserEmail;

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

      <div className="flex items-center justify-between gap-2 flex-wrap mt-3 pt-3 border-t border-parchment-dim/15">
        <button
          type="button"
          onClick={onToggleComments}
          className="flex items-center gap-1.5 font-mono text-xs text-parchment-dim hover:text-crema transition-colors"
        >
          <MessageCircle size={13} />
          Comentar
        </button>

        <div className="flex items-center gap-1.5 flex-wrap">
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
      </div>

      {/* Desktop: picker chico al hacer hover */}
      {showPicker && (
        <div
          className="pop-in absolute bottom-full right-5 mb-2 hidden sm:flex gap-1 bg-ink-soft border border-parchment-dim/25 rounded-full px-2.5 py-1.5 shadow-2xl z-20"
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

      {/* Mobile: modal grande al mantener pulsado */}
      <ReactionSheet
        open={showSheet}
        onClose={() => setShowSheet(false)}
        reactions={reactions}
        myReaction={myReaction}
        onReact={react}
        isOwn={isOwn}
        onEdit={isOwn ? () => router.push(`/reviews/${reviewId}/edit`) : undefined}
      />
    </div>
  );
}
