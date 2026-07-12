import Link from "next/link";

const variants = [
  {
    href: "/entwurf-a",
    name: "Variante A · Nordlicht",
    description:
      "Kühles Anthrazit + technisches Grün, geometrische Sans-Serif (Space Grotesk), straffe Kanten und Raster. Wirkt präzise und sachlich.",
    swatches: ["#101917", "#1c6b47", "#f6f7f6"],
  },
  {
    href: "/entwurf-b",
    name: "Variante B · Ruhepunkt",
    description:
      "Warmes Sand + gedecktes Petrolgrün, humanistische Serifen-Headlines (Source Serif 4), weichere Rundungen und mehr Weißraum. Wirkt persönlicher und ruhiger.",
    swatches: ["#14251d", "#2b5c46", "#faf8f4"],
  },
];

export default function DraftOverview() {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-10 bg-[#f6f7f6] px-6 py-20 text-[#1b211e]">
      <div className="flex max-w-2xl flex-col gap-3 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1c6b47]">
          elou Energieberatung — Homepage-Entwurf
        </span>
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Zwei Design-Varianten zur Auswahl
        </h1>
        <p className="text-[#57625c]">
          Beide Varianten enthalten dieselben Inhalte (Hero, Leistungen,
          Ablauf, Kontakt-CTA) mit Platzhaltertexten. Schaut euch beide an und
          gebt Bescheid, welche Richtung weiterverfolgt werden soll — danach
          bauen wir die restlichen Sections und die technische Struktur aus.
        </p>
      </div>

      <div className="grid w-full max-w-4xl gap-6 sm:grid-cols-2">
        {variants.map((variant) => (
          <Link
            key={variant.href}
            href={variant.href}
            className="group flex flex-col gap-4 rounded-xl border border-[#dee3e0] bg-white p-6 transition-colors hover:border-[#1c6b47]"
          >
            <div className="flex gap-2">
              {variant.swatches.map((color) => (
                <span
                  key={color}
                  className="h-8 w-8 rounded-full border border-black/10"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
              ))}
            </div>
            <h2 className="text-lg font-semibold">{variant.name}</h2>
            <p className="text-sm text-[#57625c]">{variant.description}</p>
            <span className="mt-auto text-sm font-medium text-[#1c6b47] group-hover:underline">
              Entwurf ansehen →
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
