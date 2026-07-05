import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';

export async function GET() {
  try {
    const coffees = await sql`
      select c.*, bl.logo_url as brand_logo_url
      from coffees c
      left join brand_logos bl on bl.brand = c.brand
      order by c.brand asc, c.line asc
    `;
    return NextResponse.json({ ok: true, coffees });
  } catch (err: any) {
    console.error("Error al listar cafés:", err);
    return NextResponse.json(
      { ok: false, error: "No se pudo cargar el catálogo de cafés." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { ok: false, error: 'Tenés que iniciar sesión para agregar un café.' },
      { status: 401 }
    );
  }

  const body = await req.json();
  if (!body.brand?.trim() || !body.line?.trim()) {
    return NextResponse.json(
      { ok: false, error: 'Marca y línea/tipo son obligatorios.' },
      { status: 400 }
    );
  }

  try {
    const rows = await sql`
      insert into coffees (brand, line, origin, farm, variety, process, tasting_notes)
      values (
        ${body.brand.trim()}, ${body.line.trim()}, ${body.origin ?? null},
        ${body.farm ?? null}, ${body.variety ?? null}, ${body.process ?? null},
        ${body.tasting_notes ?? null}
      )
      on conflict (brand, line) do update set
        origin = coalesce(excluded.origin, coffees.origin),
        farm = coalesce(excluded.farm, coffees.farm),
        variety = coalesce(excluded.variety, coffees.variety),
        process = coalesce(excluded.process, coffees.process),
        tasting_notes = coalesce(excluded.tasting_notes, coffees.tasting_notes)
      returning *
    `;
    return NextResponse.json({ ok: true, coffee: rows[0] });
  } catch (err: any) {
    console.error("Error al crear café:", err);
    return NextResponse.json(
      { ok: false, error: "No se pudo guardar el café. Probá de nuevo en un momento." },
      { status: 500 }
    );
  }
}
