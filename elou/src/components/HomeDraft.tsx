import { DraftSwitcher } from "@/components/DraftSwitcher";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { Hero } from "@/components/sections/Hero";
import { Leistungen } from "@/components/sections/Leistungen";
import { Ablauf } from "@/components/sections/Ablauf";
import { KontaktCta } from "@/components/sections/KontaktCta";
import { SiteFooter } from "@/components/sections/SiteFooter";

// Homepage-Entwurf (Schritt 1): Hero, Leistungen, Ablauf, Kontakt-CTA.
// Weitere Sections (Warum elou, Über mich, FAQ, echtes Kontaktformular) und
// die technische Ausbaustufe folgen erst nach Freigabe der Design-Variante.
export function HomeDraft({ variant }: { variant: "a" | "b" }) {
  return (
    <div data-theme={variant} className="flex min-h-screen flex-col bg-canvas text-ink">
      <DraftSwitcher active={variant} />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Leistungen />
        <Ablauf />
        <KontaktCta />
      </main>
      <SiteFooter />
    </div>
  );
}
