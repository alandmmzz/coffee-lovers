import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Heart, MessageCircle } from "lucide-react";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import type { Notification } from "@/lib/db";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/");
  }
  const myEmail = session.user.email;

  let notifications: Notification[] = [];
  let error: string | null = null;

  try {
    notifications = (await sql`
      select n.*, c.brand as review_brand, c.line as review_line
      from notifications n
      left join coffee_reviews r on r.id = n.review_id
      left join coffees c on c.id = r.coffee_id
      where n.recipient_email = ${myEmail}
      order by n.created_at desc
      limit 100
    `) as unknown as Notification[];

    await sql`
      update notifications set read_at = now()
      where recipient_email = ${myEmail} and read_at is null
    `;
  } catch (err) {
    console.error("Error al cargar notificaciones:", err);
    error = "Hubo un problema al conectar con la base de datos. Probá de nuevo en un momento.";
  }

  return (
    <main className="min-h-screen px-4 pt-4 pb-12 sm:py-16">
      <div className="max-w-xl mx-auto">
        <header className="mb-10">
          <p className="font-mono text-xs tracking-[0.2em] text-crema uppercase mb-3">
            Coffee Lovers
          </p>
          <h1 className="font-display text-4xl text-cream leading-[1.05]">Notificaciones</h1>
        </header>

        {error && <p className="text-cascara-light text-sm">{error}</p>}

        {!error && notifications.length === 0 && (
          <p className="font-body text-parchment-dim">
            Todavía no tenés notificaciones — cuando alguien reaccione o comente una de tus
            reviews, va a aparecer acá.
          </p>
        )}

        <ul className="divide-y divide-parchment-dim/10 border-t border-b border-parchment-dim/10">
          {notifications.map((n) => (
            <li key={n.id} className="flex items-start gap-3 py-4">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-cascara/20 flex items-center justify-center shrink-0">
                {n.actor_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={n.actor_image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-mono text-[10px] text-cream">
                    {(n.actor_name ?? n.actor_email)[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-cream">
                  <span className="font-medium">{n.actor_name ?? n.actor_email}</span>{" "}
                  {n.type === "reaction" ? (
                    <>
                      reaccionó {n.emoji} a tu review
                      {n.review_brand ? ` de ${n.review_brand} — ${n.review_line}` : ""}
                    </>
                  ) : (
                    <>
                      comentó tu review
                      {n.review_brand ? ` de ${n.review_brand} — ${n.review_line}` : ""}
                    </>
                  )}
                </p>
                {n.type === "comment" && n.comment_body && (
                  <p className="font-body text-sm text-muted italic mt-1">“{n.comment_body}”</p>
                )}
                <p className="font-mono text-[11px] text-parchment-dim mt-1">
                  {formatRelativeTime(n.created_at)}
                </p>
              </div>
              <div className="shrink-0 text-parchment-dim/50 mt-1">
                {n.type === "reaction" ? <Heart size={14} /> : <MessageCircle size={14} />}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
