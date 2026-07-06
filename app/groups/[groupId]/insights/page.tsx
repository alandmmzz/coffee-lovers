import { Trophy, Users, Medal, Milk } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import type { Group } from "@/lib/db";
import GroupTabs from "../../../components/GroupTabs";
import StarRating from "../../../components/StarRating";

export const dynamic = "force-dynamic";

type TopRated = { id: string; brand: string; line: string; avg_rating: number; review_count: number };
type MostPopular = { id: string; brand: string; line: string; taster_count: number; avg_rating: number };
type TopTaster = { user_email: string; name: string | null; image: string | null; review_count: number; avg_given: number };
type MilkStats = { total: number; with_milk: number; avg_with_milk: number | null; avg_without_milk: number | null };
type MilkType = { milk_type: string; count: number };

export default async function GroupInsightsPage({ params }: { params: { groupId: string } }) {
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

  let topRated: TopRated[] = [];
  let mostPopular: MostPopular[] = [];
  let topTasters: TopTaster[] = [];
  let milkStats: MilkStats | null = null;
  let milkTypes: MilkType[] = [];
  let error: string | null = null;

  try {
    topRated = (await sql`
      select c.id, c.brand, c.line,
             round(avg(r.overall_rating)::numeric, 1) as avg_rating,
             count(r.id)::int as review_count
      from coffee_reviews r
      join coffees c on c.id = r.coffee_id
      where r.user_email in (select user_email from group_members where group_id = ${params.groupId})
      group by c.id, c.brand, c.line
      order by avg_rating desc, review_count desc
      limit 5
    `) as unknown as TopRated[];

    mostPopular = (await sql`
      select c.id, c.brand, c.line,
             count(distinct r.user_email)::int as taster_count,
             round(avg(r.overall_rating)::numeric, 1) as avg_rating
      from coffee_reviews r
      join coffees c on c.id = r.coffee_id
      where r.user_email in (select user_email from group_members where group_id = ${params.groupId})
      group by c.id, c.brand, c.line
      having count(distinct r.user_email) > 1
      order by taster_count desc, avg_rating desc
      limit 5
    `) as unknown as MostPopular[];

    topTasters = (await sql`
      select
        user_email,
        min(user_name) as name,
        min(user_image) as image,
        count(*)::int as review_count,
        round(avg(overall_rating)::numeric, 1) as avg_given
      from coffee_reviews
      where user_email in (select user_email from group_members where group_id = ${params.groupId})
      group by user_email
      order by review_count desc
      limit 10
    `) as unknown as TopTaster[];

    const milkStatsRows = (await sql`
      select
        count(*)::int as total,
        count(*) filter (where has_milk)::int as with_milk,
        round(avg(overall_rating) filter (where has_milk)::numeric, 1) as avg_with_milk,
        round(avg(overall_rating) filter (where not has_milk)::numeric, 1) as avg_without_milk
      from coffee_reviews
      where user_email in (select user_email from group_members where group_id = ${params.groupId})
    `) as unknown as MilkStats[];
    milkStats = milkStatsRows[0] ?? null;

    milkTypes = (await sql`
      select milk_type, count(*)::int as count
      from coffee_reviews
      where user_email in (select user_email from group_members where group_id = ${params.groupId})
        and has_milk and milk_type is not null and milk_type <> ''
      group by milk_type
      order by count desc
      limit 5
    `) as unknown as MilkType[];
  } catch (err: any) {
    console.error("Error al cargar insights:", err);
    error = "Hubo un problema al conectar con la base de datos. Probá de nuevo en un momento.";
  }

  return (
    <main className="min-h-screen px-4 pt-4 pb-12 sm:py-16">
      <div className="max-w-2xl mx-auto">
        <GroupTabs groupId={params.groupId} groupName={group?.name} />

        <header className="mb-8">
          <h1 className="font-display text-3xl text-cream leading-[1.05]">Insights</h1>
          <p className="font-body text-parchment-dim text-sm mt-3 max-w-md">
            Qué se viene tomando más en este grupo, a quién le gusta lo mismo, y quién cata más seguido.
          </p>
        </header>

        {error && <p className="text-cascara-light text-sm">{error}</p>}

        {!error && (
          <div className="space-y-12">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={16} className="text-crema" />
                <h2 className="font-display text-lg text-cream">Mejor valorado</h2>
              </div>
              {topRated.length === 0 ? (
                <p className="font-body text-sm text-parchment-dim">Todavía no hay suficientes datos.</p>
              ) : (
                <ul className="space-y-2">
                  {topRated.map((c, i) => (
                    <li
                      key={c.id}
                      className="flex items-center gap-4 bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm px-4 py-3"
                    >
                      <span className="font-mono text-xs text-parchment-dim w-4 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm text-cream truncate">
                          {c.brand} — {c.line}
                        </p>
                        <p className="font-mono text-[11px] text-parchment-dim mt-0.5">
                          {c.review_count} review{c.review_count === 1 ? "" : "s"}
                        </p>
                      </div>
                      <StarRating rating={c.avg_rating} size={14} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Users size={16} className="text-crema" />
                <h2 className="font-display text-lg text-cream">Le gusta a varios</h2>
              </div>
              {mostPopular.length === 0 ? (
                <p className="font-body text-sm text-parchment-dim">
                  Todavía nadie coincidió en el mismo café dentro de este grupo.
                </p>
              ) : (
                <ul className="space-y-2">
                  {mostPopular.map((c, i) => (
                    <li
                      key={c.id}
                      className="flex items-center gap-4 bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm px-4 py-3"
                    >
                      <span className="font-mono text-xs text-parchment-dim w-4 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm text-cream truncate">
                          {c.brand} — {c.line}
                        </p>
                        <p className="font-mono text-[11px] text-parchment-dim mt-0.5">
                          {c.taster_count} personas distintas lo cataron
                        </p>
                      </div>
                      <StarRating rating={c.avg_rating} size={14} showNumber={false} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Medal size={16} className="text-crema" />
                <h2 className="font-display text-lg text-cream">Ranking de catadores</h2>
              </div>
              {topTasters.length === 0 ? (
                <p className="font-body text-sm text-parchment-dim">Todavía no hay reviews en este grupo.</p>
              ) : (
                <ul className="divide-y divide-parchment-dim/10 border-t border-b border-parchment-dim/10">
                  {topTasters.map((t, i) => (
                    <li key={t.user_email} className="flex items-center gap-4 py-3">
                      <span className="font-mono text-xs text-parchment-dim w-4 shrink-0">{i + 1}</span>
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-cascara/20 flex items-center justify-center shrink-0">
                        {t.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={t.image} alt={t.name ?? t.user_email} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-mono text-[10px] text-cream">
                            {(t.name ?? t.user_email)[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm text-cream truncate">{t.name ?? t.user_email}</p>
                        <p className="font-mono text-[11px] text-parchment-dim mt-0.5">
                          promedio que da: {t.avg_given}/10
                        </p>
                      </div>
                      <span className="font-mono text-sm text-crema shrink-0">
                        {t.review_count} review{t.review_count === 1 ? "" : "s"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {milkStats && milkStats.total > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Milk size={16} className="text-crema" />
                  <h2 className="font-display text-lg text-cream">Con leche</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
                    <p className="font-mono text-xl text-crema leading-none">
                      {Math.round((milkStats.with_milk / milkStats.total) * 100)}%
                    </p>
                    <p className="font-mono text-[10px] text-parchment-dim uppercase mt-1.5">
                      De las reviews llevan leche
                    </p>
                  </div>
                  {milkStats.avg_with_milk != null && (
                    <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
                      <p className="font-mono text-xl text-crema leading-none">
                        {milkStats.avg_with_milk}
                      </p>
                      <p className="font-mono text-[10px] text-parchment-dim uppercase mt-1.5">
                        Promedio con leche
                      </p>
                    </div>
                  )}
                  {milkStats.avg_without_milk != null && (
                    <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
                      <p className="font-mono text-xl text-crema leading-none">
                        {milkStats.avg_without_milk}
                      </p>
                      <p className="font-mono text-[10px] text-parchment-dim uppercase mt-1.5">
                        Promedio sin leche
                      </p>
                    </div>
                  )}
                </div>
                {milkTypes.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {milkTypes.map((m) => (
                      <span
                        key={m.milk_type}
                        className="font-mono text-[11px] text-parchment-dim bg-parchment/[0.04] border border-parchment-dim/15 rounded-full px-3 py-1"
                      >
                        {m.milk_type} · {m.count}
                      </span>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
