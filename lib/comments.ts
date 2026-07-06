import sql from './db';
import type { CoffeeReview, ReviewComment } from './db';

export async function attachComments(reviews: CoffeeReview[]): Promise<CoffeeReview[]> {
  const ids = reviews.map((r) => r.id).filter((id): id is string => !!id);
  if (ids.length === 0) return reviews;

  let rows: ReviewComment[] = [];
  try {
    rows = (await sql`
      select * from review_comments
      where review_id = any(${ids})
      order by created_at asc
    `) as unknown as ReviewComment[];
  } catch (err) {
    console.error('Error al traer comentarios:', err);
    return reviews;
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
