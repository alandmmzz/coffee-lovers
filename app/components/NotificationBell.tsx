"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bell } from "lucide-react";

export default function NotificationBell() {
  const { status } = useSession();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/notifications/unread-count")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setCount(data.count);
      })
      .catch(() => {});
  }, [status]);

  if (status !== "authenticated") return null;

  return (
    <Link href="/notifications" className="relative p-1.5 text-parchment hover:text-crema transition-colors">
      <Bell size={18} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-cascara text-cream font-mono text-[9px] leading-none">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
