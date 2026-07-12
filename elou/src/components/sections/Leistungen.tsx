import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { leistungen } from "@/content/home";

export function Leistungen() {
  return (
    <section id="leistungen" className="py-20 sm:py-28">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow="Leistungen"
          title="Beratung, passgenau für Ihr Vorhaben"
          description="TODO Platzhalter: Kurzer Einordnungstext, welche Leistungen elou abdeckt und für wen sie geeignet sind."
        />

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {leistungen.map((item) => (
            <li
              key={item.title}
              className="flex flex-col gap-3 rounded-card border border-line bg-surface p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-heading text-lg font-semibold text-ink">
                  {item.title}
                </h3>
                {item.tag ? (
                  <span className="shrink-0 rounded-pill bg-brand-soft px-3 py-1 text-xs font-medium text-brand">
                    {item.tag}
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-ink-soft text-pretty">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
