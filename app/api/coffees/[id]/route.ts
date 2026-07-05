import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rows = await sql`select * from coffees where id = ${params.id}`;
    if (rows.length === 0) {
      return NextResponse.json({ ok: false, error: 'No existe ese café.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, coffee: rows[0] });
  } catch (err: any) {
    console.error('Error al buscar café:', err);
    return NextResponse.json({ ok: false, error: 'No se pudo cargar el café.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!session?.user?.email || session.user.email !== adminEmail) {
    return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 403 });
  }

  const body = await req.json();
  if (!body.brand?.trim() || !body.line?.trim()) {
    return NextResponse.json({ ok: false, error: 'Marca y línea son obligatorios.' }, { status: 400 });
  }

  try {
    await sql`
      update coffees set
        brand = ${body.brand.trim()},
        line = ${body.line.trim()},
        origin = ${body.origin?.trim() || null},
        farm = ${body.farm?.trim() || null},
        variety = ${body.variety?.trim() || null},
        process = ${body.process?.trim() || null},
        tasting_notes = ${body.tasting_notes?.trim() || null}
      where id = ${params.id}
    `;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Error al editar café:', err);
    return NextResponse.json({ ok: false, error: 'No se pudo guardar el cambio.' }, { status: 500 });
  }
}
