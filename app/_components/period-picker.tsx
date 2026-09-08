import Link from "next/link";
import { PERIOD_OPTIONS, type PeriodValue } from "@/lib/period";

// Seletor de período (segmented control). Navega por query param ?periodo=.
export function PeriodPicker({ path, current }: { path: string; current: PeriodValue }) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-5">
      {PERIOD_OPTIONS.map((o) => {
        const active = o.value === current;
        return (
          <Link
            key={o.value}
            href={o.value === "ano" ? path : `${path}?periodo=${o.value}`}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              active
                ? "bg-[color:var(--color-blue)] border-[color:var(--color-blue)] text-white"
                : "border-[color:var(--color-line-strong)] text-[color:var(--color-muted)] hover:text-white"
            }`}
          >
            {o.label}
          </Link>
        );
      })}
    </div>
  );
}
