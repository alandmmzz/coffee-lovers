import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Tenés que iniciar sesión.' }, { status: 401 });
  }

  try {
    const rows = await sql`
      select count(*)::int as count from notifications
      where recipient_email = ${session.user.email} and read_at is null
    `;
    const count = (rows[0] as { count: number } | undefined)?.count ?? 0;
    return NextResponse.json({ ok: true, count });
  } catch (err: any) {
    console.error('Error al contar notificaciones:', err);
    return NextResponse.json({ ok: false, error: 'No se pudo contar.' }, { status: 500 });
  }
}
