import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { Users } from "lucide-react";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import type { Group } from "@/lib/db";
import JoinGroupButton from "../../../components/JoinGroupButton";

export const dynamic = "force-dynamic";

export default async function JoinGroupPage({ params }: { params: { code: string } }) {
  const session = await getServerSession(authOptions);

  const groups = (await sql`
    select * from groups where invite_code = ${params.code}
  `) as unknown as Group[];
  const group = groups[0];
  if (!group) {
    notFound();
  }

  if (session?.user?.email) {
    const membership = await sql`
      select 1 from group_members where group_id = ${group.id} and user_email = ${session.user.email}
    `;
    if (membership.length > 0) {
      redirect(`/groups/${group.id}`);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-cascara/20 flex items-center justify-center mx-auto mb-4">
          {group.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={group.image_url} alt={group.name} className="w-full h-full object-cover" />
          ) : (
            <Users size={22} className="text-cream" />
          )}
        </div>
        <p className="font-mono text-xs tracking-[0.2em] text-crema uppercase mb-3">
          Te invitaron a
        </p>
        <h1 className="font-display text-3xl text-cream mb-8">{group.name}</h1>
        <JoinGroupButton inviteCode={group.invite_code} loggedIn={!!session?.user?.email} />
      </div>
    </main>
  );
}
