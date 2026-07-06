import Link from "next/link";
import { PlusCircle, ListFilter, Star, Coffee, History, Award, Milk, MapPin } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import type { CoffeeReview } from "@/lib/db";
import ReviewCard from "../components/ReviewCard";
import ActivityHeatmap from "../components/ActivityHeatmap";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/");
  }

  let reviews: CoffeeReview[] = [];
  let dailyCounts: { date: string; count: number }[] = [];
  let error: string | null = null;

  try {
    reviews = (await sql`
      select r.*, c.brand, c.line, c.origin, c.farm, c.variety, c.process, c.tasting_notes,
             bl.logo_url as brand_logo_url
      from coffee_reviews r
      join coffees c on c.id = r.coffee_id
      left join brand_logos bl on bl.brand = c.brand
      where r.user_email = ${session.user.email}
      order by r.created_at desc
    `) as unknown as CoffeeReview[];

    const rows = (await sql`
      select to_char(created_at, 'YYYY-MM-DD') as date, count(*)::int as count
      from coffee_reviews
      where user_email = ${session.user.email}
        and created_at >= now() - interval '371 days'
      group by date
    `) as unknown as { date: string; count: number }[];
    dailyCounts = rows;
  } catch (err: any) {
    console.error("Error al cargar el perfil:", err);
    error = "Hubo un problema al conectar con la base de datos. Probá de nuevo en un momento.";
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length).toFixed(1)
      : null;

  // Café favorito: el de mejor promedio entre los que probó, desempatando por cantidad de veces catado
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

  // Leche: qué porcentaje de tus reviews la llevaron, y qué tipo usás más
  const withMilk = reviews.filter((r) => r.has_milk);
  const milkPercent =
    reviews.length > 0 ? Math.round((withMilk.length / reviews.length) * 100) : 0;
  const milkTypeCounts = new Map<string, number>();
  for (const r of withMilk) {
    if (!r.milk_type) continue;
    milkTypeCounts.set(r.milk_type, (milkTypeCounts.get(r.milk_type) ?? 0) + 1);
  }
  const topMilkType = [...milkTypeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

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
          <div className="flex items-center gap-4 mb-6">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name ?? "Tu perfil"}
                className="w-16 h-16 rounded-full object-cover border-2 border-parchment-dim/25"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-cascara/25 flex items-center justify-center font-display text-2xl text-cream">
                {session.user.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <div>
              <h1 className="font-display text-2xl text-cream leading-tight">
                {session.user.name}
              </h1>
              <p className="font-mono text-xs text-parchment-dim mt-0.5">{session.user.email}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-cascara hover:bg-cascara-light text-cream font-body text-sm rounded-sm transition-colors"
            >
              <PlusCircle size={16} />
              Nueva review
            </Link>
            <Link
              href="/feed"
              className="flex items-center gap-1.5 px-4 py-2.5 border border-parchment-dim/25 hover:border-crema text-parchment font-body text-sm rounded-sm transition-colors"
            >
              <ListFilter size={16} />
              Ver feed
            </Link>
          </div>
        </header>

        {error && <p className="text-cascara-light text-sm mb-8">{error}</p>}

        {!error && reviews.length === 0 && (
          <p className="font-body text-parchment-dim">
            Todavía no cargaste ninguna review. Andá a{" "}
            <Link href="/" className="underline underline-offset-4">
              catar tu primer café
            </Link>
            .
          </p>
        )}

        {!error && reviews.length > 0 && (
          <>
            {/* Insights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
              <div className="bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4">
                <Coffee size={14} className="text-parchment-dim mb-2" />
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
                <p className="font-mono text-[10px] text-parchment-dim uppercase mt-1.5">
                  Con leche{topMilkType ? ` · ${topMilkType}` : ""}
                </p>
              </div>
            </div>

            {/* Calendario de actividad */}
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

            <h2 className="font-display text-lg text-cream mb-4">Todas tus reviews</h2>
            <div className="space-y-10">
              {reviews.map((r) => (
                <div key={r.id}>
                  <p className="font-mono text-[11px] text-parchment-dim mb-2">
                    {r.created_at ? new Date(r.created_at).toLocaleString("es-AR") : ""}
                  </p>
                  <ReviewCard review={r} showTaster={false} editable />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
