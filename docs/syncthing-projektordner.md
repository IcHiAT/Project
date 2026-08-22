# Skull King in den Syncthing-Projektordner umziehen

Kurzfassung der Ausgangslage: Die Sachen wie Proxmox und OpenWrt liegen als
normale Dateien im Syncthing-Ordner und sind dadurch auf Handy, PC und
Mini-Server. Dieses Projekt hier (Skull King / `pirate/`) liegt dagegen auf
GitHub und existiert auf dem Handy nur als lokale Arbeitskopie, die eine
App dort angelegt hat – ausserhalb des Syncthing-Ordners. Deshalb wird es
nirgends mitgesynct.

Der Umzug besteht darum aus genau einem Schritt: das Repo **einmal auf dem PC
in den Syncthing-Ordner klonen**. Syncthing verteilt es danach von selbst auf
Handy und Mini-Server. Auf dem Handy muss nichts verschoben werden.

Repo: <https://github.com/IcHiAT/Project>

## Schritt 1 – Handy-Ordner erst anschauen, nicht loeschen

Bevor irgendetwas weggeraeumt wird: pruefen, ob in der Kopie auf dem Handy
Aenderungen liegen, die noch nicht auf GitHub sind.

* Ordner auf dem Handy suchen (Dateimanager, Suche nach `pirate` oder
  `scoring.js`) und den vollstaendigen Pfad notieren.
* Ist dort ein versteckter Ordner `.git` drin, ist es eine echte
  Arbeitskopie – dann steckt dort moeglicherweise noch nicht gepushter Stand.
* Im Zweifel den ganzen Ordner vorher einmal in den Syncthing-Ordner
  **kopieren** (nicht verschieben), z. B. nach `Projekte/_backup-handy-skullking/`.
  Dann liegt er auf dem PC und kann dort in Ruhe verglichen werden.

Geloescht wird der alte Handy-Ordner erst in Schritt 4.

## Schritt 2 – Auf dem PC in den Syncthing-Ordner klonen

Pfad zum Syncthing-Ordner anpassen, der Rest bleibt gleich:

```bash
cd /pfad/zum/syncthing/Projekte
git clone https://github.com/IcHiAT/Project.git skullking
```

Danach liegt das Projekt unter `Projekte/skullking/` und damit an derselben
Stelle wie Proxmox, OpenWrt und der Rest.

## Schritt 3 – Syncthing arbeiten lassen

In der Syncthing-Oberflaeche warten, bis der Ordner auf allen Geraeten wieder
"Up to Date" meldet. Auf dem Handy taucht `Projekte/skullking/` dann von
allein auf.

## Schritt 4 – Alten Handy-Ordner aufraeumen

Erst wenn der neue Ordner auf dem Handy sichtbar ist **und** eventuelle
Aenderungen aus Schritt 1 gesichert sind: den alten, nicht gesyncten
Projektordner auf dem Handy loeschen. Sonst gibt es dauerhaft zwei
Skull-King-Ordner, die auseinanderlaufen.

## Die eine Regel danach: Git nur vom PC aus

Syncthing synct auch den versteckten `.git`-Ordner mit. Das ist erwuenscht –
so ist die Historie ueberall da –, hat aber eine Bedingung:

**`git commit`, `git pull`, `git push` und Branch-Wechsel immer nur auf einem
Geraet ausfuehren (hier: der PC).**

Laufen Git-Operationen auf zwei Geraeten gleichzeitig, oder synct Syncthing
mitten in eine Operation hinein, entstehen `.sync-conflict-…`-Dateien
innerhalb von `.git` und das Repo ist beschaedigt. Dateien lesen und
bearbeiten ist auf jedem Geraet unproblematisch – nur die Git-Befehle gehoeren
auf ein Geraet.

Praktisch heisst das: auf dem PC committen und pushen, dann warten, bis
Syncthing fertig ist. Wer stattdessen ueber die GitHub-Weboberflaeche etwas
aendert, holt es anschliessend auf dem PC mit `git pull` und laesst es von
dort verteilen.

## Optional: `.git` gar nicht mitsyncen

Wer die Historie nicht auf allen Geraeten braucht, kann sie aus dem Sync
ausnehmen. Dazu in die Datei `.stignore` **im Wurzelverzeichnis des
Syncthing-Ordners** (nicht in diesem Projektordner – dort wird sie nicht
gelesen) eintragen:

```
skullking/.git
```

Dann liegen die Projektdateien ueberall, das Repo selbst aber nur auf dem PC.
Das ist die konfliktsicherste Variante, dafuer ist auf Handy und Mini-Server
keine Git-Historie verfuegbar.

Ebenfalls sinnvoll, unabhaengig davon – diese Ordner brauchen nie gesynct zu
werden:

```
skullking/node_modules
skullking/android
skullking/ios
```

## Wenn doch mal `.sync-conflict`-Dateien auftauchen

* Ausserhalb von `.git`: die unerwuenschte Version loeschen, fertig.
* Innerhalb von `.git`: nicht reparieren. Den Ordner `skullking/` loeschen und
  nach Schritt 2 frisch klonen – auf GitHub liegt der vollstaendige Stand.
  Vorher pruefen, ob lokal noch etwas Ungepushtes drin war.
