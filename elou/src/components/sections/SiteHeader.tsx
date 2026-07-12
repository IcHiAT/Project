import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { nav, site } from "@/content/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <a href="#top" className="font-heading text-lg font-semibold text-ink">
          {site.name}
        </a>

        <nav aria-label="Hauptnavigation" className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Button href="#kontakt">
          <span className="sm:hidden">Erstgespräch</span>
          <span className="hidden sm:inline">Kostenloses Erstgespräch</span>
        </Button>
      </Container>
    </header>
  );
}
