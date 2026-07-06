import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';
import { sendPushToUser } from '@/lib/push';

const ALLOWED_EMOJIS = ['👍🏻', '👎🏻', '😂', '👀', '👄'];

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Tenés que iniciar sesión.' }, { status: 401 });
  }

  const body = await req.json();
  if (!ALLOWED_EMOJIS.includes(body.emoji)) {
    return NextResponse.json({ ok: false, error: 'Emoji no permitido.' }, { status: 400 });
  }

  try {
    const reviewRows = await sql`
      select r.user_email, c.brand, c.line
      from coffee_reviews r
      join coffees c on c.id = r.coffee_id
      where r.id = ${params.id}
    `;
    const review = reviewRows[0] as { user_email: string | null; brand: string; line: string } | undefined;
    if (!review) {
      return NextResponse.json({ ok: false, error: 'No existe esa review.' }, { status: 404 });
    }

    // Solo podés reaccionar a reviews de gente con la que compartís algún grupo
    const canSee = await sql`
      select 1 from group_members gm1
      join group_members gm2 on gm1.group_id = gm2.group_id
      where gm1.user_email = ${session.user.email} and gm2.user_email = ${review.user_email}
      limit 1
    `;
    if (canSee.length === 0) {
      return NextResponse.json({ ok: false, error: 'No podés reaccionar a esta review.' }, { status: 403 });
    }

    const existing = await sql`
      select emoji from review_reactions
      where review_id = ${params.id} and user_email = ${session.user.email}
    `;
    const existingEmoji = (existing[0] as { emoji: string } | undefined)?.emoji;

    let myReaction: string | null;
    if (existingEmoji === body.emoji) {
      await sql`
        delete from review_reactions
        where review_id = ${params.id} and user_email = ${session.user.email}
      `;
      myReaction = null;
    } else {
      await sql`
        insert into review_reactions (review_id, user_email, emoji)
        values (${params.id}, ${session.user.email}, ${body.emoji})
        on conflict (review_id, user_email) do update set
          emoji = excluded.emoji,
          created_at = now()
      `;
      myReaction = body.emoji;

      // Avisar al autor de la review (salvo que se esté reaccionando a sí mismo)
      if (review.user_email && review.user_email !== session.user.email) {
        try {
          await sql`
            insert into notifications (recipient_email, actor_email, actor_name, actor_image, type, review_id, emoji)
            values (${review.user_email}, ${session.user.email}, ${session.user.name ?? null}, ${session.user.image ?? null}, 'reaction', ${params.id}, ${body.emoji})
          `;
          await sendPushToUser(review.user_email, {
            title: 'Nueva reacción',
            body: `${session.user.name ?? 'Alguien'} reaccionó ${body.emoji} a tu review de ${review.brand} — ${review.line}`,
            url: '/notifications',
          });
        } catch (err) {
          console.error('Error al notificar reacción:', err);
        }
      }
    }

    const counts = await sql`
      select rr.emoji, count(*)::int as count,
             array_agg(coalesce(u.name, rr.user_email)) as names
      from review_reactions rr
      left join users u on u.email = rr.user_email
      where rr.review_id = ${params.id}
      group by rr.emoji
    `;

    return NextResponse.json({ ok: true, reactions: counts, myReaction });
  } catch (err: any) {
    console.error('Error al reaccionar:', err);
    return NextResponse.json({ ok: false, error: 'No se pudo guardar la reacción.' }, { status: 500 });
  }
}
