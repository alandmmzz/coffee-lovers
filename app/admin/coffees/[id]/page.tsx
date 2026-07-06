import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import sql from "@/lib/db";
import type { Coffee } from "@/lib/db";
import EditCoffeeForm from "../../../components/EditCoffeeForm";

export const dynamic = "force-dynamic";

export default async function AdminEditCoffeePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!session?.user?.email) {
    redirect("/");
  }
  if (!adminEmail || session.user.email !== adminEmail) {
    redirect("/");
  }

  const rows = (await sql`select * from coffees where id = ${params.id}`) as unknown as Coffee[];
  const coffee = rows[0];
  if (!coffee) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 pt-4 pb-12 sm:py-16">
      <div className="max-w-md mx-auto">
        <header className="mb-8">
          <p className="font-mono text-xs tracking-[0.2em] text-crema uppercase mb-3">
            Coffee Lovers · Admin
          </p>
          <h1 className="font-display text-3xl text-cream leading-[1.05]">
            {coffee.brand} — {coffee.line}
          </h1>
        </header>
        <EditCoffeeForm coffee={coffee} />
      </div>
    </main>
  );
}
