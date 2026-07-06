"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Activity, BarChart3, ListChecks } from "lucide-react";

export default function GroupTabs({ groupId, groupName }: { groupId: string; groupName?: string }) {
  const pathname = usePathname();

  const tabs = [
    { href: `/groups/${groupId}/activity`, label: "Actividad", icon: Activity },
    { href: `/groups/${groupId}/insights`, label: "Insights", icon: BarChart3 },
    { href: `/groups/${groupId}/reviews`, label: "Reviews", icon: ListChecks },
  ];

  return (
    <div className="mb-10">
      <Link
        href={`/groups/${groupId}`}
        className="inline-flex items-center gap-1.5 text-parchment-dim text-sm hover:text-crema transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        {groupName ?? "Volver al grupo"}
      </Link>
      <div className="grid grid-cols-3 gap-3">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1.5 py-4 rounded-sm border transition-colors ${
                active
                  ? "border-crema bg-crema/10"
                  : "border-parchment-dim/15 bg-parchment/[0.04] hover:border-parchment-dim/40"
              }`}
            >
              <Icon size={18} className={active ? "text-crema" : "text-crema/70"} />
              <span className={`font-mono text-xs ${active ? "text-crema" : "text-parchment"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
