import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

export const dynamic = "force-dynamic";

type UserRow = {
  email: string;
  name: string | null;
  image: string | null;
  first_seen_at: string;
  last_seen_at: string;
  review_count: number;
};

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!session?.user?.email) {
    redirect("/");
  }

  if (!adminEmail || session.user.email !== adminEmail) {
    redirect("/");
  }

  let users: UserRow[] = [];
  let error: string | null = null;

  try {
    users = (await sql`
      select
        u.email,
        u.name,
        u.image,
        u.first_seen_at,
        u.last_seen_at,
        count(r.id)::int as review_count
      from users u
      left join coffee_reviews r on r.user_email = u.email
      group by u.email, u.name, u.image, u.first_seen_at, u.last_seen_at
      order by u.last_seen_at desc
    `) as unknown as UserRow[];
  } catch (err: any) {
    console.error("Error al cargar usuarios:", err);
    error = "Hubo un problema al conectar con la base de datos. Probá de nuevo en un momento.";
  }

  return (
    <main className="min-h-screen px-4 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <p className="font-mono text-xs tracking-[0.2em] text-crema uppercase mb-3">
            Coffee Lovers · Admin
          </p>
          <h1 className="flex items-center gap-2.5 font-display text-4xl text-cream leading-[1.05]">
            <Users size={28} />
            Usuarios registrados
          </h1>
          <Link href="/admin/coffees" className="text-parchment-dim text-sm underline underline-offset-4 mt-3 inline-block">
            Ir al catálogo de cafés →
          </Link>
          <p className="font-body text-parchment-dim text-sm mt-3">
            {users.length} persona{users.length === 1 ? "" : "s"} inició sesión alguna vez,
            haya dejado reviews o no.
          </p>
        </header>

        {error && <p className="text-cascara-light text-sm">{error}</p>}

        {!error && users.length === 0 && (
          <p className="font-body text-parchment-dim">Todavía no se registró nadie.</p>
        )}

        <ul className="divide-y divide-parchment-dim/10 border-t border-b border-parchment-dim/10">
          {users.map((u) => (
            <li key={u.email} className="flex items-center gap-4 py-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-cascara/20 flex items-center justify-center shrink-0">
                {u.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.image} alt={u.name ?? u.email} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-mono text-xs text-cream">
                    {(u.name ?? u.email)[0]?.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-cream truncate">{u.name ?? "Sin nombre"}</p>
                <p className="font-mono text-[11px] text-parchment-dim truncate">{u.email}</p>
              </div>

              <div className="text-right shrink-0">
                <p className="font-mono text-sm text-crema">
                  {u.review_count} review{u.review_count === 1 ? "" : "s"}
                </p>
                <p className="font-mono text-[10px] text-parchment-dim mt-0.5">
                  activo {formatRelativeTime(u.last_seen_at)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
