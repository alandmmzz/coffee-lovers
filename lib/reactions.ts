import sql from './db';
import type { CoffeeReview } from './db';

export async function attachReactions(
  reviews: CoffeeReview[],
  myEmail: string
): Promise<CoffeeReview[]> {
  const ids = reviews.map((r) => r.id).filter((id): id is string => !!id);
  if (ids.length === 0) return reviews;

  let counts: { review_id: string; emoji: string; count: number; names: string[] }[] = [];
  let mine: { review_id: string; emoji: string }[] = [];

  try {
    counts = (await sql`
      select rr.review_id, rr.emoji, count(*)::int as count,
             array_agg(coalesce(u.name, rr.user_email)) as names
      from review_reactions rr
      left join users u on u.email = rr.user_email
      where rr.review_id = any(${ids}::uuid[])
      group by rr.review_id, rr.emoji
    `) as unknown as typeof counts;

    mine = (await sql`
      select review_id, emoji from review_reactions
      where review_id = any(${ids}::uuid[]) and user_email = ${myEmail}
    `) as unknown as typeof mine;
  } catch (err) {
    console.error('Error al traer reacciones:', err);
    return reviews;
  }

  const byReview = new Map<string, { emoji: string; count: number; names: string[] }[]>();
  for (const row of counts) {
    const list = byReview.get(row.review_id) ?? [];
    list.push({ emoji: row.emoji, count: row.count, names: row.names });
    byReview.set(row.review_id, list);
  }
  const mineByReview = new Map(mine.map((m) => [m.review_id, m.emoji]));

  return reviews.map((r) => ({
    ...r,
    reactions: r.id ? byReview.get(r.id) ?? [] : [],
    myReaction: r.id ? mineByReview.get(r.id) ?? null : null,
  }));
}
