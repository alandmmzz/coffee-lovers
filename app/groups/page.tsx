import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import type { Group } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/");
  }

  let groups: Group[] = [];
  let error: string | null = null;

  try {
    groups = (await sql`
      select g.* from groups g
      join group_members m on m.group_id = g.id
      where m.user_email = ${session.user.email}
      order by g.name asc
    `) as unknown as Group[];
  } catch (err) {
    console.error("Error al cargar grupos:", err);
    error = "Hubo un problema al conectar con la base de datos. Probá de nuevo en un momento.";
  }

  return (
    <main className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-xl mx-auto">
        <header className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-crema uppercase mb-3">
              Coffee Lovers
            </p>
            <h1 className="font-display text-4xl text-cream leading-[1.05]">Tus grupos</h1>
            <p className="font-body text-parchment-dim text-sm mt-3 max-w-sm">
              Cada grupo tiene su propia actividad e insights, solo visibles para sus miembros.
            </p>
          </div>
          <Link
            href="/groups/new"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-cascara hover:bg-cascara-light text-cream font-body text-sm rounded-sm transition-colors shrink-0"
          >
            <Plus size={16} />
            Crear
          </Link>
        </header>

        {error && <p className="text-cascara-light text-sm">{error}</p>}

        {!error && groups.length === 0 && (
          <p className="font-body text-parchment-dim">
            Todavía no sos parte de ningún grupo. Creá uno, o pedile el link de invitación a
            alguien que ya tenga uno.
          </p>
        )}

        <ul className="space-y-3">
          {groups.map((g) => (
            <li key={g.id}>
              <Link
                href={`/groups/${g.id}`}
                className="flex items-center gap-3 bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4 hover:border-crema transition-colors"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-cascara/20 flex items-center justify-center shrink-0">
                  {g.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={g.image_url} alt={g.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users size={16} className="text-cream" />
                  )}
                </div>
                <span className="font-body text-sm text-cream">{g.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
