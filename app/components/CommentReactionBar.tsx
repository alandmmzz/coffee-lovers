"use client";

import { useState, useRef, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { SmilePlus } from "lucide-react";
import { useReactionState } from "@/lib/useReactionState";
import ReactionSheet, { type ReactionDetail } from "./ReactionSheet";

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
  const [showSheet, setShowSheet] = useState(false);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const movedRef = useRef(false);

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

  const isOwn = !!session?.user?.email && session.user.email === commentUserEmail;

  return (
    <div onTouchStart={startPress} onTouchEnd={cancelPress} onTouchMove={cancelPress}>
      {children}

      {reactions.length > 0 && (
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
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowSheet(true)}
        aria-label="Reaccionar"
        className="mt-1 flex items-center gap-1 font-mono text-[10px] text-parchment-dim/60 hover:text-crema transition-colors"
      >
        <SmilePlus size={12} />
        Reaccionar
      </button>

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
