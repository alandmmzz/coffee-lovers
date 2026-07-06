import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import type { CoffeeReview, Group } from "@/lib/db";
import ReviewCard from "../../../components/ReviewCard";
import { attachReactions } from "@/lib/reactions";
import { attachComments } from "@/lib/comments";
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
    redirect("/feed");
  }

  const groups = (await sql`select * from groups where id = ${params.groupId}`) as unknown as Group[];
  const group = groups[0];

  let reviews: CoffeeReview[] = [];
  let error: string | null = null;

  try {
    reviews = (await sql`
      select r.*, c.brand, c.line, c.origin, c.farm, c.variety, c.process, c.tasting_notes,
             bl.logo_url as brand_logo_url
      from coffee_reviews r
      join coffees c on c.id = r.coffee_id
      left join brand_logos bl on bl.brand = c.brand
      where r.user_email in (
        select user_email from group_members where group_id = ${params.groupId}
      )
      order by r.created_at desc
      limit 100
    `) as unknown as CoffeeReview[];
    reviews = await attachReactions(reviews, session.user.email);
    reviews = await attachComments(reviews);
  } catch (err) {
    console.error("Error al cargar la actividad:", err);
    error = "Hubo un problema al conectar con la base de datos. Probá de nuevo en un momento.";
  }

  return (
    <main className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <GroupTabs groupId={params.groupId} groupName={group?.name} />

        <header className="mb-8">
          <h1 className="font-display text-3xl text-cream leading-[1.05]">Actividad</h1>
        </header>

        {error && <p className="text-cascara-light text-sm">{error}</p>}

        {!error && reviews.length === 0 && (
          <p className="font-body text-parchment-dim">Todavía no hay actividad en este grupo.</p>
        )}

        <div className="space-y-10">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      </div>
    </main>
  );
}
