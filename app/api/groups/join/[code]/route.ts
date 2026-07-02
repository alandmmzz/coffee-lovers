import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { ok: false, error: 'Tenés que iniciar sesión para unirte.' },
      { status: 401 }
    );
  }

  try {
    const groups = await sql`select id from groups where invite_code = ${params.code}`;
    const group = groups[0] as { id: string } | undefined;
    if (!group) {
      return NextResponse.json({ ok: false, error: 'Ese link de invitación no existe.' }, { status: 404 });
    }

    await sql`
      insert into group_members (group_id, user_email) values (${group.id}, ${session.user.email})
      on conflict do nothing
    `;

    return NextResponse.json({ ok: true, groupId: group.id });
  } catch (err: any) {
    console.error('Error al unirse al grupo:', err);
    return NextResponse.json({ ok: false, error: 'No se pudo unir al grupo.' }, { status: 500 });
  }
}
