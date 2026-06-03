import { getDiatonicChords } from './diatonic.js';
import { CHORD_INTERVAL_NAMES } from './engine.js';

const modes = ['major', 'minor', 'dorian', 'mixolydian', 'phrygian', 'lydian'];
const rootInt = 0;
let missing = new Set();

modes.forEach(mode => {
    const chords = getDiatonicChords(rootInt, mode, true, true);
    chords.forEach(c => {
        if (!CHORD_INTERVAL_NAMES[c.quality]) {
            missing.add(c.quality);
        }
    });
});

console.log("Missing Qualities:", Array.from(missing));
