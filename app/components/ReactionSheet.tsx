"use client";

import { Pencil, Trash2 } from "lucide-react";

const REACTION_EMOJIS = ["👍🏻", "👎🏻", "😂", "👀", "👄"];

export type ReactionDetail = { emoji: string; count: number; names: string[] };

export default function ReactionSheet({
  open,
  onClose,
  reactions,
  myReaction,
  onReact,
  isOwn,
  onEdit,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  reactions: ReactionDetail[];
  myReaction: string | null;
  onReact: (emoji: string) => void;
  isOwn: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center"
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="pop-in-sheet relative w-full sm:max-w-sm bg-ink-soft border-t sm:border border-parchment-dim/20 rounded-t-2xl sm:rounded-lg p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        {/* Emojis grandes */}
        <div className="flex items-center justify-between px-1 pb-4 mb-2 border-b border-parchment-dim/15">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onReact(emoji);
                onClose();
              }}
              aria-label={`Reaccionar con ${emoji}`}
              className={`text-3xl leading-none p-1.5 rounded-full transition-transform active:scale-90 ${
                myReaction === emoji ? "bg-crema/15 scale-110" : ""
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Quién reaccionó con qué */}
        {reactions.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {reactions.map((r) => (
              <div key={r.emoji} className="flex items-center gap-2 px-1 py-1">
                <span className="text-lg leading-none">{r.emoji}</span>
                <span className="font-body text-sm text-parchment truncate">
                  {r.names.join(", ")}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Acciones */}
        {isOwn && (onEdit || onDelete) && (
          <div className="border-t border-parchment-dim/15 pt-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onEdit();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-2 py-3 text-left text-parchment hover:bg-parchment/5 rounded-sm transition-colors"
              >
                <Pencil size={16} />
                Editar
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-2 py-3 text-left text-cascara-light hover:bg-parchment/5 rounded-sm transition-colors"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
