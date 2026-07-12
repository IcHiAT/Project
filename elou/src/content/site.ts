// Zentrale Stammdaten der Seite. Später von Unterseiten (z.B. /energieberatung/duesseldorf)
// wiederverwendbar, damit Name, Region und Kontaktangaben nur an einer Stelle gepflegt werden.

export const site = {
  name: "elou Energieberatung",
  claim: "Energieberatung, die sich Zeit nimmt.",
  region: "Nordrhein-Westfalen",
  // TODO: echte Kontaktdaten ergänzen (aktuell Platzhalter)
  email: "info@elou-energieberatung.de",
  phone: "+49 (0) 000 000000",
} as const;

export const nav = [
  { label: "Leistungen", href: "#leistungen" },
  { label: "Ablauf", href: "#ablauf" },
  { label: "Kontakt", href: "#kontakt" },
] as const;
