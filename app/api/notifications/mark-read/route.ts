import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Tenés que iniciar sesión.' }, { status: 401 });
  }

  try {
    await sql`
      update notifications set read_at = now()
      where recipient_email = ${session.user.email} and read_at is null
    `;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Error al marcar notificaciones como leídas:', err);
    return NextResponse.json({ ok: false, error: 'No se pudo actualizar.' }, { status: 500 });
  }
}
