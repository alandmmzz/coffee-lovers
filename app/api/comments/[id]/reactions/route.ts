import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';

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
    const commentRows = await sql`select user_email from review_comments where id = ${params.id}`;
    const comment = commentRows[0] as { user_email: string } | undefined;
    if (!comment) {
      return NextResponse.json({ ok: false, error: 'No existe ese comentario.' }, { status: 404 });
    }

    const canSee = await sql`
      select 1 from group_members gm1
      join group_members gm2 on gm1.group_id = gm2.group_id
      where gm1.user_email = ${session.user.email} and gm2.user_email = ${comment.user_email}
      limit 1
    `;
    if (canSee.length === 0) {
      return NextResponse.json({ ok: false, error: 'No podés reaccionar a este comentario.' }, { status: 403 });
    }

    const existing = await sql`
      select emoji from comment_reactions
      where comment_id = ${params.id} and user_email = ${session.user.email}
    `;
    const existingEmoji = (existing[0] as { emoji: string } | undefined)?.emoji;

    let myReaction: string | null;
    if (existingEmoji === body.emoji) {
      await sql`
        delete from comment_reactions
        where comment_id = ${params.id} and user_email = ${session.user.email}
      `;
      myReaction = null;
    } else {
      await sql`
        insert into comment_reactions (comment_id, user_email, emoji)
        values (${params.id}, ${session.user.email}, ${body.emoji})
        on conflict (comment_id, user_email) do update set
          emoji = excluded.emoji,
          created_at = now()
      `;
      myReaction = body.emoji;
    }

    const counts = await sql`
      select cr.emoji, count(*)::int as count,
             array_agg(coalesce(u.name, cr.user_email)) as names
      from comment_reactions cr
      left join users u on u.email = cr.user_email
      where cr.comment_id = ${params.id}
      group by cr.emoji
    `;

    return NextResponse.json({ ok: true, reactions: counts, myReaction });
  } catch (err: any) {
    console.error('Error al reaccionar al comentario:', err);
    return NextResponse.json({ ok: false, error: 'No se pudo guardar la reacción.' }, { status: 500 });
  }
}
