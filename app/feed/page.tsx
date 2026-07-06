import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Plus, Users, MessageCircle } from "lucide-react";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import type { CoffeeReview, Group } from "@/lib/db";
import ReviewCard from "../components/ReviewCard";
import { attachReactions } from "@/lib/reactions";
import { attachComments } from "@/lib/comments";

export const dynamic = "force-dynamic";

type GroupWithMembers = Group & {
  member_count: number;
  avatars: (string | null)[];
};

type FeedComment = {
  id: string;
  body: string;
  user_name: string | null;
  user_email: string;
  user_image: string | null;
  created_at: string;
  review_id: string;
  review_taster_name: string;
  review_brand: string;
  review_line: string;
};

type FeedItem =
  | { type: "review"; created_at: string; review: CoffeeReview }
  | { type: "comment"; created_at: string; comment: FeedComment };

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/");
  }
  const myEmail = session.user.email;

  let groups: GroupWithMembers[] = [];
  let items: FeedItem[] = [];
  let error: string | null = null;

  try {
    const myGroups = (await sql`
      select g.* from groups g
      join group_members m on m.group_id = g.id
      where m.user_email = ${myEmail}
      order by g.name asc
    `) as unknown as Group[];

    groups = await Promise.all(
      myGroups.map(async (g) => {
        const members = (await sql`
          select gm.user_email, u.image
          from group_members gm
          left join users u on u.email = gm.user_email
          where gm.group_id = ${g.id}
          order by gm.joined_at asc
          limit 5
        `) as unknown as { user_email: string; image: string | null }[];
        return {
          ...g,
          member_count: members.length,
          avatars: members.map((m) => m.image),
        };
      })
    );

    if (myGroups.length > 0) {
      let reviews = (await sql`
        select r.*, c.brand, c.line, c.origin, c.farm, c.variety, c.process, c.tasting_notes,
               bl.logo_url as brand_logo_url
        from coffee_reviews r
        join coffees c on c.id = r.coffee_id
        left join brand_logos bl on bl.brand = c.brand
        where r.user_email in (
          select distinct gm2.user_email
          from group_members gm1
          join group_members gm2 on gm1.group_id = gm2.group_id
          where gm1.user_email = ${myEmail}
        )
        order by r.created_at desc
        limit 100
      `) as unknown as CoffeeReview[];
      reviews = await attachReactions(reviews, myEmail);
      reviews = await attachComments(reviews);

      const comments = (await sql`
        select rc.id, rc.body, rc.user_name, rc.user_email, rc.user_image, rc.created_at,
               rc.review_id, r.taster_name as review_taster_name,
               c.brand as review_brand, c.line as review_line
        from review_comments rc
        join coffee_reviews r on r.id = rc.review_id
        join coffees c on c.id = r.coffee_id
        where rc.user_email in (
          select distinct gm2.user_email
          from group_members gm1
          join group_members gm2 on gm1.group_id = gm2.group_id
          where gm1.user_email = ${myEmail}
        )
        order by rc.created_at desc
        limit 50
      `) as unknown as FeedComment[];

      items = [
        ...reviews.map((r): FeedItem => ({ type: "review", created_at: r.created_at!, review: r })),
        ...comments.map((c): FeedItem => ({ type: "comment", created_at: c.created_at, comment: c })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  } catch (err) {
    console.error("Error al cargar el feed:", err);
    error = "Hubo un problema al conectar con la base de datos. Probá de nuevo en un momento.";
  }

  return (
    <main className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-crema uppercase mb-3">
              Coffee Lovers
            </p>
            <h1 className="font-display text-4xl text-cream leading-[1.05]">Feed</h1>
          </div>
          <Link
            href="/groups/new"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-cascara hover:bg-cascara-light text-cream font-body text-sm rounded-sm transition-colors shrink-0"
          >
            <Plus size={16} />
            Crear grupo
          </Link>
        </header>

        {error && <p className="text-cascara-light text-sm">{error}</p>}

        {!error && groups.length === 0 && (
          <p className="font-body text-parchment-dim mb-10">
            Todavía no sos parte de ningún grupo. Creá uno, o pedile el link de invitación a
            alguien que ya tenga uno.
          </p>
        )}

        {!error && groups.length > 0 && (
          <>
            {/* Carrusel de grupos */}
            <div className="flex gap-3 overflow-x-auto pb-3 mb-10 -mx-4 px-4 snap-x snap-mandatory">
              {groups.map((g) => (
                <Link
                  key={g.id}
                  href={`/groups/${g.id}`}
                  className="shrink-0 w-40 snap-start bg-parchment/[0.04] border border-parchment-dim/15 rounded-sm p-4 hover:border-crema transition-colors"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-cascara/20 flex items-center justify-center mb-3">
                    {g.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={g.image_url} alt={g.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users size={18} className="text-cream" />
                    )}
                  </div>
                  <p className="font-body text-sm text-cream truncate">{g.name}</p>
                  <div className="flex items-center mt-2">
                    <div className="flex -space-x-2">
                      {g.avatars.slice(0, 4).map((avatar, i) =>
                        avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={i}
                            src={avatar}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover border-2 border-ink"
                          />
                        ) : (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-full bg-parchment-dim/20 border-2 border-ink"
                          />
                        )
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-parchment-dim ml-2">
                      {g.member_count}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Feed combinado */}
            {items.length === 0 ? (
              <p className="font-body text-parchment-dim">
                Todavía no hay actividad en tus grupos.
              </p>
            ) : (
              <div className="space-y-10">
                {items.map((item) =>
                  item.type === "review" ? (
                    <ReviewCard key={`review-${item.review.id}`} review={item.review} />
                  ) : (
                    <div
                      key={`comment-${item.comment.id}`}
                      className="flex items-start gap-3 bg-parchment/[0.03] border border-parchment-dim/10 rounded-sm p-4"
                    >
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-cascara/20 flex items-center justify-center shrink-0">
                        {item.comment.user_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.comment.user_image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <MessageCircle size={12} className="text-cream" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-body text-sm text-parchment">
                          <span className="text-cream font-medium">
                            {item.comment.user_name ?? item.comment.user_email}
                          </span>{" "}
                          comentó en la review de {item.comment.review_taster_name} sobre{" "}
                          {item.comment.review_brand} — {item.comment.review_line}
                        </p>
                        <p className="font-body text-sm text-muted italic mt-1">
                          “{item.comment.body}”
                        </p>
                        <p className="font-mono text-[11px] text-parchment-dim mt-1">
                          {new Date(item.comment.created_at).toLocaleString("es-AR")}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
