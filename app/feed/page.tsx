import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Plus, Users, MessageCircle, Coffee, Star, Award } from "lucide-react";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import type { CoffeeReview, Group } from "@/lib/db";
import ReviewCard from "../components/ReviewCard";
import CommentReactionBar from "../components/CommentReactionBar";
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
  link_group_id: string | null;
  reactions: { emoji: string; count: number; names: string[] }[];
  myReaction: string | null;
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
  let myStats: {
    total_reviews: number;
    avg_rating: number | null;
    favorite_method: string | null;
    favorite_brand: string | null;
  } | null = null;

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

    const myStatsRows = (await sql`
      select
        count(*)::int as total_reviews,
        round(avg(overall_rating)::numeric, 1) as avg_rating,
        (
          select brew_method from coffee_reviews
          where user_email = ${myEmail}
          group by brew_method
          order by count(*) desc
          limit 1
        ) as favorite_method,
        (
          select c.brand from coffee_reviews r2
          join coffees c on c.id = r2.coffee_id
          where r2.user_email = ${myEmail}
          group by c.brand
          order by count(*) desc
          limit 1
        ) as favorite_brand
      from coffee_reviews
      where user_email = ${myEmail}
    `) as unknown as {
      total_reviews: number;
      avg_rating: number | null;
      favorite_method: string | null;
      favorite_brand: string | null;
    }[];
    myStats = myStatsRows[0] ?? null;

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
      reviews = await attachComments(reviews, myEmail);

      let comments = (await sql`
        select rc.id, rc.body, rc.user_name, rc.user_email, rc.user_image, rc.created_at,
               rc.review_id, r.taster_name as review_taster_name, r.user_email as review_user_email,
               c.brand as review_brand, c.line as review_line,
               (
                 select gm1.group_id
                 from group_members gm1
                 join group_members gm2 on gm1.group_id = gm2.group_id
                 where gm1.user_email = ${myEmail} and gm2.user_email = r.user_email
                 limit 1
               ) as link_group_id
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

      // Reacciones de esos mismos comentarios (misma tabla que usa la review
      // original, así que reaccionar acá o allá es exactamente lo mismo)
      const commentIds = comments.map((c) => c.id);
      if (commentIds.length > 0) {
        const counts = (await sql`
          select cr.comment_id, cr.emoji, count(*)::int as count,
                 array_agg(coalesce(u.name, cr.user_email)) as names
          from comment_reactions cr
          left join users u on u.email = cr.user_email
          where cr.comment_id = any(${commentIds}::uuid[])
          group by cr.comment_id, cr.emoji
        `) as unknown as { comment_id: string; emoji: string; count: number; names: string[] }[];
        const mine = (await sql`
          select comment_id, emoji from comment_reactions
          where comment_id = any(${commentIds}::uuid[]) and user_email = ${myEmail}
        `) as unknown as { comment_id: string; emoji: string }[];

        const reactionsByComment = new Map<string, { emoji: string; count: number; names: string[] }[]>();
        for (const row of counts) {
          const list = reactionsByComment.get(row.comment_id) ?? [];
          list.push({ emoji: row.emoji, count: row.count, names: row.names });
          reactionsByComment.set(row.comment_id, list);
        }
        const mineByComment = new Map(mine.map((m) => [m.comment_id, m.emoji]));

        comments = comments.map((c) => ({
          ...c,
          reactions: reactionsByComment.get(c.id) ?? [],
          myReaction: mineByComment.get(c.id) ?? null,
        }));
      }

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
    <main className="min-h-screen px-4 pt-4 pb-12 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <header className="mb-5 flex items-end justify-between gap-4">
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

        {!error && myStats && myStats.total_reviews > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-3 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
            <div className="shrink-0 snap-start flex items-center gap-1.5 bg-parchment/[0.04] border border-parchment-dim/15 rounded-full px-3 py-1.5">
              <Coffee size={12} className="text-crema shrink-0" />
              <span className="font-mono text-[11px] text-parchment-dim whitespace-nowrap">
                {myStats.total_reviews} {myStats.total_reviews === 1 ? "review" : "reviews"}
              </span>
            </div>
            {myStats.avg_rating != null && (
              <div className="shrink-0 snap-start flex items-center gap-1.5 bg-parchment/[0.04] border border-parchment-dim/15 rounded-full px-3 py-1.5">
                <Star size={12} className="text-crema shrink-0" />
                <span className="font-mono text-[11px] text-parchment-dim whitespace-nowrap">
                  promedio {myStats.avg_rating}
                </span>
              </div>
            )}
            {myStats.favorite_method && (
              <div className="shrink-0 snap-start flex items-center gap-1.5 bg-parchment/[0.04] border border-parchment-dim/15 rounded-full px-3 py-1.5">
                <Award size={12} className="text-crema shrink-0" />
                <span className="font-mono text-[11px] text-parchment-dim whitespace-nowrap">
                  {myStats.favorite_method}
                </span>
              </div>
            )}
            {myStats.favorite_brand && (
              <div className="shrink-0 snap-start flex items-center gap-1.5 bg-parchment/[0.04] border border-parchment-dim/15 rounded-full px-3 py-1.5">
                <span className="font-mono text-[11px] text-parchment-dim whitespace-nowrap">
                  ☕ {myStats.favorite_brand}
                </span>
              </div>
            )}
          </div>
        )}

        {!error && groups.length === 0 && (
          <p className="font-body text-parchment-dim mb-10">
            Todavía no sos parte de ningún grupo. Creá uno, o pedile el link de invitación a
            alguien que ya tenga uno.
          </p>
        )}

        {!error && groups.length > 0 && (
          <>
            {/* Carrusel de grupos, formato chip compacto */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 snap-x snap-mandatory">
              {groups.map((g) => (
                <Link
                  key={g.id}
                  href={`/groups/${g.id}`}
                  className="shrink-0 snap-start flex items-center gap-2 bg-parchment/[0.04] border border-parchment-dim/15 rounded-full pl-1.5 pr-3 py-1.5 hover:border-crema transition-colors"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-cascara/20 flex items-center justify-center shrink-0">
                    {g.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={g.image_url} alt={g.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users size={11} className="text-cream" />
                    )}
                  </div>
                  <span className="font-body text-xs text-cream whitespace-nowrap">{g.name}</span>
                  <span className="font-mono text-[10px] text-parchment-dim">{g.member_count}</span>
                </Link>
              ))}
            </div>

            {/* Feed combinado: timeline con línea+puntos en desktop,
                ancho completo con separadores horizontales en mobile */}
            {items.length === 0 ? (
              <p className="font-body text-parchment-dim">
                Todavía no hay actividad en tus grupos.
              </p>
            ) : (
              <div className="relative">
                <div className="hidden sm:block absolute left-[15px] top-2 bottom-2 w-px bg-parchment-dim/15" />
                <div className="divide-y divide-parchment-dim/10 sm:divide-y-0 sm:space-y-10 -mx-4 sm:mx-0">
                  {items.map((item) =>
                    item.type === "review" ? (
                      <div
                        key={`review-${item.review.id}`}
                        className="relative px-4 py-6 sm:p-0 sm:pl-8"
                      >
                        <span className="hidden sm:block absolute left-[11px] top-2 w-2 h-2 rounded-full bg-crema" />
                        <ReviewCard review={item.review} />
                      </div>
                    ) : (
                      <div
                        key={`comment-${item.comment.id}`}
                        className="relative px-4 py-6 sm:p-0 sm:pl-8"
                      >
                        <span className="hidden sm:block absolute left-[11px] top-2 w-2 h-2 rounded-full bg-parchment-dim/40" />
                        <div className="sm:bg-parchment/[0.03] sm:border sm:border-parchment-dim/10 rounded-sm sm:p-4">
                          <CommentReactionBar
                            commentId={item.comment.id}
                            commentUserEmail={item.comment.user_email}
                            initialReactions={item.comment.reactions}
                            initialMyReaction={item.comment.myReaction}
                          >
                            <div className="flex items-start gap-3">
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
                              <div className="min-w-0 flex-1">
                                <p className="font-body text-sm text-parchment">
                                  <span className="text-cream font-medium">
                                    {item.comment.user_name ?? item.comment.user_email}
                                  </span>{" "}
                                  comentó en la{" "}
                                  {item.comment.link_group_id ? (
                                    <Link
                                      href={`/groups/${item.comment.link_group_id}/activity/${item.comment.review_id}`}
                                      className="text-crema hover:underline underline-offset-2"
                                    >
                                      review de {item.comment.review_taster_name} sobre{" "}
                                      {item.comment.review_brand} — {item.comment.review_line}
                                    </Link>
                                  ) : (
                                    <>
                                      review de {item.comment.review_taster_name} sobre{" "}
                                      {item.comment.review_brand} — {item.comment.review_line}
                                    </>
                                  )}
                                </p>
                                <p className="font-body text-sm text-muted italic mt-1">
                                  “{item.comment.body}”
                                </p>
                                <p className="font-mono text-[11px] text-parchment-dim mt-2">
                                  {new Date(item.comment.created_at).toLocaleString("es-AR")}
                                </p>
                              </div>
                            </div>
                          </CommentReactionBar>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
