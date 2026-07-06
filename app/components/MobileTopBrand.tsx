import Link from "next/link";
import { Coffee } from "lucide-react";

export default function MobileTopBrand() {
  return (
    <div className="sm:hidden px-4 pt-5 pb-2">
      <Link href="/" className="flex items-center gap-2 font-display text-lg text-cream">
        <Coffee size={18} className="text-crema" />
        Coffee Lovers
      </Link>
    </div>
  );
}
