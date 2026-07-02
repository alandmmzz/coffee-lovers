import { Trophy, Users, Medal } from "lucide-react";
import sql from "@/lib/db";
import ActivityTabs from "../../components/ActivityTabs";
import StarRating from "../../components/StarRating";

export const dynamic = "force-dynamic";

type TopRated = {
  id: string;
  brand: string;
  line: string;
  avg_rating: number;
  review_count: number;
};

type MostPopular = {
  id: string;
  brand: string;
  line: string;
  taster_count: number;
  avg_rating: number;
};

type TopTaster = {
  user_email: string;
  name: string | null;
  image: string | null;
  review_count: number;
  avg_given: number;
};

export default async function InsightsPage() {
  let topRated: TopRated[] = [];
  let mostPopular: MostPopular[] = [];
  let topTasters: TopTaster[] = [];
  let error: string | null = null;

  try {
    topRated = (await sql`
      select c.id, c.brand, c.line,
             round(avg(r.overall_rating)::numeric, 1) as avg_rating,
             count(r.id)::int as review_count
      from coffee_reviews r
      join coffees c on c.id = r.coffee_id
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
      where user_email is not null
      group by user_email
      order by review_count desc
      limit 10
    `) as unknown as TopTaster[];
  } catch (err: any) {
    console.error("Error al cargar insights:", err);
    error = "Hubo un problema al conectar con la base de datos. Probá de nuevo en un momento.";
  }

  return (
    <main className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-2xl mx-auto">
        <header className="mb-2">
          <p className="font-mono text-xs tracking-[0.2em] text-crema uppercase mb-3">
            Coffee Lovers · Actividad
          </p>
          <h1 className="font-display text-4xl text-cream leading-[1.05]">Insights</h1>
          <p className="font-body text-parchment-dim text-sm mt-3 max-w-md">
            Qué se viene tomando más, a quién le gusta lo mismo, y quién cata más seguido.
          </p>
        </header>

        <ActivityTabs />

        {error && <p className="text-cascara-light text-sm">{error}</p>}

        {!error && (
          <div className="space-y-12">
            {/* Café mejor valorado */}
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

            {/* Café más popular (más gente distinta que lo probó) */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Users size={16} className="text-crema" />
                <h2 className="font-display text-lg text-cream">Le gusta a varios</h2>
              </div>
              {mostPopular.length === 0 ? (
                <p className="font-body text-sm text-parchment-dim">
                  Todavía nadie coincidió en el mismo café. A medida que más gente cargue reviews, va a aparecer acá.
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

            {/* Ranking de catadores */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Medal size={16} className="text-crema" />
                <h2 className="font-display text-lg text-cream">Ranking de catadores</h2>
              </div>
              {topTasters.length === 0 ? (
                <p className="font-body text-sm text-parchment-dim">Todavía no hay reviews cargadas.</p>
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
          </div>
        )}
      </div>
    </main>
  );
}
