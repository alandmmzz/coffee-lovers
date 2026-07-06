import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { Star, Coffee as CoffeeIcon, History, Award, Milk, MapPin } from "lucide-react";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import type { CoffeeReview } from "@/lib/db";
import ReviewCard from "../../../../components/ReviewCard";
import ActivityHeatmap from "../../../../components/ActivityHeatmap";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

export const dynamic = "force-dynamic";

type TargetUser = { email: string; name: string | null; image: string | null };

export default async function MemberProfilePage({
  params,
}: {
  params: { groupId: string; email: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/");
  }

  const targetEmail = decodeURIComponent(params.email);

  const viewerMembership = await sql`
    select 1 from group_members where group_id = ${params.groupId} and user_email = ${session.user.email}
  `;
  if (viewerMembership.length === 0) {
    redirect("/feed");
  }

  const targetMembership = await sql`
    select 1 from group_members where group_id = ${params.groupId} and user_email = ${targetEmail}
  `;
  if (targetMembership.length === 0) {
    notFound();
  }

  const userRows = (await sql`
    select email, name, image from users where email = ${targetEmail}
  `) as unknown as TargetUser[];
  const targetUser = userRows[0];

  let reviews: CoffeeReview[] = [];
  let dailyCounts: { date: string; count: number }[] = [];
  let error: string | null = null;

  try {
    reviews = (await sql`
      select r.*, c.brand, c.line, c.origin, c.farm, c.variety, c.process, c.tasting_notes
      from coffee_reviews r
      join coffees c on c.id = r.coffee_id
      where r.user_email = ${targetEmail}
      order by r.created_at desc
    `) as unknown as CoffeeReview[];

    dailyCounts = (await sql`
      select to_char(created_at, 'YYYY-MM-DD') as date, count(*)::int as count
      from coffee_reviews
      where user_email = ${targetEmail}
        and created_at >= now() - interval '371 days'
      group by date
    `) as unknown as { date: string; count: number }[];
  } catch (err) {
    console.error("Error al cargar perfil del miembro:", err);
    error = "Hubo un problema al conectar con la base de datos. Probá de nuevo en un momento.";
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length).toFixed(1)
      : null;

  const byCoffee = new Map<string, { label: string; total: number; count: number }>();
  for (const r of reviews) {
    const key = `${r.brand} — ${r.line}`;
    const entry = byCoffee.get(key) ?? { label: key, total: 0, count: 0 };
    entry.total += r.overall_rating;
    entry.count += 1;
    byCoffee.set(key, entry);
  }
  const favorite = [...byCoffee.values()]
    .map((c) => ({ ...c, avg: c.total / c.count }))
    .sort((a, b) => b.avg - a.avg || b.count - a.count)[0];

  const lastReview = reviews[0];

  const withMilk = reviews.filter((r) => r.has_milk);
  const milkPercent = reviews.length > 0 ? Math.round((withMilk.length / reviews.length) * 100) : 0;

  const placesMap = new Map<string, { name: string; count: number }>();
  for (const r of reviews) {
    if (r.consumption_type !== "lugar" || !r.place_name) continue;
    const key = r.place_name.trim().toLowerCase();
    const entry = placesMap.get(key) ?? { name: r.place_name.trim(), count: 0 };
    entry.count += 1;
    placesMap.set(key, entry);
  }
  const places = [...placesMap.values()].sort((a, b) => b.count - a.count);

  return (
    <main className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-4">
            {targetUser?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={targetUser.image}
                alt={targetUser.name ?? targetEmail}
                className="w-16 h-16 rounded-full object-cover border-2 border-parchment-dim/25"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-cascara/25 flex items-center justify-center font-display text-2xl text-cream">
                {(targetUser?.name ?? targetEmail)[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="font-display text-2xl text-cream leading-tight">
                {targetUser?.name ?? targetEmail}
              </h1>
              <p className="font-mono text-xs text-parchment-dim mt-0.5">{targetEmail}</p>
            </div>
          </div>
        </header>

        {error && <p className="text-cascara-light text-sm mb-8">{error}</p>}

        {!error && reviews.length === 0 && (
          <p className="font-body text-parchment-dim">Todavía no cató nada.</p>
        )}

        {!error && reviews.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
              <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
                <CoffeeIcon size={14} className="text-parchment-dim mb-2" />
                <p className="font-mono text-xl text-crema leading-none">{reviews.length}</p>
                <p className="font-mono text-[10px] text-parchment-dim uppercase mt-1.5">
                  Café{reviews.length === 1 ? "" : "s"} catado{reviews.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
                <Star size={14} className="text-parchment-dim mb-2" />
                <p className="font-mono text-xl text-crema leading-none">{avgRating}</p>
                <p className="font-mono text-[10px] text-parchment-dim uppercase mt-1.5">
                  Puntaje promedio
                </p>
              </div>

              {favorite && (
                <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
                  <Award size={14} className="text-parchment-dim mb-2" />
                  <p className="font-body text-sm text-cream leading-tight truncate">
                    {favorite.label}
                  </p>
                  <p className="font-mono text-[10px] text-parchment-dim uppercase mt-1.5">
                    Café favorito
                  </p>
                </div>
              )}

              {lastReview && (
                <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
                  <History size={14} className="text-parchment-dim mb-2" />
                  <p className="font-body text-sm text-cream leading-tight truncate">
                    {lastReview.brand} — {lastReview.line}
                  </p>
                  <p className="font-mono text-[10px] text-parchment-dim uppercase mt-1.5">
                    {lastReview.created_at ? formatRelativeTime(lastReview.created_at) : ""}
                  </p>
                </div>
              )}

              <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
                <Milk size={14} className="text-parchment-dim mb-2" />
                <p className="font-mono text-xl text-crema leading-none">{milkPercent}%</p>
                <p className="font-mono text-[10px] text-parchment-dim uppercase mt-1.5">Con leche</p>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="font-display text-lg text-cream mb-4">Actividad del último año</h2>
              <ActivityHeatmap counts={dailyCounts} />
            </div>

            {places.length > 0 && (
              <div className="mb-10">
                <h2 className="font-display text-lg text-cream mb-4">
                  Lugares visitados ({places.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {places.map((p) => (
                    <a
                      key={p.name}
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4 hover:border-crema transition-colors"
                    >
                      <MapPin size={16} className="text-crema shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-body text-sm text-cream truncate">{p.name}</p>
                        <p className="font-mono text-[10px] text-parchment-dim mt-1">
                          {p.count} café{p.count === 1 ? "" : "s"} ahí
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <h2 className="font-display text-lg text-cream mb-4">Todas sus reviews</h2>
            <ul className="space-y-4">
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} showTaster={false} />
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}
