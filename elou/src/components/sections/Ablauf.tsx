import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ablauf } from "@/content/home";

export function Ablauf() {
  return (
    <section id="ablauf" className="border-y border-line bg-canvas-soft py-20 sm:py-28">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow="Ablauf"
          title="So läuft die Zusammenarbeit ab"
          description="TODO Platzhalter: Kurzer Text zum Ablauf – transparent und ohne Überraschungen, von der ersten Anfrage bis zur Umsetzung."
        />

        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {ablauf.map((item) => (
            <li key={item.step} className="flex flex-col gap-3">
              <span className="font-heading text-3xl font-semibold text-brand">
                {item.step}
              </span>
              <h3 className="font-heading text-lg font-semibold text-ink">
                {item.title}
              </h3>
              <p className="text-sm text-ink-soft text-pretty">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
