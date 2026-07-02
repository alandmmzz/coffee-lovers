import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { randomBytes } from 'crypto';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Tenés que iniciar sesión.' }, { status: 401 });
  }

  try {
    const groups = await sql`
      select g.* from groups g
      join group_members m on m.group_id = g.id
      where m.user_email = ${session.user.email}
      order by g.name asc
    `;
    return NextResponse.json({ ok: true, groups });
  } catch (err: any) {
    console.error('Error al listar grupos:', err);
    return NextResponse.json({ ok: false, error: 'No se pudieron cargar tus grupos.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Tenés que iniciar sesión.' }, { status: 401 });
  }

  const body = await req.json();
  if (!body.name?.trim()) {
    return NextResponse.json({ ok: false, error: 'Ponele un nombre al grupo.' }, { status: 400 });
  }

  const inviteCode = randomBytes(5).toString('hex');

  try {
    const rows = await sql`
      insert into groups (name, image_url, invite_code, created_by)
      values (${body.name.trim()}, ${body.image_url ?? null}, ${inviteCode}, ${session.user.email})
      returning *
    `;
    const group = rows[0];

    await sql`
      insert into group_members (group_id, user_email) values (${group.id}, ${session.user.email})
    `;

    return NextResponse.json({ ok: true, group });
  } catch (err: any) {
    console.error('Error al crear grupo:', err);
    return NextResponse.json({ ok: false, error: 'No se pudo crear el grupo.' }, { status: 500 });
  }
}
