import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import type { CoffeeReview, Group } from "@/lib/db";
import ReviewCard from "../../../components/ReviewCard";
import GroupTabs from "../../../components/GroupTabs";

export const dynamic = "force-dynamic";

export default async function GroupReviewsPage({ params }: { params: { groupId: string } }) {
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
    `) as unknown as CoffeeReview[];
  } catch (err) {
    console.error("Error al cargar el archivo de reviews:", err);
    error = "Hubo un problema al conectar con la base de datos. Probá de nuevo en un momento.";
  }

  return (
    <main className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <GroupTabs groupId={params.groupId} groupName={group?.name} />

        <header className="mb-8">
          <h1 className="font-display text-3xl text-cream leading-[1.05]">Todas las reviews</h1>
        </header>

        {error && <p className="text-cascara-light text-sm">{error}</p>}

        {!error && reviews.length === 0 && (
          <p className="font-body text-parchment-dim">Todavía no hay ninguna ficha cargada en este grupo.</p>
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
