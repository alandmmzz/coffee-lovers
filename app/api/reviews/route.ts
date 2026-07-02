import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const required = [
    'taster_name',
    'brand',
    'coffee_type',
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
        (taster_name, brand, coffee_type, origin, roast_level, brew_method,
         aroma, acidity, sweetness, body, bitterness, aftertaste, balance,
         overall_rating, price, notes)
      values
        (${body.taster_name}, ${body.brand}, ${body.coffee_type}, ${body.origin ?? null},
         ${body.roast_level}, ${body.brew_method}, ${body.aroma}, ${body.acidity},
         ${body.sweetness}, ${body.body}, ${body.bitterness}, ${body.aftertaste},
         ${body.balance}, ${body.overall_rating}, ${body.price ?? null}, ${body.notes ?? null})
    `;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rows = await sql`select * from coffee_reviews order by created_at desc`;
    return NextResponse.json({ ok: true, reviews: rows });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
