import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import type { CoffeeReview } from "@/lib/db";
import EditReviewForm from "../../../components/EditReviewForm";

export const dynamic = "force-dynamic";

export default async function EditReviewPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/");
  }

  let review: CoffeeReview | null = null;

  try {
    const rows = (await sql`
      select r.*, c.brand, c.line, c.origin, c.farm, c.variety, c.process, c.tasting_notes
      from coffee_reviews r
      join coffees c on c.id = r.coffee_id
      where r.id = ${params.id}
      limit 1
    `) as unknown as CoffeeReview[];
    review = rows[0] ?? null;
  } catch (err) {
    console.error("Error al cargar review para editar:", err);
  }

  if (!review) {
    notFound();
  }

  if (review.user_email !== session.user.email) {
    redirect("/profile");
  }

  return (
    <main className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-xl lg:max-w-4xl mx-auto">
        <div className="max-w-xl mb-10">
          <header>
            <p className="font-mono text-xs tracking-[0.2em] text-crema uppercase mb-3">
              Coffee Lovers · Editar
            </p>
            <h1 className="font-display text-4xl sm:text-5xl text-cream leading-[1.05]">
              {review.brand} — {review.line}
            </h1>
          </header>
        </div>

        <EditReviewForm review={review} />
      </div>
    </main>
  );
}
