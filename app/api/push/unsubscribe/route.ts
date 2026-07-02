import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { endpoint } = body;

  if (!endpoint) {
    return NextResponse.json({ ok: false, error: 'Falta el endpoint.' }, { status: 400 });
  }

  try {
    await sql`delete from push_subscriptions where endpoint = ${endpoint}`;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Error al borrar suscripción push:', err);
    return NextResponse.json(
      { ok: false, error: 'No se pudo desactivar las notificaciones.' },
      { status: 500 }
    );
  }
}
