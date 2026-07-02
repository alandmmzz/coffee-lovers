import Link from "next/link";
import { PlusCircle, ListFilter } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import type { CoffeeReview } from "@/lib/db";
import ReviewCard from "../components/ReviewCard";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/");
  }

  let reviews: CoffeeReview[] = [];
  let error: string | null = null;

  try {
    reviews = (await sql`
      select r.*, c.brand, c.line, c.origin, c.process
      from coffee_reviews r
      join coffees c on c.id = r.coffee_id
      where r.user_email = ${session.user.email}
      order by r.created_at desc
    `) as unknown as CoffeeReview[];
  } catch (err: any) {
    error = err.message ?? "No se pudieron cargar tus reviews.";
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length).toFixed(1)
      : null;

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

          <div className="flex gap-6 mb-6">
            <div>
              <p className="font-mono text-2xl text-crema leading-none">{reviews.length}</p>
              <p className="font-mono text-[11px] text-parchment-dim uppercase mt-1">
                Café{reviews.length === 1 ? "" : "s"} catado{reviews.length === 1 ? "" : "s"}
              </p>
            </div>
            {avgRating && (
              <div>
                <p className="font-mono text-2xl text-crema leading-none">{avgRating}</p>
                <p className="font-mono text-[11px] text-parchment-dim uppercase mt-1">
                  Puntaje promedio
                </p>
              </div>
            )}
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
              href="/reviews"
              className="flex items-center gap-1.5 px-4 py-2.5 border border-parchment-dim/25 hover:border-crema text-parchment font-body text-sm rounded-sm transition-colors"
            >
              <ListFilter size={16} />
              Ver todas
            </Link>
          </div>
        </header>

        {error && (
          <p className="text-cascara-light text-sm">
            No se pudieron cargar tus reviews. {error}
          </p>
        )}

        {!error && reviews.length === 0 && (
          <p className="font-body text-parchment-dim">
            Todavía no cargaste ninguna review. Andá a{" "}
            <Link href="/" className="underline underline-offset-4">
              catar tu primer café
            </Link>
            .
          </p>
        )}

        <ul className="space-y-4">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} showTaster={false} />
          ))}
        </ul>
      </div>
    </main>
  );
}
