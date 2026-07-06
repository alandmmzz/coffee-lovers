"use client";

import { useState } from "react";
import type { ReactionDetail } from "@/app/components/ReactionSheet";

export function useReactionState(
  endpoint: string,
  initialReactions: ReactionDetail[],
  initialMyReaction: string | null
) {
  const [reactions, setReactions] = useState<ReactionDetail[]>(initialReactions);
  const [myReaction, setMyReaction] = useState<string | null>(initialMyReaction);
  const [sending, setSending] = useState(false);

  async function react(emoji: string) {
    if (sending) return;
    setSending(true);
    try {
      const res = await fetch(endpoint, {
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

  return { reactions, myReaction, react, sending };
}
