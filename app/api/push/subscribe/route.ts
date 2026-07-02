import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { ok: false, error: 'Tenés que iniciar sesión para activar notificaciones.' },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { endpoint, keys } = body;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ ok: false, error: 'Suscripción inválida.' }, { status: 400 });
  }

  try {
    await sql`
      insert into push_subscriptions (user_email, endpoint, p256dh, auth)
      values (${session.user.email}, ${endpoint}, ${keys.p256dh}, ${keys.auth})
      on conflict (endpoint) do update set
        user_email = excluded.user_email,
        p256dh = excluded.p256dh,
        auth = excluded.auth
    `;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Error al guardar suscripción push:', err);
    return NextResponse.json(
      { ok: false, error: 'No se pudo activar las notificaciones.' },
      { status: 500 }
    );
  }
}
