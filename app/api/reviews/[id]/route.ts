import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { ok: false, error: 'Tenés que iniciar sesión para editar una review.' },
      { status: 401 }
    );
  }

  const body = await req.json();

  const required = [
    'coffee_id',
    'brew_method',
    'aroma',
    'acidity',
    'sweetness',
    'body',
    'bitterness',
    'aftertaste',
    'balance',
    'overall_rating',
  ];
  const missing = required.filter((k) => body[k] === undefined || body[k] === '');
  if (missing.length > 0) {
    return NextResponse.json(
      { ok: false, error: `Faltan campos: ${missing.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    const rows = await sql`
      update coffee_reviews set
        coffee_id = ${body.coffee_id},
        brew_method = ${body.brew_method},
        aroma = ${body.aroma},
        acidity = ${body.acidity},
        sweetness = ${body.sweetness},
        body = ${body.body},
        bitterness = ${body.bitterness},
        aftertaste = ${body.aftertaste},
        balance = ${body.balance},
        overall_rating = ${body.overall_rating},
        price = ${body.price ?? null},
        notes = ${body.notes ?? null},
        has_milk = ${body.has_milk ?? false},
        milk_type = ${body.has_milk ? body.milk_type ?? null : null},
        temperature_preference = ${body.temperature_preference ?? null},
        consumption_type = ${body.consumption_type ?? null},
        place_id = ${body.place_id ?? null},
        place_name = ${body.place_name ?? null},
        place_address = ${body.place_address ?? null},
        place_lat = ${body.place_lat ?? null},
        place_lng = ${body.place_lng ?? null}
      where id = ${params.id} and user_email = ${session.user.email}
      returning id
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'No se encontró la review, o no te pertenece.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error al editar review:", err);
    return NextResponse.json(
      { ok: false, error: 'No se pudo guardar el cambio. Probá de nuevo en un momento.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { ok: false, error: 'Tenés que iniciar sesión para eliminar una review.' },
      { status: 401 }
    );
  }

  try {
    const rows = await sql`
      delete from coffee_reviews
      where id = ${params.id} and user_email = ${session.user.email}
      returning id
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'No se encontró la review, o no te pertenece.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error al eliminar review:", err);
    return NextResponse.json(
      { ok: false, error: 'No se pudo eliminar la review. Probá de nuevo en un momento.' },
      { status: 500 }
    );
  }
}
