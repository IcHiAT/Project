# Skull King Online

Skull King als Web-Multiplayer-Spiel: einen Raum erstellen, den Link an Freunde
schicken, fehlende Plätze mit Bots auffüllen — alles im Browser, kein
App-Store nötig.

## Lokal starten

```bash
npm install
npm start
```

Dann `http://localhost:3000` öffnen. Mit `PORT=xxxx npm start` lässt sich der
Port ändern.

## Online deployen (Render.com, kostenlos)

1. Auf [render.com](https://render.com) einloggen/registrieren und das GitHub-Repo
   verbinden.
2. "New Web Service" → dieses Repo auswählen. Render erkennt die `render.yaml`
   automatisch (Build: `npm install`, Start: `npm start`).
3. Nach dem ersten Deploy bekommst du eine dauerhafte URL
   (z. B. `https://skull-king-online.onrender.com`). Diese URL an Mitspieler
   schicken, fertig.
4. Jeder Push auf den verbundenen Branch deployt automatisch neu.

Hinweis: Der kostenlose Render-Plan legt den Dienst nach Inaktivität schlafen;
der erste Aufruf nach einer Pause kann ein paar Sekunden zum Aufwachen
brauchen.

## Spielen

- **Raum erstellen**: Name eingeben, Version wählen (Standard: Alte Version),
  Link mit "Link kopieren" teilen.
- **Beitreten**: Mitspieler öffnen den Link (`/r/CODE`) oder geben den Code auf
  der Startseite ein.
- **Bots**: Im Lobby-Bildschirm können fehlende Plätze mit Bots aufgefüllt
  werden (2–8 Spieler insgesamt).
- Nach einem Seiten-Reload wird automatisch versucht, dem eigenen Platz im
  selben Raum wieder beizutreten (via `localStorage`).

## Offline spielen (ohne Internet)

Die App ist eine PWA (Progressive Web App) und kann komplett offline gegen Bots
gespielt werden:

- **„Offline gegen Bots"** auf der Startseite startet ein Solo-Spiel, dessen
  Spiellogik vollständig im Browser läuft — kein Server, keine Verbindung nötig.
- **Als App installieren**: Die Seite einmal online öffnen, dann im Browser
  „Zum Startbildschirm hinzufügen" (Handy) bzw. das Installieren-Symbol in der
  Adressleiste (Desktop) wählen. Danach startet Skull King wie eine echte App
  und funktioniert auch ohne Netz.
- Ein Service-Worker cached die App beim ersten Online-Besuch, sodass sie sich
  später auch offline öffnen lässt.

**Was offline nicht geht:** Mit anderen echten Spielern spielen — dafür ist eine
Internetverbindung zwingend nötig, da die Geräte sich sonst nicht erreichen
können. Nur der Solo-Modus gegen Bots läuft ohne Netz.

Damit online und offline dieselbe (garantiert identische) Spiellogik läuft, sind
die Engine-Module (`server/game/*.js`) isomorph geschrieben: Der Server lädt sie
per `require`, der Browser über `/engine/*.js` als globale Skripte — eine
einzige Quelle für Regeln, Wertung und Bot-KI.

## Spielregeln — Annahmen & Quellen

Es gibt zwei wählbare Kartensätze, beide mit 66 Karten (passend zur bekannten
Rundenanzahl: 10 Runden bis 6 Spieler, 9 Runden bei 7, 8 Runden bei 8
Spielern):

| | Alte Version (Standard) | Neue Version |
|---|---|---|
| Farbkarten | 4 Farben, Werte 1–14 | 4 Farben, Werte 1–13 |
| Fluchtkarten | 2 | 5 |
| Piraten | 5 | 5 |
| Meerjungfrauen | 2 | 2 |
| Tigress (wählbar: Pirat/Flucht) | – | 1 |
| Skull King | 1 | 1 |
| **Gesamt** | **66** | **66** |

Stich-Hierarchie: Fluchtkarten verlieren immer (außer alle spielen Flucht,
dann gewinnt die zuerst gespielte) < Farbkarte der angespielten Farbe <
Trumpf (Totenkopf/Jolly Roger, höchster Wert gewinnt) < Pirat (zuerst
gespielter Pirat gewinnt bei mehreren) < Skull King < Meerjungfrau schlägt
den Skull King. Trumpf darf immer gespielt werden, auch wenn die angespielte
Farbe noch auf der Hand ist; Sonderkarten (Flucht/Pirat/Meerjungfrau/Skull
King/Tigress) dürfen ebenfalls jederzeit gespielt werden.

Punktewertung pro Runde:
- Ansage korrekt getroffen: 20 Punkte pro angesagtem Stich, bei Ansage "0"
  stattdessen 10 Punkte pro Rundennummer.
- Ansage verfehlt: −10 Punkte pro Differenz zwischen Ansage und tatsächlich
  gewonnenen Stichen.
- Bonuspunkte (nur wenn die Ansage getroffen wurde): +10 für eine gewonnene
  farbige 14, +20 für die schwarze 14 (nur alte Version, da die neue Version
  keine 14er kennt); +30 wenn ein Pirat den Skull King im selben Stich
  schlägt; +50 wenn eine Meerjungfrau den Skull King schlägt.

Diese Bonuswerte (30/50/10/20) sind die am häufigsten zitierten Werte aus
öffentlich zugänglichen Regelquellen. Falls dein physisches Regelheft davon
abweicht, sag einfach Bescheid — die Werte stehen zentral in
`server/game/rules.js` und lassen sich leicht anpassen.

**Nicht implementiert** (bewusste Scope-Entscheidung, auf Wunsch nachrüstbar):
Kraken- und Beute-(Loot-)Karten aus der erweiterten "Legendary"-Edition, sowie
Zusatz-Bonuspunkte für "Skull King fängt Piraten" bzw. "Meerjungfrau fängt
Piraten" (uneinheitlich dokumentiert, daher weggelassen statt geraten).

## Architektur

- `server/game/cards.js` — Kartendeck-Erzeugung für beide Editionen.
- `server/game/rules.js` — Stich-Auflösung und Punkteberechnung.
- `server/game/gameState.js` — Zustandsmaschine pro Raum (Lobby → Ansage →
  Ausspielen → Rundenende → nächste Runde/Spielende).
- `server/game/bot.js` — Heuristische Bot-Ansagen/-Spielzüge.
- `server/server.js` — Express + Socket.IO, Raumverwaltung, Events; liefert die
  Engine zusätzlich unter `/engine` für den Browser aus.
- `client/localGame.js` — Lokaler Transport-Adapter: bildet die Socket-
  Schnittstelle nach und treibt eine Engine-Instanz im Browser (Offline-Solo).
- `client/service-worker.js`, `client/manifest.json` — PWA (Offline-Caching,
  Installierbarkeit).
- `client/` — Statisches Frontend (kein Build-Schritt).
