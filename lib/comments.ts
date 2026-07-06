import sql from './db';
import type { CoffeeReview, ReviewComment } from './db';

export async function attachComments(
  reviews: CoffeeReview[],
  myEmail: string
): Promise<CoffeeReview[]> {
  const ids = reviews.map((r) => r.id).filter((id): id is string => !!id);
  if (ids.length === 0) return reviews;

  let rows: ReviewComment[] = [];
  try {
    rows = (await sql`
      select * from review_comments
      where review_id = any(${ids}::uuid[])
      order by created_at asc
    `) as unknown as ReviewComment[];
  } catch (err) {
    console.error('Error al traer comentarios:', err);
    return reviews;
  }

  // Reacciones de esos mismos comentarios, de una sola vez
  const commentIds = rows.map((c) => c.id);
  if (commentIds.length > 0) {
    try {
      const counts = (await sql`
        select comment_id, emoji, count(*)::int as count
        from comment_reactions
        where comment_id = any(${commentIds}::uuid[])
        group by comment_id, emoji
      `) as unknown as { comment_id: string; emoji: string; count: number }[];

      const mine = (await sql`
        select comment_id, emoji from comment_reactions
        where comment_id = any(${commentIds}::uuid[]) and user_email = ${myEmail}
      `) as unknown as { comment_id: string; emoji: string }[];

      const reactionsByComment = new Map<string, { emoji: string; count: number }[]>();
      for (const row of counts) {
        const list = reactionsByComment.get(row.comment_id) ?? [];
        list.push({ emoji: row.emoji, count: row.count });
        reactionsByComment.set(row.comment_id, list);
      }
      const mineByComment = new Map(mine.map((m) => [m.comment_id, m.emoji]));

      rows = rows.map((c) => ({
        ...c,
        reactions: reactionsByComment.get(c.id) ?? [],
        myReaction: mineByComment.get(c.id) ?? null,
      }));
    } catch (err) {
      console.error('Error al traer reacciones de comentarios:', err);
    }
  }

  const byReview = new Map<string, ReviewComment[]>();
  for (const c of rows) {
    const list = byReview.get(c.review_id) ?? [];
    list.push(c);
    byReview.set(c.review_id, list);
  }

  return reviews.map((r) => ({
    ...r,
    comments: r.id ? byReview.get(r.id) ?? [] : [],
  }));
}
