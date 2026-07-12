# elou Energieberatung – Website

Next.js (App Router) + TypeScript + Tailwind CSS. Aktueller Stand: **Homepage-Entwurf
mit zwei Design-Varianten**, mit Platzhaltertexten (alle mit `TODO` markiert), zur
Abstimmung von Look & Feel. Die technische Ausbaustufe (Unterseiten, SEO, echtes
Kontaktformular/API) folgt erst nach Freigabe einer Variante.

## Entwurf ansehen

```bash
npm install
npm run dev
```

- `/` – Übersicht, Auswahl zwischen den zwei Design-Varianten
- `/entwurf-a` – Variante A „Nordlicht" (Anthrazit/Grün, geometrische Sans-Serif)
- `/entwurf-b` – Variante B „Ruhepunkt" (Sand/Petrol, Serifen-Headlines)

Beide Routen zeigen dieselben Inhalte (Hero, Leistungen, Ablauf, Kontakt-CTA), nur
Farb-/Typo-Theme unterscheidet sich. Die dünne Leiste oben ("Entwurfsansicht: …") ist
reine Review-Hilfe für die Auswahlphase und wird entfernt, sobald eine Variante final
feststeht.

## Projektstruktur

```
src/app/
  layout.tsx           Root-Layout, lädt alle Fonts (Inter, Space Grotesk, Source Serif 4)
  globals.css           Design-Tokens je Variante (data-theme="a" | "b")
  page.tsx               Entwurfs-Übersicht ("/")
  entwurf-a/page.tsx      Variante A
  entwurf-b/page.tsx      Variante B
src/components/
  HomeDraft.tsx           Zusammensetzung der Homepage-Sections
  DraftSwitcher.tsx       Review-Hilfsleiste (temporär)
  sections/               Hero, Leistungen, Ablauf, KontaktCta, SiteHeader, SiteFooter
  ui/                     Button, Container, SectionHeading
src/content/
  site.ts                 Stammdaten (Name, Region, Kontakt, Navigation)
  home.ts                 Platzhalter-Copy der Homepage-Sections
```

`src/content/*` ist bewusst von den Komponenten getrennt, damit Texte später einfach
ausgetauscht und für regionale Unterseiten (z.B. `/energieberatung/duesseldorf`)
wiederverwendet werden können.

## Produktion (VPS / Node)

```bash
npm run build
npm run start
```

Für den Betrieb hinter einem Nginx-Reverse-Proxy: `npm run start` an einen internen
Port binden (z.B. per `PORT=3000`) und in Nginx per `proxy_pass` weiterleiten.
Umgebungsvariablen (z.B. für die spätere Formular-API) über `.env` einbinden –
`.env*` ist in `.gitignore` bereits ausgeschlossen.

## Offene Punkte (bewusst noch nicht umgesetzt)

- Weitere Sections: „Warum elou", „Über mich", FAQ, echtes Kontaktformular, Footer-Rechtstexte
- Regionale Unterseiten (Städte in NRW)
- SEO-Ausbau (Open Graph, strukturierte Metadaten je Seite)
- Formular-Versand als API-Route (aktuell nur `mailto:`-Platzhalter)
- Echte Texte, Logo, Bilder anstelle der `TODO`-Platzhalter
