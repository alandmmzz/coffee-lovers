import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Coffee as CoffeeIcon, Pencil, ImageIcon } from "lucide-react";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import type { Coffee, BrandLogo } from "@/lib/db";
import BrandLogoRow from "../../components/BrandLogoRow";

export const dynamic = "force-dynamic";

export default async function AdminCoffeesPage() {
  const session = await getServerSession(authOptions);
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!session?.user?.email) {
    redirect("/");
  }
  if (!adminEmail || session.user.email !== adminEmail) {
    redirect("/");
  }

  let coffees: Coffee[] = [];
  let logos: BrandLogo[] = [];
  let error: string | null = null;

  try {
    coffees = (await sql`
      select * from coffees order by brand asc, line asc
    `) as unknown as Coffee[];
    logos = (await sql`select * from brand_logos`) as unknown as BrandLogo[];
  } catch (err) {
    console.error("Error al cargar admin de cafés:", err);
    error = "Hubo un problema al conectar con la base de datos.";
  }

  const logoMap = new Map(logos.map((l) => [l.brand, l.logo_url]));
  const brands = [...new Set(coffees.map((c) => c.brand))].sort();

  return (
    <main className="min-h-screen px-4 pt-4 pb-12 sm:py-16">
      <div className="max-w-2xl mx-auto">
        <header className="mb-10">
          <p className="font-mono text-xs tracking-[0.2em] text-crema uppercase mb-3">
            Coffee Lovers · Admin
          </p>
          <h1 className="flex items-center gap-2.5 font-display text-4xl text-cream leading-[1.05]">
            <CoffeeIcon size={28} />
            Catálogo de cafés
          </h1>
          <Link href="/admin/users" className="text-parchment-dim text-sm underline underline-offset-4 mt-3 inline-block">
            Ir a usuarios registrados →
          </Link>
        </header>

        {error && <p className="text-cascara-light text-sm">{error}</p>}

        {!error && (
          <>
            <section className="mb-12">
              <h2 className="flex items-center gap-2 font-display text-lg text-cream mb-4">
                <ImageIcon size={18} />
                Logos de marca
              </h2>
              <p className="font-mono text-[11px] text-parchment-dim mb-3">
                Pegá un link de imagen para cada marca. Se muestra en el selector de café.
              </p>
              <div className="divide-y divide-parchment-dim/10 border-t border-b border-parchment-dim/10">
                {brands.map((brand) => (
                  <BrandLogoRow
                    key={brand}
                    brand={brand}
                    initialLogoUrl={logoMap.get(brand) ?? null}
                  />
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-display text-lg text-cream mb-4">
                Cafés ({coffees.length})
              </h2>
              <ul className="divide-y divide-parchment-dim/10 border-t border-b border-parchment-dim/10">
                {coffees.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/admin/coffees/${c.id}`}
                      className="flex items-center justify-between gap-3 py-3.5 px-2 -mx-2 rounded-sm hover:bg-parchment/[0.04] transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-body text-sm text-cream truncate">
                          {c.brand} — {c.line}
                        </p>
                        <p className="font-mono text-[11px] text-parchment-dim truncate mt-0.5">
                          {[c.origin, c.variety, c.process].filter(Boolean).join(" · ") || "Sin más datos"}
                        </p>
                      </div>
                      <Pencil size={15} className="text-parchment-dim shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
