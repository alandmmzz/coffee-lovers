import Link from "next/link";
import sql from "@/lib/db";
import type { CoffeeReview } from "@/lib/db";
import ReviewCard from "../components/ReviewCard";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  let reviews: CoffeeReview[] = [];
  let error: string | null = null;

  try {
    reviews = (await sql`
      select * from coffee_reviews order by created_at desc
    `) as unknown as CoffeeReview[];
  } catch (err: any) {
    error = err.message ?? "No se pudieron cargar las reviews.";
  }

  return (
    <main className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-crema uppercase mb-3">
              Coffee Lovers · Archivo
            </p>
            <h1 className="font-display text-4xl text-cream leading-[1.05]">
              Cafés catados
            </h1>
          </div>
          <Link
            href="/"
            className="shrink-0 px-4 py-2.5 bg-cascara hover:bg-cascara-light text-cream font-body text-sm rounded-sm transition-colors"
          >
            + Nueva review
          </Link>
        </header>

        {error && (
          <p className="text-cascara-light text-sm">
            No se pudieron cargar las reviews. {error}
          </p>
        )}

        {!error && reviews.length === 0 && (
          <p className="font-body text-parchment-dim">
            Todavía no hay ninguna ficha cargada. Sé el primero en catar un café.
          </p>
        )}

        <ul className="space-y-4">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </ul>
      </div>
    </main>
  );
}
