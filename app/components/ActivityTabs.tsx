"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ActivityTabs() {
  const pathname = usePathname();

  const tabs = [
    { href: "/activity", label: "Actividad" },
    { href: "/activity/insights", label: "Insights" },
  ];

  return (
    <div className="flex gap-1 border-b border-parchment-dim/15 mb-10">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2.5 text-sm font-body border-b-2 -mb-px transition-colors ${
              active
                ? "border-crema text-cream"
                : "border-transparent text-parchment-dim hover:text-parchment"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
