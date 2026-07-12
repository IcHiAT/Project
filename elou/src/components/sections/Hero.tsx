import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { hero } from "@/content/home";

export function Hero() {
  return (
    <section id="top" className="border-b border-line bg-canvas-soft">
      <Container className="grid gap-10 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-pill border border-line bg-surface px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            {hero.eyebrow}
          </span>

          <h1 className="font-heading text-4xl font-semibold leading-tight text-ink text-balance sm:text-5xl lg:text-6xl">
            {hero.headline}
          </h1>

          <p className="max-w-xl text-lg text-ink-soft text-pretty">
            {hero.subheadline}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href="#kontakt">{hero.primaryCta}</Button>
            <Button href="#leistungen" variant="secondary">
              {hero.secondaryCta}
            </Button>
          </div>

          <p className="text-xs text-ink-soft">
            Persönliche Beratung aus einer Hand — unabhängig &amp; gründlich.
          </p>
        </div>

        {/* TODO: Platzhalter-Visual – später z.B. Foto des Beraters oder Gebäude-Illustration */}
        <div
          aria-hidden="true"
          className="flex h-64 items-center justify-center rounded-card border border-dashed border-line bg-surface text-sm text-ink-soft sm:h-80 lg:h-96"
        >
          Platzhalter: Bild / Illustration
        </div>
      </Container>
    </section>
  );
}
