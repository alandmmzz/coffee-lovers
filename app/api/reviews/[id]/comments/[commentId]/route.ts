import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Tenés que iniciar sesión.' }, { status: 401 });
  }

  try {
    const rows = await sql`
      delete from review_comments
      where id = ${params.commentId} and review_id = ${params.id} and user_email = ${session.user.email}
      returning id
    `;
    if (rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'No se encontró el comentario, o no es tuyo.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Error al borrar comentario:', err);
    return NextResponse.json({ ok: false, error: 'No se pudo eliminar el comentario.' }, { status: 500 });
  }
}
