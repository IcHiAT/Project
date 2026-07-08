/*
 * Skull King – Punktelogik (Standard-Regeln, Grandpa Beck's Edition)
 *
 * Ablauf: 10 Runden. In Runde N bekommt jede*r Spieler*in N Karten.
 * Vor jeder Runde wird ein Gebot (Anzahl Stiche) abgegeben.
 *
 * Wertung pro Runde:
 *   - Gebot >= 1 und genau erfüllt:  +20 Punkte je gebotenem Stich  (+ Bonus)
 *   - Gebot >= 1 und verfehlt:       -10 Punkte je Stich Differenz   (kein Bonus)
 *   - Gebot = 0 und erfüllt (0 Stiche): +10 Punkte je Handkarte (= 10 * Rundennummer) (+ Bonus)
 *   - Gebot = 0 und verfehlt:            -10 Punkte je Handkarte (= -10 * Rundennummer) (kein Bonus)
 *
 * Bonuspunkte (nur wenn das Gebot exakt erfüllt wurde):
 *   - Jede gefangene farbige 14:            +10
 *   - Gefangene schwarze 14 (Jolly Roger):  +20
 *   - Skull King fängt einen Piraten:       +30 je Pirat
 *   - Meerjungfrau fängt den Skull King:    +50
 * Der Bonus wird als Summe pro Runde erfasst und hier nur bei erfülltem Gebot gutgeschrieben.
 */

'use strict';

/**
 * Berechnet die Punkte einer einzelnen Runde für eine*n Spieler*in.
 * @param {number} round  Rundennummer (1..N), entspricht der Anzahl Handkarten.
 * @param {number} bid    Gebot (>= 0).
 * @param {number} tricks Tatsächlich gewonnene Stiche (>= 0).
 * @param {number} bonus  Bonuspunkte aus Fängen/14ern (Summe, Vielfaches von 10).
 * @returns {number} Punkte für diese Runde (kann negativ sein).
 */
function scoreRound(round, bid, tricks, bonus) {
  round = Number(round) || 0;
  bid = Number(bid) || 0;
  tricks = Number(tricks) || 0;
  bonus = Number(bonus) || 0;

  if (bid === 0) {
    if (tricks === 0) {
      return 10 * round + bonus; // Null-Gebot erfüllt
    }
    return -10 * round; // Null-Gebot verfehlt, kein Bonus
  }

  if (bid === tricks) {
    return 20 * bid + bonus; // Gebot exakt erfüllt
  }

  return -10 * Math.abs(bid - tricks); // Gebot verfehlt, kein Bonus
}

/**
 * Ob das Gebot in dieser Runde erfüllt wurde (für UI-Hervorhebung).
 */
function bidMade(bid, tricks) {
  return (Number(bid) || 0) === (Number(tricks) || 0);
}

// Als ES-Modul und für Node-Tests exportieren.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { scoreRound, bidMade };
}
