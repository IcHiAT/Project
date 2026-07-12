import type { Metadata } from "next";
import { Inter, Space_Grotesk, Source_Serif_4 } from "next/font/google";
import "./globals.css";

// Body-Schrift, in beiden Entwurfs-Varianten identisch (Lesbarkeit).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Headline-Schrift Variante A ("Nordlicht"): geometrisch-technisch.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

// Headline-Schrift Variante B ("Ruhepunkt"): humanistische Serife, warm.
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "elou Energieberatung – Entwurf",
  description:
    "Interner Homepage-Entwurf von elou Energieberatung (Platzhalter-Inhalte, nicht für die Öffentlichkeit).",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${inter.variable} ${spaceGrotesk.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink">
        {children}
      </body>
    </html>
  );
}
