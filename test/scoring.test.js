/* Einfache Tests der Punktelogik – ohne externe Abhängigkeiten (node test/scoring.test.js). */
'use strict';

const assert = require('assert');
const { scoreRound, bidMade } = require('../js/scoring.js');

let passed = 0;
let failed = 0;

function check(name, actual, expected) {
  try {
    assert.strictEqual(actual, expected);
    passed++;
  } catch (e) {
    failed++;
    console.error(`  ✗ ${name}: erwartet ${expected}, war ${actual}`);
  }
}

// Gebot >= 1
check('Gebot 3 exakt erfüllt', scoreRound(5, 3, 3, 0), 60);
check('Gebot 3, 3 Stiche + 20 Bonus', scoreRound(5, 3, 3, 20), 80);
check('Gebot 3, nur 2 Stiche', scoreRound(5, 3, 2, 0), -10);
check('Gebot 2, 4 Stiche (2 zu viel)', scoreRound(6, 2, 4, 0), -20);
check('Gebot 3 verfehlt: Bonus zaehlt nicht', scoreRound(5, 3, 2, 50), -10);

// Null-Gebot
check('Null-Gebot in Runde 1 erfüllt', scoreRound(1, 0, 0, 0), 10);
check('Null-Gebot in Runde 10 erfüllt', scoreRound(10, 0, 0, 0), 100);
check('Null-Gebot in Runde 10 + Bonus', scoreRound(10, 0, 0, 30), 130);
check('Null-Gebot in Runde 7 verfehlt', scoreRound(7, 0, 2, 0), -70);
check('Null-Gebot verfehlt: Bonus zaehlt nicht', scoreRound(7, 0, 2, 50), -70);

// bidMade
check('bidMade true', bidMade(2, 2), true);
check('bidMade false', bidMade(0, 1), false);

console.log(`\nSkull King Punktelogik: ${passed} bestanden, ${failed} fehlgeschlagen.`);
process.exit(failed === 0 ? 0 : 1);
