import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Tenés que iniciar sesión.' }, { status: 401 });
  }

  const body = await req.json();
  if (!body.name?.trim()) {
    return NextResponse.json({ ok: false, error: 'El grupo necesita un nombre.' }, { status: 400 });
  }

  try {
    const membership = await sql`
      select 1 from group_members where group_id = ${params.id} and user_email = ${session.user.email}
    `;
    if (membership.length === 0) {
      return NextResponse.json({ ok: false, error: 'No sos miembro de este grupo.' }, { status: 403 });
    }

    await sql`
      update groups set name = ${body.name.trim()}, image_url = ${body.image_url ?? null}
      where id = ${params.id}
    `;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Error al editar grupo:', err);
    return NextResponse.json({ ok: false, error: 'No se pudo guardar el cambio.' }, { status: 500 });
  }
}
