# ArrArr – Piraten ahoi 🏴‍☠️👑

Live: **https://ichiat.github.io/Project/pirate/**

Eine App, die die Punkte für das Kartenspiel **Skull King** zählt – für **Android und iOS**.

Umgesetzt als **installierbare PWA** (Progressive Web App): Sie läuft direkt im Browser,
funktioniert **komplett offline** und lässt sich auf iPhone und Android-Handys wie eine
echte App zum Homescreen hinzufügen. Kein App-Store-Konto nötig. Wer die App trotzdem als
natives Paket in die Stores bringen möchte, findet unten die Capacitor-Anleitung.

## Funktionen

- 2–8 Spieler*innen, Namen frei wählbar
- 10 Runden (Rundenzahl in den Einstellungen anpassbar)
- Pro Runde und Person: **Gebot**, **Stiche** und **Bonuspunkte** über große Touch-Buttons
- **Automatische Punktewertung** nach den offiziellen Skull-King-Regeln
- Live-**Punktetafel** mit allen Runden und der Gesamtsumme
- **Endstand** mit Siegertreppchen 🥇🥈🥉
- „Runde zurück“ zum Korrigieren, „Neues Spiel“ zum Zurücksetzen
- Spielstand wird automatisch gespeichert – App schließen und später weiterspielen

## Punkteregeln (Standard, Grandpa Beck's Edition)

| Situation | Punkte |
|---|---|
| Gebot ≥ 1 **genau** erfüllt | +20 je gebotenem Stich |
| Gebot ≥ 1 **verfehlt** | −10 je Stich Differenz |
| Gebot 0 **erfüllt** (0 Stiche) | +10 je Handkarte (= 10 × Rundennummer) |
| Gebot 0 **verfehlt** | −10 je Handkarte (= −10 × Rundennummer) |

**Bonuspunkte** (nur bei exakt erfülltem Gebot, als Summe pro Runde eintragen):
farbige 14 +10 · schwarze 14 (Jolly Roger) +20 · Skull King fängt Pirat +30 ·
Meerjungfrau fängt Skull King +50.

## Lokal starten

```bash
npm start        # startet http://localhost:8080/pirate/
npm test         # führt die Tests der Punktelogik aus
```

Alternativ jeden beliebigen statischen Webserver auf den Projektordner zeigen lassen
und `/pirate/` aufrufen.

## Auf dem Handy installieren (PWA)

1. App über HTTPS hosten (z. B. GitHub Pages, Netlify, Vercel – alles statisch).
2. **iOS (Safari):** Teilen-Symbol → „Zum Home-Bildschirm“.
3. **Android (Chrome):** Menü ⋮ → „App installieren“ / „Zum Startbildschirm hinzufügen“.

Danach startet Skull King als eigenständige App im Vollbild und funktioniert offline.

## Als native App für die Stores bauen (optional, mit Capacitor)

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap add android      # erzeugt das Android-Projekt (Android Studio nötig)
npx cap add ios          # erzeugt das iOS-Projekt (Xcode auf macOS nötig)
npx cap sync
npx cap open android     # bzw. npx cap open ios
```

`capacitor.config.json` (App-ID `de.skullking.punktezaehler`) liegt bereits im Projekt.

## Projektstruktur

```
index.html                    Weiterleitung von der Domain-Wurzel nach ./pirate/
pirate/index.html              App-Shell
pirate/css/styles.css          Design (Hell-/Dunkelmodus)
pirate/js/scoring.js           Punktelogik (getestet, ohne UI)
pirate/js/app.js               Oberfläche & Spielablauf
pirate/manifest.webmanifest    PWA-Manifest
pirate/sw.js                   Service Worker (Offline-Cache)
pirate/icons/                  App-Icons (SVG + PNG)
test/scoring.test.js          Tests der Punktelogik (gegen pirate/js/scoring.js)
serve.js                      Lokaler Testserver
```
