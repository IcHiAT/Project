# Skull King in den Syncthing-Projektordner umziehen

Kurzfassung der Ausgangslage: Die Sachen wie Proxmox und OpenWrt liegen als
normale Dateien im Syncthing-Ordner und sind dadurch auf Handy, PC und
Mini-Server. Dieses Projekt hier (Skull King / `pirate/`) liegt dagegen auf
GitHub und existiert auf dem Handy nur als lokale Arbeitskopie ausserhalb des
Syncthing-Ordners. Deshalb wird es nirgends mitgesynct.

Der Umzug besteht darum aus einem Schritt: das Repo **einmal in den
Syncthing-Ordner klonen**. Syncthing verteilt es danach von selbst auf alle
Geraete. Am einfachsten passiert das am PC – wer danach mit Git arbeitet, ist
davon unabhaengig.

Repo: <https://github.com/IcHiAT/Project>

## Rollenverteilung

* **Git-Geraet: das Handy.** Von dort kommen `commit`, `pull`, `push` und
  Branch-Wechsel.
* **PC und Mini-Server: nur Ablage.** Sie halten die Dateien, fuehren aber
  keine Git-Befehle in diesem Ordner aus.

Der Grund steht weiter unten unter "Die eine Regel".

## Schritt 1 – Handy-Ordner erst anschauen, nicht loeschen

Bevor irgendetwas weggeraeumt wird: pruefen, ob in der bisherigen Kopie auf dem
Handy Aenderungen liegen, die noch nicht auf GitHub sind.

* Ordner auf dem Handy suchen (Dateimanager, Suche nach `pirate` oder
  `scoring.js`) und den vollstaendigen Pfad notieren.
* Ist dort ein versteckter Ordner `.git` drin, ist es eine echte
  Arbeitskopie – dann steckt dort moeglicherweise noch nicht gepushter Stand.
  `git status` und `git log origin/HEAD..HEAD` zeigen es.
* Im Zweifel den ganzen Ordner vorher einmal in den Syncthing-Ordner
  **kopieren** (nicht verschieben), z. B. nach `Projekte/_backup-handy-skullking/`.
  Dann liegt er auch auf dem PC und kann in Ruhe verglichen werden.

Geloescht wird der alte Handy-Ordner erst in Schritt 4.

## Schritt 2 – Einmalig in den Syncthing-Ordner klonen (am PC)

Pfad zum Syncthing-Ordner anpassen, der Rest bleibt gleich:

```bash
cd /pfad/zum/syncthing/Projekte
git clone https://github.com/IcHiAT/Project.git skullking
```

Danach liegt das Projekt unter `Projekte/skullking/` und damit an derselben
Stelle wie Proxmox, OpenWrt und der Rest. Das ist der letzte Git-Befehl, der
auf dem PC in diesem Ordner laeuft.

## Schritt 3 – Syncthing arbeiten lassen

In der Syncthing-Oberflaeche warten, bis der Ordner auf allen Geraeten wieder
"Up to Date" meldet. Auf dem Handy taucht `Projekte/skullking/` dann von
allein auf – inklusive `.git`, das Handy hat damit ein vollwertiges Repo.

## Schritt 4 – Alten Handy-Ordner aufraeumen

Erst wenn der neue Ordner auf dem Handy sichtbar ist **und** eventuelle
Aenderungen aus Schritt 1 gesichert sind:

* die Git-App bzw. das Terminal auf dem Handy auf den neuen Pfad unter
  `Projekte/skullking/` umstellen,
* den alten, nicht gesyncten Projektordner auf dem Handy loeschen.

Sonst gibt es dauerhaft zwei Skull-King-Ordner, die auseinanderlaufen.

## Die eine Regel: Git nur vom Handy aus

Syncthing synct auch den versteckten `.git`-Ordner mit. Das ist hier
erwuenscht – nur dadurch kann das Handy ueberhaupt committen –, hat aber eine
Bedingung:

**`git commit`, `git pull`, `git push` und Branch-Wechsel immer nur auf dem
Handy ausfuehren.**

Laufen Git-Operationen auf zwei Geraeten, oder synct Syncthing mitten in eine
Operation hinein, entstehen `.sync-conflict-…`-Dateien innerhalb von `.git`
und das Repo ist beschaedigt. Dateien lesen und bearbeiten ist auf jedem
Geraet unproblematisch – nur die Git-Befehle gehoeren auf ein Geraet.

Praktisch heisst das: auf dem Handy committen und pushen, dann kurz warten,
bis Syncthing "Up to Date" meldet, bevor an einem anderen Geraet weiter an den
Dateien gearbeitet wird. Wer stattdessen ueber die GitHub-Weboberflaeche etwas
aendert, holt es anschliessend auf dem Handy mit `git pull` und laesst es von
dort verteilen.

## `.stignore` im Syncthing-Ordner

In die Datei `.stignore` **im Wurzelverzeichnis des Syncthing-Ordners** (nicht
in diesem Projektordner – dort wird sie nicht gelesen) gehoeren die Ordner, die
nie gesynct werden muessen:

```
skullking/node_modules
skullking/android
skullking/ios
```

`skullking/.git` darf **nicht** eingetragen werden. Ohne `.git` bekommt das
Handy nur die Dateien, aber kein Repo – und genau dort soll ja Git laufen.

## Wenn doch mal `.sync-conflict`-Dateien auftauchen

* Ausserhalb von `.git`: die unerwuenschte Version loeschen, fertig.
* Innerhalb von `.git`: nicht reparieren. Zuerst pruefen, ob lokal noch etwas
  Ungepushtes drin war, dann den Ordner `skullking/` loeschen und nach
  Schritt 2 frisch klonen – auf GitHub liegt der vollstaendige Stand.
