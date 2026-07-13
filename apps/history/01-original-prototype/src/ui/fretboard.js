/**
 * Cartesian Fretboard Matrix
 * Renders a 6-string, 15-fret grid and illuminates notes based on active chords.
 */

// Tunings mapping (Low E to High E, so index 5 to 0 top to bottom)
// We render top (string 0) to bottom (string 5)
// Standard: High E=4, B=11, G=7, D=2, A=9, Low E=4
export const TUNINGS = {
    'standard': { notes: [4, 11, 7, 2, 9, 4], labels: ['e', 'B', 'G', 'D', 'A', 'E'] },
    'dropD':    { notes: [4, 11, 7, 2, 9, 2], labels: ['e', 'B', 'G', 'D', 'A', 'D'] },
    'openG':    { notes: [2, 11, 7, 2, 7, 2], labels: ['d', 'B', 'G', 'D', 'G', 'D'] },
    'dadgad':   { notes: [2, 9, 7, 2, 9, 2],  labels: ['d', 'A', 'G', 'D', 'A', 'D'] }
};

const NUM_FRETS = 15;

/**
 * Initializes the fretboard DOM structure.
 * @param {HTMLElement} containerElement - The DOM element to render the fretboard into.
 * @param {string} tuningKey - Key for TUNINGS object (default 'standard').
 */
export function initFretboard(containerElement, tuningKey = 'standard') {
    containerElement.innerHTML = ''; // Clear existing content
    
    const tuning = TUNINGS[tuningKey] || TUNINGS['standard'];
    const stringNotes = tuning.notes;
    const stringLabels = tuning.labels;

    const fretboardDiv = document.createElement('div');
    fretboardDiv.className = 'fretboard-matrix';

    // Fret numbers row
    const fretNumbersDiv = document.createElement('div');
    fretNumbersDiv.className = 'fret-numbers';

    // Empty spacer for string label column
    const labelSpacer = document.createElement('div');
    labelSpacer.className = 'string-label spacer';
    fretNumbersDiv.appendChild(labelSpacer);

    for (let f = 0; f <= NUM_FRETS; f++) {
        const marker = document.createElement('div');
        marker.className = 'fret-marker';
        marker.textContent = f === 0 ? '0' : f;
        fretNumbersDiv.appendChild(marker);
    }
    fretboardDiv.appendChild(fretNumbersDiv);

    // Strings
    for (let s = 0; s < stringNotes.length; s++) {
        const stringDiv = document.createElement('div');
        stringDiv.className = 'string-row';
        stringDiv.dataset.string = s;

        // String label
        const label = document.createElement('div');
        label.className = 'string-label';
        label.textContent = stringLabels[s];
        stringDiv.appendChild(label);

        const openNoteInt = stringNotes[s];
        // Calculate the base MIDI note for this string to pass to the Audio Engine.
        // Assuming Low E (string 5 in standard) is E2 (MIDI 40)
        // High E (string 0) is E4 (MIDI 64)
        let openMidi = 40; // Default fallback
        if (s === 5) openMidi = tuningKey === 'dropD' || tuningKey === 'openG' || tuningKey === 'dadgad' ? 38 : 40; // D2 or E2
        else if (s === 4) openMidi = tuningKey === 'openG' ? 43 : 45; // G2 or A2
        else if (s === 3) openMidi = 50; // D3
        else if (s === 2) openMidi = 55; // G3
        else if (s === 1) openMidi = tuningKey === 'dadgad' ? 57 : 59; // A3 or B3
        else if (s === 0) openMidi = tuningKey === 'dadgad' || tuningKey === 'openG' || tuningKey === 'dropD' && stringLabels[0] === 'd' ? 62 : 64; // D4 or E4
        if(stringLabels[0] === 'e') openMidi = 64; // Force E4

        // Exact MIDI calculation logic based on standard
        const standardMidiMap = [64, 59, 55, 50, 45, 40];
        let baseMidi = standardMidiMap[s];
        // Adjust based on the actual note integer vs standard tuning note integer
        const standardInt = TUNINGS['standard'].notes[s];
        let diff = openNoteInt - standardInt;
        if (diff > 6) diff -= 12;
        if (diff < -6) diff += 12;
        baseMidi += diff;

        for (let f = 0; f <= NUM_FRETS; f++) {
            const fretDiv = document.createElement('div');
            fretDiv.className = 'fret-cell';
            fretDiv.dataset.string = s;
            fretDiv.dataset.fret = f;
            
            const noteInt = (openNoteInt + f) % 12;
            fretDiv.dataset.note = noteInt;
            fretDiv.dataset.midi = baseMidi + f; // Store exact pitch for audio

            const noteLabel = document.createElement('span');
            noteLabel.className = 'note-label';
            fretDiv.appendChild(noteLabel);

            // Bind Audio Click
            fretDiv.addEventListener('click', () => {
                if (window.synth) {
                    window.synth.playNote(baseMidi + f);
                }
            });

            stringDiv.appendChild(fretDiv);
        }

        fretboardDiv.appendChild(stringDiv);
    }

    containerElement.appendChild(fretboardDiv);
}

/**
 * Updates the fretboard to illuminate specific notes.
 * @param {number[]} activeNoteInts - Array of active note integers (0-11).
 * @param {number|null} rootInt - The root note integer (0-11) for special styling.
 * @param {Object} noteNamesMap - Map of noteInt -> string label (e.g., {4: "E", 7: "G"}).
 * @param {number[]} [scaleNoteInts] - Optional array of scale note integers to show as muted dots.
 * @param {Object} [scaleNamesMap] - Optional map of scale noteInt -> string label.
 * @param {number[]} [allowedStrings] - Optional array of allowed string indices.
 * @returns {number} The count of illuminated fret positions (active chord tones only).
 */
export function updateFretboard(containerElement, activeNoteInts, rootInt, noteNamesMap = {}, scaleNoteInts = [], scaleNamesMap = {}, allowedStrings = [0, 1, 2, 3, 4, 5], fretRange = null) {
    if (!containerElement) return 0;
    const fretCells = containerElement.querySelectorAll('.fret-cell');
    let activeCount = 0;

    fretCells.forEach(cell => {
        const noteInt = parseInt(cell.dataset.note, 10);
        const stringIndex = parseInt(cell.dataset.string, 10);
        const fret = parseInt(cell.dataset.fret, 10);
        const label = cell.querySelector('.note-label');

        // Reset state
        cell.classList.remove('active', 'root', 'scale-tone');
        label.textContent = '';
        cell.style.opacity = '1';

        // Apply string constraint
        if (!allowedStrings.includes(stringIndex)) {
            cell.style.opacity = '0.1';
            return; // Skip processing this string entirely
        }

        // Apply fret range constraint (Eustress Perimeter)
        if (fretRange && (fret < fretRange[0] || fret > fretRange[1])) {
            cell.style.opacity = '0.1';
            return;
        }

        if (activeNoteInts.includes(noteInt)) {
            cell.classList.add('active');
            activeCount++;
            
            if (noteInt === rootInt) {
                cell.classList.add('root');
            }

            // Apply specific visual spelling if provided
            if (noteNamesMap && noteNamesMap[noteInt]) {
                label.textContent = noteNamesMap[noteInt];
            }
        } else if (scaleNoteInts.length > 0 && scaleNoteInts.includes(noteInt)) {
            // Show scale tones as muted dots (only if not already a chord tone)
            cell.classList.add('scale-tone');
            if (scaleNamesMap && scaleNamesMap[noteInt]) {
                label.textContent = scaleNamesMap[noteInt];
            }
        }
    });

    return activeCount;
}
