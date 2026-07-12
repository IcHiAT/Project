import { Container } from "@/components/ui/Container";
import { site } from "@/content/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line py-10">
      <Container className="flex flex-col items-center gap-4 text-sm text-ink-soft sm:flex-row sm:justify-between">
        <p>
          © {year} {site.name} · {site.region}
        </p>

        {/* TODO: echte Rechtstexte/Seiten ergänzen (Impressum, Datenschutz) */}
        <nav aria-label="Rechtliches" className="flex gap-6">
          <span className="cursor-not-allowed opacity-60">Impressum</span>
          <span className="cursor-not-allowed opacity-60">Datenschutz</span>
        </nav>
      </Container>
    </footer>
  );
}
