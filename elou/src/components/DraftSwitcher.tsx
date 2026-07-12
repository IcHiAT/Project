import Link from "next/link";

// Reine Review-Hilfe für die Entwurfsphase: schneller Wechsel zwischen den
// Design-Varianten. Entfällt, sobald eine Variante final ausgewählt wurde.
export function DraftSwitcher({ active }: { active: "a" | "b" }) {
  const linkClass = (variant: "a" | "b") =>
    `shrink-0 whitespace-nowrap rounded-pill px-3 py-1 transition-colors ${
      active === variant
        ? "bg-ink text-canvas"
        : "text-ink-soft hover:text-ink"
    }`;

  return (
    <div className="border-b border-dashed border-line bg-canvas-soft py-2 text-xs">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-3 overflow-x-auto px-6">
        <span className="shrink-0 whitespace-nowrap text-ink-soft">
          Entwurfsansicht:
        </span>
        <Link href="/entwurf-a" className={linkClass("a")}>
          Variante A · Nordlicht
        </Link>
        <Link href="/entwurf-b" className={linkClass("b")}>
          Variante B · Ruhepunkt
        </Link>
        <Link
          href="/"
          className="shrink-0 whitespace-nowrap text-ink-soft underline hover:text-ink"
        >
          Übersicht
        </Link>
      </div>
    </div>
  );
}
