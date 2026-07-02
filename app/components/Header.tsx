import Link from "next/link";
import { Coffee, PlusCircle, Activity } from "lucide-react";
import UserMenu from "./UserMenu";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-ink/80 border-b border-parchment-dim/15">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg text-cream shrink-0">
          <Coffee size={20} className="text-crema" />
          Coffee Lovers
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-sm text-parchment hover:bg-parchment/5 transition-colors"
          >
            <PlusCircle size={16} />
            <span className="hidden sm:inline">Nueva review</span>
          </Link>
          <Link
            href="/activity"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-sm text-parchment hover:bg-parchment/5 transition-colors"
          >
            <Activity size={16} />
            <span className="hidden sm:inline">Actividad</span>
          </Link>
        </nav>

        <UserMenu />
      </div>
    </header>
  );
}
