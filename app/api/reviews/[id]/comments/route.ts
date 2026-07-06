import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';
import { sendPushToUser } from '@/lib/push';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Tenés que iniciar sesión.' }, { status: 401 });
  }

  const body = await req.json();
  const text = (body.body ?? '').trim();
  if (!text) {
    return NextResponse.json({ ok: false, error: 'El comentario no puede estar vacío.' }, { status: 400 });
  }
  if (text.length > 500) {
    return NextResponse.json({ ok: false, error: 'Máximo 500 caracteres.' }, { status: 400 });
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

    const canSee = await sql`
      select 1 from group_members gm1
      join group_members gm2 on gm1.group_id = gm2.group_id
      where gm1.user_email = ${session.user.email} and gm2.user_email = ${review.user_email}
      limit 1
    `;
    if (canSee.length === 0) {
      return NextResponse.json({ ok: false, error: 'No podés comentar en esta review.' }, { status: 403 });
    }

    const inserted = await sql`
      insert into review_comments (review_id, user_email, user_name, user_image, body)
      values (${params.id}, ${session.user.email}, ${session.user.name ?? null}, ${session.user.image ?? null}, ${text})
      returning *
    `;

    // Avisar al autor de la review (salvo que se esté comentando a sí mismo)
    if (review.user_email && review.user_email !== session.user.email) {
      try {
        await sql`
          insert into notifications (recipient_email, actor_email, actor_name, actor_image, type, review_id, comment_body)
          values (${review.user_email}, ${session.user.email}, ${session.user.name ?? null}, ${session.user.image ?? null}, 'comment', ${params.id}, ${text})
        `;
        await sendPushToUser(review.user_email, {
          title: 'Nuevo comentario',
          body: `${session.user.name ?? 'Alguien'} comentó tu review de ${review.brand} — ${review.line}`,
          url: '/notifications',
        });
      } catch (err) {
        console.error('Error al notificar comentario:', err);
      }
    }

    return NextResponse.json({ ok: true, comment: inserted[0] });
  } catch (err: any) {
    console.error('Error al crear comentario:', err);
    return NextResponse.json({ ok: false, error: 'No se pudo guardar el comentario.' }, { status: 500 });
  }
}
