import Link from "next/link";
import UserMenu from "./UserMenu";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-ink/80 border-b border-parchment-dim/15">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-display text-lg text-cream">
          ☕ Coffee Lovers
        </Link>
        <UserMenu />
      </div>
    </header>
  );
}
