import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';
import { sendPushToGroupExcept } from '@/lib/push';

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
    'group_id',
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
    // Nunca confiar en el group_id que manda el cliente sin verificar que
    // quien postea sea efectivamente miembro de ese grupo.
    const membership = await sql`
      select 1 from group_members where group_id = ${body.group_id} and user_email = ${session.user.email}
    `;
    if (membership.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'No sos miembro de ese grupo.' },
        { status: 403 }
      );
    }

    await sql`
      insert into coffee_reviews
        (taster_name, coffee_id, group_id, roast_level, brew_method,
         aroma, acidity, sweetness, body, bitterness, aftertaste, balance,
         overall_rating, price, notes, has_milk, milk_type, temperature_preference,
         user_email, user_name, user_image)
      values
        (${session.user.name ?? session.user.email}, ${body.coffee_id}, ${body.group_id}, ${body.roast_level ?? null},
         ${body.brew_method}, ${body.aroma}, ${body.acidity}, ${body.sweetness}, ${body.body},
         ${body.bitterness}, ${body.aftertaste}, ${body.balance}, ${body.overall_rating},
         ${body.price ?? null}, ${body.notes ?? null}, ${body.has_milk ?? false}, ${body.milk_type ?? null},
         ${body.temperature_preference ?? null},
         ${session.user.email}, ${session.user.name ?? null}, ${session.user.image ?? null})
    `;

    // Avisar a los demás miembros del mismo grupo (no rompe el guardado si esto falla)
    try {
      const coffeeRows = await sql`select brand, line from coffees where id = ${body.coffee_id}`;
      const coffee = coffeeRows[0] as { brand: string; line: string } | undefined;
      if (coffee) {
        await sendPushToGroupExcept(body.group_id, session.user.email, {
          title: "Nueva review en Coffee Lovers",
          body: `${session.user.name ?? "Alguien"} cató ${coffee.brand} — ${coffee.line}`,
          url: `/groups/${body.group_id}/activity`,
        });
      }
    } catch (pushErr) {
      console.error("Error al enviar notificaciones push:", pushErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error al guardar review:", err);
    return NextResponse.json(
      { ok: false, error: "No se pudo guardar la review. Probá de nuevo en un momento." },
      { status: 500 }
    );
  }
}
