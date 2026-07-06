"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { PlusCircle, Calculator, Rss, Bell } from "lucide-react";
import UserMenu from "./UserMenu";

const ITEMS = [
  { href: "/", label: "Review", icon: PlusCircle },
  { href: "/brew", label: "Preparar", icon: Calculator },
  { href: "/feed", label: "Feed", icon: Rss },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { status } = useSession();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/notifications/unread-count")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setUnread(data.count);
      })
      .catch(() => {});
  }, [status]);

  if (status !== "authenticated") return null;

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-ink/95 backdrop-blur border-t border-parchment-dim/15 flex items-stretch">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 ${
              active ? "text-crema" : "text-parchment-dim"
            }`}
          >
            <Icon size={19} />
            <span className="font-mono text-[10px]">{item.label}</span>
          </Link>
        );
      })}

      <Link
        href="/notifications"
        className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 ${
          pathname === "/notifications" ? "text-crema" : "text-parchment-dim"
        }`}
      >
        <span className="relative">
          <Bell size={19} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 px-1 flex items-center justify-center rounded-full bg-cascara text-cream font-mono text-[8px] leading-none">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </span>
        <span className="font-mono text-[10px]">Avisos</span>
      </Link>

      <div className="flex-1 flex flex-col items-center justify-center">
        <UserMenu direction="up" showLabel />
      </div>
    </nav>
  );
}
