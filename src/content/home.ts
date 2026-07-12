// Platzhalter-Inhalte für den Homepage-Entwurf. Alle Texte sind TODO und vor Launch
// durch final abgestimmte, geprüfte Inhalte zu ersetzen.

export const hero = {
  eyebrow: "Energieberatung in Nordrhein-Westfalen", // TODO final formulieren
  headline: "Energieberatung, die sich Zeit nimmt.", // TODO: finaler Claim
  subheadline:
    "TODO Platzhalter: Persönliche, unabhängige Energieberatung für Wohn- und Nichtwohngebäude – gründlich ausgearbeitet statt anonym abgefertigt.",
  primaryCta: "Kostenloses Erstgespräch",
  secondaryCta: "Leistungen ansehen",
};

export type LeistungItem = {
  title: string;
  description: string;
  tag?: string;
};

export const leistungen: LeistungItem[] = [
  {
    title: "Wohngebäude (WG)",
    description:
      "TODO Platzhalter-Text: Energieberatung für Ein- und Mehrfamilienhäuser – von der Bestandsaufnahme bis zum förderfähigen Sanierungskonzept.",
  },
  {
    title: "Nichtwohngebäude (NWG)",
    description:
      "TODO Platzhalter-Text: Energetische Beratung für Gewerbe-, Büro- und Sonderimmobilien mit Blick auf Wirtschaftlichkeit und Vorschriften.",
  },
  {
    title: "Ökobilanz / LCA",
    description:
      "TODO Platzhalter-Text: Lebenszyklusanalyse zur Bewertung der ökologischen Auswirkungen über den gesamten Gebäudelebenszyklus.",
  },
  {
    title: "iSFP – Sanierungsfahrplan",
    description:
      "TODO Platzhalter-Text: Individueller Sanierungsfahrplan als klarer, förderfähiger Schritt-für-Schritt-Plan zur Modernisierung.",
    tag: "Förderfähig",
  },
  {
    title: "Fördermittelberatung",
    description:
      "TODO Platzhalter-Text: Orientierung durch den Förderdschungel von BAFA und KfW – welche Zuschüsse und Kredite wirklich passen.",
    tag: "BAFA / KfW",
  },
  {
    title: "Baubegleitung",
    description:
      "TODO Platzhalter-Text: Fachliche Begleitung während der Umsetzung – von der Ausführungskontrolle bis zum Verwendungsnachweis.",
  },
];

export type AblaufSchritt = {
  step: string;
  title: string;
  description: string;
};

export const ablauf: AblaufSchritt[] = [
  {
    step: "01",
    title: "Erstgespräch",
    description:
      "TODO Platzhalter-Text: Unverbindliches Kennenlernen – Ihre Situation, Ihr Gebäude und Ihre Ziele im Überblick.",
  },
  {
    step: "02",
    title: "Vor-Ort-Analyse",
    description:
      "TODO Platzhalter-Text: Gründliche Begehung und Bestandsaufnahme direkt am Gebäude als Grundlage für belastbare Empfehlungen.",
  },
  {
    step: "03",
    title: "Konzept / Fahrplan",
    description:
      "TODO Platzhalter-Text: Sauber ausgearbeitetes Sanierungskonzept bzw. iSFP inklusive Fördermöglichkeiten.",
  },
  {
    step: "04",
    title: "Umsetzungsbegleitung",
    description:
      "TODO Platzhalter-Text: Begleitung bei Ausschreibung, Umsetzung und Fördermittelabruf – auf Wunsch bis zum Abschluss.",
  },
];

export const kontaktCta = {
  headline: "Bereit für ein Gespräch ohne Verpflichtung?",
  text:
    "TODO Platzhalter: Schildern Sie kurz Ihr Vorhaben – Rückmeldung erfolgt persönlich, nicht automatisiert.",
  primaryCta: "Kostenloses Erstgespräch anfragen",
};
