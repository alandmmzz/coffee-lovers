import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';

export async function GET() {
  try {
    const logos = await sql`select * from brand_logos`;
    return NextResponse.json({ ok: true, logos });
  } catch (err: any) {
    console.error('Error al listar logos de marca:', err);
    return NextResponse.json({ ok: false, error: 'No se pudieron cargar los logos.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!session?.user?.email || session.user.email !== adminEmail) {
    return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 403 });
  }

  const body = await req.json();
  if (!body.brand?.trim()) {
    return NextResponse.json({ ok: false, error: 'Falta la marca.' }, { status: 400 });
  }

  try {
    await sql`
      insert into brand_logos (brand, logo_url, updated_at)
      values (${body.brand.trim()}, ${body.logo_url?.trim() || null}, now())
      on conflict (brand) do update set
        logo_url = excluded.logo_url,
        updated_at = now()
    `;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Error al guardar logo de marca:', err);
    return NextResponse.json({ ok: false, error: 'No se pudo guardar el logo.' }, { status: 500 });
  }
}
