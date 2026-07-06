import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { Activity, BarChart3 } from "lucide-react";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import type { Group } from "@/lib/db";
import GroupHeader from "../../components/GroupHeader";

export const dynamic = "force-dynamic";

type Member = {
  user_email: string;
  name: string | null;
  image: string | null;
  joined_at: string;
};

export default async function GroupPage({ params }: { params: { groupId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/");
  }

  const membership = await sql`
    select 1 from group_members where group_id = ${params.groupId} and user_email = ${session.user.email}
  `;
  if (membership.length === 0) {
    redirect("/feed");
  }

  const groups = (await sql`select * from groups where id = ${params.groupId}`) as unknown as Group[];
  const group = groups[0];
  if (!group) {
    notFound();
  }

  let members: Member[] = [];
  try {
    members = (await sql`
      select gm.user_email, u.name, u.image, gm.joined_at
      from group_members gm
      left join users u on u.email = gm.user_email
      where gm.group_id = ${params.groupId}
      order by gm.joined_at asc
    `) as unknown as Member[];
  } catch (err) {
    console.error("Error al cargar miembros del grupo:", err);
  }

  return (
    <main className="min-h-screen px-4 pt-4 pb-12 sm:py-16">
      <div className="max-w-xl mx-auto">
        <GroupHeader group={group} />

        <div className="grid grid-cols-2 gap-3 my-8">
          <Link
            href={`/groups/${group.id}/activity`}
            className="flex flex-col items-center gap-1.5 py-4 bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm hover:border-crema transition-colors"
          >
            <Activity size={18} className="text-crema" />
            <span className="font-mono text-xs text-parchment">Actividad</span>
          </Link>
          <Link
            href={`/groups/${group.id}/insights`}
            className="flex flex-col items-center gap-1.5 py-4 bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm hover:border-crema transition-colors"
          >
            <BarChart3 size={18} className="text-crema" />
            <span className="font-mono text-xs text-parchment">Insights</span>
          </Link>
        </div>

        <h2 className="font-display text-lg text-cream mb-4">Miembros ({members.length})</h2>
        <ul className="divide-y divide-parchment-dim/10 border-t border-b border-parchment-dim/10">
          {members.map((m) => (
            <li key={m.user_email}>
              <Link
                href={`/groups/${group.id}/members/${encodeURIComponent(m.user_email)}`}
                className="flex items-center gap-3 py-3 px-2 -mx-2 rounded-sm hover:bg-parchment/[0.04] transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-cascara/20 flex items-center justify-center shrink-0">
                  {m.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.image}
                      alt={m.name ?? m.user_email}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-mono text-[10px] text-cream">
                      {(m.name ?? m.user_email)[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="font-body text-sm text-cream truncate">
                  {m.name ?? m.user_email}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
