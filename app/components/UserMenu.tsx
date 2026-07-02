"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { ListChecks, LogOut } from "lucide-react";
import NotificationToggle from "./NotificationToggle";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return <div className="w-9 h-9 rounded-full bg-parchment/10 animate-pulse" />;
  }

  const initial = session?.user?.name?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Menú de usuario"
        aria-expanded={open}
        className="w-9 h-9 rounded-full overflow-hidden border-2 border-parchment-dim/30 hover:border-crema transition-colors flex items-center justify-center bg-cascara/25 shrink-0"
      >
        {session?.user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt={session.user.name ?? "Tu perfil"}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-mono text-xs text-cream">{initial}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-ink-soft border border-parchment-dim/20 rounded-sm shadow-xl py-2 z-50">
          {session ? (
            <>
              <div className="px-4 py-2.5 border-b border-parchment-dim/15">
                <p className="font-body text-sm text-cream truncate">{session.user?.name}</p>
                <p className="font-mono text-[11px] text-parchment-dim truncate mt-0.5">
                  {session.user?.email}
                </p>
              </div>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-parchment hover:bg-parchment/5 transition-colors"
              >
                <ListChecks size={14} />
                Mis reviews
              </Link>
              <NotificationToggle />
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-cascara-light hover:bg-parchment/5 transition-colors"
              >
                <LogOut size={14} />
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <p className="px-4 py-2 font-mono text-[11px] text-parchment-dim uppercase tracking-wide">
                Iniciar sesión
              </p>
              <button
                onClick={() => signIn("github")}
                className="w-full text-left px-4 py-2.5 text-sm text-parchment hover:bg-parchment/5 transition-colors"
              >
                Con GitHub
              </button>
              <button
                onClick={() => signIn("google")}
                className="w-full text-left px-4 py-2.5 text-sm text-parchment hover:bg-parchment/5 transition-colors"
              >
                Con Google
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
