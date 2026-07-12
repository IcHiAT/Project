import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { kontaktCta } from "@/content/home";
import { site } from "@/content/site";

export function KontaktCta() {
  return (
    <section id="kontakt" className="py-20 sm:py-28">
      <Container>
        <div className="flex flex-col items-center gap-6 rounded-card bg-dark px-6 py-16 text-center sm:px-16">
          <h2 className="font-heading text-3xl font-semibold text-brand-contrast text-balance sm:text-4xl">
            {kontaktCta.headline}
          </h2>
          <p className="max-w-xl text-base text-brand-contrast/80 text-pretty">
            {kontaktCta.text}
          </p>
          {/* TODO: Button auf echtes Kontaktformular (Formular-API) verlinken, sobald verfügbar */}
          <Button href={`mailto:${site.email}`}>{kontaktCta.primaryCta}</Button>
          <p className="text-xs text-brand-contrast/60">
            {/* TODO: echte Kontaktdaten */}
            Oder direkt: {site.email} · {site.phone}
          </p>
        </div>
      </Container>
    </section>
  );
}
