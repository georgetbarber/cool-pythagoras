/**
 * The String Allocation Engine (Voicings)
 * Calculates the exact physical fretboard geometry for chords based on resource constraints.
 */

/**
 * Returns a filtered map of string index -> note integer, representing the optimal voicing.
 * @param {number[]} activeNoteInts - All notes in the chord
 * @param {number} rootInt - The root note
 * @param {string} mode - 'triad' (3 strings), 'drop2' (4 strings), or 'full' (6 strings)
 * @param {Object} fretboardData - Unused legacy param
 * @param {number} targetFret - Target fret area to anchor the voicing
 * @returns {Object} Object with allowedStrings, notes, and fretRange
 */
export function calculateVoicing(activeNoteInts, rootInt, mode, fretboardData = null, targetFret = null) {
    let filteredNotes = [...activeNoteInts];

    // Selective Omission for Extended Chords
    // We want to preserve the defining extension (last note in the array), the 3rd, and the 7th.
    if (activeNoteInts.length >= 5) {
        // Always drop the Perfect 5th first
        const perfectFifth = (rootInt + 7) % 12;
        filteredNotes = filteredNotes.filter(n => n !== perfectFifth);
    }
    
    if (activeNoteInts.length >= 6) {
        // Drop the 11th (Perfect 4th) for 13th chords to avoid clash with major 3rd, unless it's a minor/sus chord (we'll just drop interval 5)
        const perfectEleventh = (rootInt + 5) % 12;
        // Keep it only if it's the defining extension (the last element)
        if (activeNoteInts[activeNoteInts.length - 1] !== perfectEleventh) {
            filteredNotes = filteredNotes.filter(n => n !== perfectEleventh);
        }
    }
    
    if (activeNoteInts.length >= 7) {
        // Drop the 9th for 13th chords to get it down to a 4-note grip (Root, 3, 7, 13)
        const majorNinth = (rootInt + 2) % 12;
        if (activeNoteInts[activeNoteInts.length - 1] !== majorNinth) {
            filteredNotes = filteredNotes.filter(n => n !== majorNinth);
        }
    }

    let allowedStrings = [0, 1, 2, 3, 4, 5];
    
    if (mode === 'triad') {
        allowedStrings = [1, 2, 3];
        // If it's an extended chord, a triad grip is impossible without losing the extension.
        // We will just keep the first 3 prioritized notes (Root, 3rd, extension)
        if (filteredNotes.length > 3) {
            filteredNotes = [filteredNotes[0], filteredNotes[1], filteredNotes[filteredNotes.length - 1]];
        }
    } else if (mode === 'drop2') {
        allowedStrings = [1, 2, 3, 4];
        if (filteredNotes.length > 4) {
            // Keep Root, 3, 7, and highest extension
            filteredNotes = [filteredNotes[0], filteredNotes[1], filteredNotes[2], filteredNotes[filteredNotes.length - 1]];
        }
    }

    // Eustress Perimeter (4-fret span constraint)
    let baseFret = targetFret;
    if (baseFret === null) {
        // Heuristic: Find the root note on the Low E (string 5) or A (string 4)
        // Standard tuning: Low E is note 4, A is note 9.
        let fretOnE = (rootInt - 4 + 12) % 12;
        let fretOnA = (rootInt - 9 + 12) % 12;
        
        // Prefer A string if E string fret is too high up the neck
        baseFret = fretOnE;
        if (fretOnA > 0 && fretOnA < fretOnE && fretOnE > 8) {
            baseFret = fretOnA;
        }
        
        // Prevent going off the nut
        if (baseFret === 0) baseFret = 1;
    }

    // The boundary is a strict 4-fret constraint
    const fretRange = [Math.max(0, baseFret - 1), Math.max(3, baseFret + 2)];

    return { allowedStrings, notes: filteredNotes, fretRange };
}
