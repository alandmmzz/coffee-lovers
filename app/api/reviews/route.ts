import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { ok: false, error: 'Tenés que iniciar sesión para guardar una review.' },
      { status: 401 }
    );
  }

  const body = await req.json();

  const required = [
    'coffee_id',
    'roast_level',
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
    await sql`
      insert into coffee_reviews
        (taster_name, coffee_id, roast_level, brew_method,
         aroma, acidity, sweetness, body, bitterness, aftertaste, balance,
         overall_rating, price, notes, has_milk, milk_type,
         user_email, user_name, user_image)
      values
        (${session.user.name ?? session.user.email}, ${body.coffee_id}, ${body.roast_level},
         ${body.brew_method}, ${body.aroma}, ${body.acidity}, ${body.sweetness}, ${body.body},
         ${body.bitterness}, ${body.aftertaste}, ${body.balance}, ${body.overall_rating},
         ${body.price ?? null}, ${body.notes ?? null}, ${body.has_milk ?? false}, ${body.milk_type ?? null},
         ${session.user.email}, ${session.user.name ?? null}, ${session.user.image ?? null})
    `;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error al guardar review:", err);
    return NextResponse.json(
      { ok: false, error: "No se pudo guardar la review. Probá de nuevo en un momento." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const rows = await sql`
      select r.*, c.brand, c.line, c.origin, c.farm, c.variety, c.process, c.tasting_notes
      from coffee_reviews r
      join coffees c on c.id = r.coffee_id
      order by r.created_at desc
    `;
    return NextResponse.json({ ok: true, reviews: rows });
  } catch (err: any) {
    console.error("Error al listar reviews:", err);
    return NextResponse.json(
      { ok: false, error: "No se pudieron cargar las reviews." },
      { status: 500 }
    );
  }
}
