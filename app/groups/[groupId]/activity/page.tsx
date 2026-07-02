import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ChevronRight, Coffee } from "lucide-react";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import type { CoffeeReview, Group } from "@/lib/db";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import StarRating from "../../../components/StarRating";
import GroupTabs from "../../../components/GroupTabs";

export const dynamic = "force-dynamic";

export default async function GroupActivityPage({ params }: { params: { groupId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/");
  }

  const membership = await sql`
    select 1 from group_members where group_id = ${params.groupId} and user_email = ${session.user.email}
  `;
  if (membership.length === 0) {
    redirect("/groups");
  }

  const groups = (await sql`select * from groups where id = ${params.groupId}`) as unknown as Group[];
  const group = groups[0];

  let reviews: CoffeeReview[] = [];
  let error: string | null = null;

  try {
    reviews = (await sql`
      select r.*, c.brand, c.line, c.origin, c.farm, c.variety, c.process, c.tasting_notes
      from coffee_reviews r
      join coffees c on c.id = r.coffee_id
      where r.group_id = ${params.groupId}
      order by r.created_at desc
      limit 100
    `) as unknown as CoffeeReview[];
  } catch (err) {
    console.error("Error al cargar la actividad:", err);
    error = "Hubo un problema al conectar con la base de datos. Probá de nuevo en un momento.";
  }

  return (
    <main className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-2xl mx-auto">
        <GroupTabs groupId={params.groupId} groupName={group?.name} />

        <header className="mb-8">
          <h1 className="font-display text-3xl text-cream leading-[1.05]">Últimas cataciones</h1>
          <p className="font-body text-parchment-dim text-sm mt-3 max-w-md">
            Tocá cualquier fila para ver el detalle completo.
          </p>
        </header>

        {error && <p className="text-cascara-light text-sm">{error}</p>}

        {!error && reviews.length === 0 && (
          <p className="font-body text-parchment-dim">Todavía no hay actividad en este grupo.</p>
        )}

        <ul className="divide-y divide-parchment-dim/10 border-t border-b border-parchment-dim/10">
          {reviews.map((r) => (
            <li key={r.id}>
              <Link
                href={`/groups/${params.groupId}/activity/${r.id}`}
                className="flex items-center gap-4 py-4 px-2 -mx-2 rounded-sm hover:bg-parchment/[0.04] transition-colors group"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden bg-cascara/20 flex items-center justify-center shrink-0">
                  {r.user_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.user_image}
                      alt={r.taster_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Coffee size={16} className="text-cream" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-cream truncate">
                    <span className="text-parchment-dim">{r.taster_name}</span> cató{" "}
                    <span className="font-medium">
                      {r.brand} — {r.line}
                    </span>
                  </p>
                  <p className="font-mono text-[11px] text-parchment-dim mt-1">
                    {r.created_at ? formatRelativeTime(r.created_at) : ""}
                  </p>
                </div>

                <StarRating rating={r.overall_rating} size={14} showNumber={false} />

                <ChevronRight
                  size={18}
                  className="text-parchment-dim/50 group-hover:text-crema transition-colors shrink-0"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
