"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function GroupTabs({ groupId, groupName }: { groupId: string; groupName?: string }) {
  const pathname = usePathname();

  const tabs = [
    { href: `/groups/${groupId}/activity`, label: "Actividad" },
    { href: `/groups/${groupId}/insights`, label: "Insights" },
    { href: `/groups/${groupId}/reviews`, label: "Reviews" },
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
      <div className="flex gap-1 border-b border-parchment-dim/15">
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
    </div>
  );
}
