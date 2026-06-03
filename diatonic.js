const majorIntervals = [0, 2, 4, 5, 7, 9, 11];
const minorIntervals = [0, 2, 3, 5, 7, 8, 10];

const majorNumerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
const majorQualities = ['Major', 'Minor', 'Minor', 'Major', 'Major', 'Minor', 'Diminished'];

const minorNumerals = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
const minorQualities = ['Minor', 'Diminished', 'Major', 'Minor', 'Minor', 'Major', 'Major'];

const noteNamesSharps = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const noteNamesFlats = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

/**
 * Generates an array of diatonic chords for a given root note and key type.
 *
 * @param {number} rootInt - The integer representation of the root note (0-11, where 0 is C).
 * @param {boolean} isMinor - True if the key is minor, false if major.
 * @param {boolean} useHarmonicMinorV - If true and isMinor is true, toggles the 'v' chord to a Major 'V'.
 * @returns {Array} Array of chord objects containing romanNumeral, quality, rootInt, and rootSpelling.
 */
export function getDiatonicChords(rootInt, mode, useHarmonicMinorV = false, includeForeign = false) {
    const chords = [];
       const majorChordDefs = [
        // DIATONIC (Focus)
        { interval: 0, numeral: 'I', quality: 'Major', functionWord: 'Tonic', state: 'Stability', rationale: 'The Sovereign Centre.', isForeign: false, is7th: false, isFocus: true },
        { interval: 0, numeral: 'Imaj7', quality: 'Major 7', functionWord: 'Tonic', state: 'Stability', rationale: 'The Sovereign Centre.', isForeign: false, is7th: true, isFocus: true },
        { interval: 5, numeral: 'IV', quality: 'Major', functionWord: 'Subdominant', state: 'Departure', rationale: 'The subdominant.', isForeign: false, is7th: false, isFocus: true },
        { interval: 5, numeral: 'IVmaj7', quality: 'Major 7', functionWord: 'Subdominant', state: 'Departure', rationale: 'The subdominant.', isForeign: false, is7th: true, isFocus: true },
        { interval: 7, numeral: 'V', quality: 'Major', functionWord: 'Dominant', state: 'Tension', rationale: 'The undisputed dominant engine.', isForeign: false, is7th: false, isFocus: true },
        { interval: 7, numeral: 'V7', quality: 'Dominant 7', functionWord: 'Dominant', state: 'Maximum Tension', rationale: 'The dominant engine.', isForeign: false, is7th: true, isFocus: true },
        { interval: 9, numeral: 'vi', quality: 'Minor', functionWord: 'Submediant', state: 'Stability', rationale: 'The relative minor.', isForeign: false, is7th: false, isFocus: true },
        { interval: 9, numeral: 'vi7', quality: 'Minor 7', functionWord: 'Submediant', state: 'Stability', rationale: 'The relative minor.', isForeign: false, is7th: true, isFocus: true },
        
        // DIATONIC (Non-Focus)
        { interval: 2, numeral: 'ii', quality: 'Minor', functionWord: 'Supertonic', state: 'Departure', rationale: 'Primary pre-dominant.', isForeign: false, is7th: false, isFocus: false },
        { interval: 2, numeral: 'ii7', quality: 'Minor 7', functionWord: 'Supertonic', state: 'Departure', rationale: 'Primary pre-dominant.', isForeign: false, is7th: true, isFocus: false },
        { interval: 4, numeral: 'iii', quality: 'Minor', functionWord: 'Mediant', state: 'Weak Departure', rationale: 'Marginal passing chord.', isForeign: false, is7th: false, isFocus: false },
        { interval: 4, numeral: 'iii7', quality: 'Minor 7', functionWord: 'Mediant', state: 'Weak Departure', rationale: 'Marginal passing chord.', isForeign: false, is7th: true, isFocus: false },
        { interval: 11, numeral: 'vii°', quality: 'Diminished', functionWord: 'Leading Tone', state: 'High Tension', rationale: 'Marginal; largely superseded by V7.', isForeign: false, is7th: false, isFocus: false },
        { interval: 11, numeral: 'vii°7', quality: 'Half-diminished 7', functionWord: 'Leading Tone', state: 'High Tension', rationale: 'Marginal leading tone.', isForeign: false, is7th: true, isFocus: false },

        // FOREIGN / CHROMATIC OVERRIDE
        // Secondary Dominants
        { interval: 2, numeral: 'II', quality: 'Major', functionWord: 'Secondary Dom', state: 'Engineered Tension', rationale: 'V/V.', isForeign: true, is7th: false, isFocus: false },
        { interval: 2, numeral: 'II7', quality: 'Dominant 7', functionWord: 'Secondary Dom', state: 'Engineered Tension', rationale: 'V7/V.', isForeign: true, is7th: true, isFocus: false },
        { interval: 9, numeral: 'VI', quality: 'Major', functionWord: 'Secondary Dom', state: 'Engineered Tension', rationale: 'V/ii.', isForeign: true, is7th: false, isFocus: false },
        { interval: 9, numeral: 'VI7', quality: 'Dominant 7', functionWord: 'Secondary Dom', state: 'Engineered Tension', rationale: 'V7/ii.', isForeign: true, is7th: true, isFocus: false },
        { interval: 4, numeral: 'III', quality: 'Major', functionWord: 'Secondary Dom', state: 'Engineered Tension', rationale: 'V/vi.', isForeign: true, is7th: false, isFocus: false },
        { interval: 4, numeral: 'III7', quality: 'Dominant 7', functionWord: 'Secondary Dom', state: 'Engineered Tension', rationale: 'V7/vi.', isForeign: true, is7th: true, isFocus: false },
        { interval: 0, numeral: 'I (Dom)', quality: 'Major', functionWord: 'Secondary Dom', state: 'Engineered Tension', rationale: 'V/IV.', isForeign: true, is7th: false, isFocus: false },
        { interval: 0, numeral: 'I7', quality: 'Dominant 7', functionWord: 'Secondary Dom', state: 'Engineered Tension', rationale: 'V7/IV.', isForeign: true, is7th: true, isFocus: false },
        // Modal Mixtures
        { interval: 5, numeral: 'iv', quality: 'Minor', functionWord: 'Subdominant', state: 'Melancholic Tension', rationale: 'Borrowed minor subdominant.', isForeign: true, is7th: false, isFocus: false },
        { interval: 5, numeral: 'iv7', quality: 'Minor 7', functionWord: 'Subdominant', state: 'Melancholic Tension', rationale: 'Borrowed minor subdominant.', isForeign: true, is7th: true, isFocus: false },
        { interval: 8, numeral: '♭VI', quality: 'Major', functionWord: 'Submediant', state: 'Theatrical Tension', rationale: 'Borrowed major submediant.', isForeign: true, is7th: false, isFocus: false },
        { interval: 8, numeral: '♭VImaj7', quality: 'Major 7', functionWord: 'Submediant', state: 'Theatrical Tension', rationale: 'Borrowed major submediant.', isForeign: true, is7th: true, isFocus: false },
        { interval: 3, numeral: '♭III', quality: 'Major', functionWord: 'Mediant', state: 'Theatrical Tension', rationale: 'Borrowed mediant.', isForeign: true, is7th: false, isFocus: false },
        { interval: 3, numeral: '♭IIImaj7', quality: 'Major 7', functionWord: 'Mediant', state: 'Theatrical Tension', rationale: 'Borrowed mediant.', isForeign: true, is7th: true, isFocus: false },
        { interval: 10, numeral: '♭VII', quality: 'Major', functionWord: 'Subtonic', state: 'Departure', rationale: 'Borrowed subtonic.', isForeign: true, is7th: false, isFocus: false },
        { interval: 10, numeral: '♭VII7', quality: 'Dominant 7', functionWord: 'Subtonic', state: 'Departure', rationale: 'Borrowed subtonic.', isForeign: true, is7th: true, isFocus: false },
        // Suspensions
        { interval: 7, numeral: 'Vsus4', quality: 'Sus4', functionWord: 'Suspension', state: 'Tension', rationale: 'Delays dominant resolution.', isForeign: true, is7th: false, isExtended: false, isFocus: false },
        { interval: 7, numeral: 'V7sus4', quality: 'Dominant 7 sus4', functionWord: 'Suspension', state: 'Tension', rationale: 'Delays dominant resolution.', isForeign: true, is7th: true, isExtended: false, isFocus: false },
        { interval: 0, numeral: 'Isus4', quality: 'Sus4', functionWord: 'Suspension', state: 'Tension', rationale: 'Delays tonic resolution.', isForeign: true, is7th: false, isExtended: false, isFocus: false },
        { interval: 0, numeral: 'Imaj7sus4', quality: 'Major 7 sus4', functionWord: 'Suspension', state: 'Tension', rationale: 'Delays tonic resolution.', isForeign: true, is7th: true, isExtended: false, isFocus: false },
        
        // EXTENDED (Focus)
        { interval: 0, numeral: 'Imaj9', quality: 'Major 9', functionWord: 'Tonic', state: 'Lush Stability', rationale: 'Extended tonic.', isForeign: false, is7th: false, isExtended: true, isFocus: true },
        { interval: 5, numeral: 'IVmaj9', quality: 'Major 9', functionWord: 'Subdominant', state: 'Lush Departure', rationale: 'Extended subdominant.', isForeign: false, is7th: false, isExtended: true, isFocus: true },
        { interval: 7, numeral: 'V13', quality: 'Dominant 13', functionWord: 'Dominant', state: 'Complex Tension', rationale: 'Extended dominant engine.', isForeign: false, is7th: false, isExtended: true, isFocus: true },
        { interval: 9, numeral: 'vi11', quality: 'Minor 11', functionWord: 'Submediant', state: 'Complex Stability', rationale: 'Extended relative minor.', isForeign: false, is7th: false, isExtended: true, isFocus: true },
        
        // EXTENDED (Foreign/Overrides)
        { interval: 2, numeral: 'II9', quality: 'Dominant 9', functionWord: 'Secondary Dom', state: 'Engineered Tension', rationale: 'Extended V/V.', isForeign: true, is7th: false, isExtended: true, isFocus: false },
        { interval: 9, numeral: 'VI9', quality: 'Dominant 9', functionWord: 'Secondary Dom', state: 'Engineered Tension', rationale: 'Extended V/ii.', isForeign: true, is7th: false, isExtended: true, isFocus: false },
        { interval: 4, numeral: 'III9', quality: 'Dominant 9', functionWord: 'Secondary Dom', state: 'Engineered Tension', rationale: 'Extended V/vi.', isForeign: true, is7th: false, isExtended: true, isFocus: false },
        { interval: 0, numeral: 'I9', quality: 'Dominant 9', functionWord: 'Secondary Dom', state: 'Engineered Tension', rationale: 'Extended V/IV.', isForeign: true, is7th: false, isExtended: true, isFocus: false },
        { interval: 5, numeral: 'iv9', quality: 'Minor 9', functionWord: 'Subdominant', state: 'Melancholic Tension', rationale: 'Extended minor subdominant.', isForeign: true, is7th: false, isExtended: true, isFocus: false },
        { interval: 8, numeral: '♭VImaj9', quality: 'Major 9', functionWord: 'Submediant', state: 'Theatrical Tension', rationale: 'Extended major submediant.', isForeign: true, is7th: false, isExtended: true, isFocus: false },
        { interval: 3, numeral: '♭IIImaj9', quality: 'Major 9', functionWord: 'Mediant', state: 'Theatrical Tension', rationale: 'Extended mediant.', isForeign: true, is7th: false, isExtended: true, isFocus: false },
        { interval: 10, numeral: '♭VII9', quality: 'Dominant 9', functionWord: 'Subtonic', state: 'Departure', rationale: 'Extended subtonic.', isForeign: true, is7th: false, isExtended: true, isFocus: false }
    ];

    const minorChordDefs = [
        // DIATONIC (Focus)
        { interval: 0, numeral: 'i', quality: 'Minor', functionWord: 'Tonic', state: 'Stability', rationale: 'Minor Tonic.', isForeign: false, is7th: false, isFocus: true },
        { interval: 0, numeral: 'i7', quality: 'Minor 7', functionWord: 'Tonic', state: 'Stability', rationale: 'Minor Tonic.', isForeign: false, is7th: true, isFocus: true },
        { interval: 5, numeral: 'iv', quality: 'Minor', functionWord: 'Subdominant', state: 'Departure', rationale: 'Minor Subdominant.', isForeign: false, is7th: false, isFocus: true },
        { interval: 5, numeral: 'iv7', quality: 'Minor 7', functionWord: 'Subdominant', state: 'Departure', rationale: 'Minor Subdominant.', isForeign: false, is7th: true, isFocus: true },
        { interval: 7, numeral: 'V', quality: 'Major', functionWord: 'Dominant', state: 'Engineered Tension', rationale: 'Standard Harmonic Dominant.', isForeign: false, is7th: false, isFocus: true },
        { interval: 7, numeral: 'V7', quality: 'Dominant 7', functionWord: 'Dominant', state: 'Maximum Tension', rationale: 'Standard Harmonic Dominant.', isForeign: false, is7th: true, isFocus: true },
        { interval: 8, numeral: 'VI', quality: 'Major', functionWord: 'Submediant', state: 'Departure', rationale: 'Major Submediant.', isForeign: false, is7th: false, isFocus: true },
        { interval: 8, numeral: 'VImaj7', quality: 'Major 7', functionWord: 'Submediant', state: 'Departure', rationale: 'Major Submediant.', isForeign: false, is7th: true, isFocus: true },

        // DIATONIC (Non-Focus)
        { interval: 2, numeral: 'ii°', quality: 'Diminished', functionWord: 'Supertonic', state: 'Departure', rationale: 'Diminished Supertonic.', isForeign: false, is7th: false, isFocus: false },
        { interval: 2, numeral: 'iiø7', quality: 'Half-diminished 7', functionWord: 'Supertonic', state: 'Departure', rationale: 'Half-diminished Supertonic.', isForeign: false, is7th: true, isFocus: false },
        { interval: 3, numeral: 'III', quality: 'Major', functionWord: 'Mediant', state: 'Relative Major', rationale: 'Major Mediant.', isForeign: false, is7th: false, isFocus: false },
        { interval: 3, numeral: 'IIImaj7', quality: 'Major 7', functionWord: 'Mediant', state: 'Relative Major', rationale: 'Major Mediant.', isForeign: false, is7th: true, isFocus: false },
        { interval: 10, numeral: 'VII', quality: 'Major', functionWord: 'Subtonic', state: 'Departure', rationale: 'Major Subtonic.', isForeign: false, is7th: false, isFocus: false },
        { interval: 10, numeral: 'VII7', quality: 'Dominant 7', functionWord: 'Subtonic', state: 'Departure', rationale: 'Major Subtonic.', isForeign: false, is7th: true, isFocus: false },

        // FOREIGN / CHROMATIC OVERRIDE
        // Natural Minor Variants
        { interval: 7, numeral: 'v', quality: 'Minor', functionWord: 'Dominant Variant', state: 'Weak Tension', rationale: 'Natural minor aesthetic.', isForeign: true, is7th: false, isFocus: false },
        { interval: 7, numeral: 'v7', quality: 'Minor 7', functionWord: 'Dominant Variant', state: 'Weak Tension', rationale: 'Natural minor aesthetic.', isForeign: true, is7th: true, isFocus: false },
        { interval: 11, numeral: 'vii°', quality: 'Diminished', functionWord: 'Leading Tone', state: 'High Tension', rationale: 'Diminished Leading Tone.', isForeign: true, is7th: false, isFocus: false },
        { interval: 11, numeral: 'vii°7', quality: 'Diminished 7', functionWord: 'Leading Tone', state: 'High Tension', rationale: 'Fully-diminished Leading Tone.', isForeign: true, is7th: true, isFocus: false },
        // Modal / Chromatic
        { interval: 1, numeral: '♭II', quality: 'Major', functionWord: 'Neapolitan', state: 'Extreme Tension', rationale: 'Neapolitan major.', isForeign: true, is7th: false, isFocus: false },
        { interval: 1, numeral: '♭IImaj7', quality: 'Major 7', functionWord: 'Neapolitan', state: 'Extreme Tension', rationale: 'Neapolitan major.', isForeign: true, is7th: true, isFocus: false },
        { interval: 3, numeral: 'III+', quality: 'Augmented', functionWord: 'Mediant', state: 'Tension', rationale: 'Harmonic Minor derivative.', isForeign: true, is7th: false, isFocus: false },
        { interval: 3, numeral: 'III+maj7', quality: 'Major 7', functionWord: 'Mediant', state: 'Tension', rationale: 'Harmonic Minor derivative.', isForeign: true, is7th: true, isFocus: false },
        // Secondary Dominants
        { interval: 0, numeral: 'I', quality: 'Major', functionWord: 'Secondary Dom', state: 'Engineered Tension', rationale: 'V/iv.', isForeign: true, is7th: false, isFocus: false },
        { interval: 0, numeral: 'I7', quality: 'Dominant 7', functionWord: 'Secondary Dom', state: 'Engineered Tension', rationale: 'V7/iv.', isForeign: true, is7th: true, isFocus: false },
        { interval: 3, numeral: 'III (Dom)', quality: 'Major', functionWord: 'Secondary Dom', state: 'Engineered Tension', rationale: 'V/VI.', isForeign: true, is7th: false, isFocus: false },
        { interval: 3, numeral: 'III7', quality: 'Dominant 7', functionWord: 'Secondary Dom', state: 'Engineered Tension', rationale: 'V7/VI.', isForeign: true, is7th: true, isFocus: false },
        // Suspensions
        { interval: 7, numeral: 'Vsus4', quality: 'Sus4', functionWord: 'Suspension', state: 'Tension', rationale: 'Dominant suspension.', isForeign: true, is7th: false, isExtended: false, isFocus: false },
        { interval: 7, numeral: 'V7sus4', quality: 'Dominant 7 sus4', functionWord: 'Suspension', state: 'Tension', rationale: 'Dominant suspension.', isForeign: true, is7th: true, isExtended: false, isFocus: false },
        { interval: 0, numeral: 'isus4', quality: 'Sus4', functionWord: 'Suspension', state: 'Tension', rationale: 'Tonic suspension.', isForeign: true, is7th: false, isExtended: false, isFocus: false },
        { interval: 0, numeral: 'isus4 (7)', quality: 'Dominant 7 sus4', functionWord: 'Suspension', state: 'Tension', rationale: 'Tonic suspension.', isForeign: true, is7th: true, isExtended: false, isFocus: false },
        
        // EXTENDED (Focus)
        { interval: 0, numeral: 'i11', quality: 'Minor 11', functionWord: 'Tonic', state: 'Lush Stability', rationale: 'Extended minor tonic.', isForeign: false, is7th: false, isExtended: true, isFocus: true },
        { interval: 5, numeral: 'iv11', quality: 'Minor 11', functionWord: 'Subdominant', state: 'Complex Departure', rationale: 'Extended minor subdominant.', isForeign: false, is7th: false, isExtended: true, isFocus: true },
        { interval: 7, numeral: 'V13', quality: 'Dominant 13', functionWord: 'Dominant', state: 'Complex Tension', rationale: 'Extended harmonic dominant.', isForeign: false, is7th: false, isExtended: true, isFocus: true },
        { interval: 8, numeral: 'VImaj9', quality: 'Major 9', functionWord: 'Submediant', state: 'Lush Departure', rationale: 'Extended major submediant.', isForeign: false, is7th: false, isExtended: true, isFocus: true },

        // EXTENDED (Foreign/Overrides)
        { interval: 7, numeral: 'v11', quality: 'Minor 11', functionWord: 'Dominant Variant', state: 'Weak Tension', rationale: 'Extended natural minor dominant.', isForeign: true, is7th: false, isExtended: true, isFocus: false },
        { interval: 1, numeral: '♭IImaj9', quality: 'Major 9', functionWord: 'Neapolitan', state: 'Extreme Tension', rationale: 'Extended Neapolitan major.', isForeign: true, is7th: false, isExtended: true, isFocus: false },
        { interval: 0, numeral: 'I9', quality: 'Dominant 9', functionWord: 'Secondary Dom', state: 'Engineered Tension', rationale: 'Extended V/iv.', isForeign: true, is7th: false, isExtended: true, isFocus: false },
        { interval: 3, numeral: 'III9', quality: 'Dominant 9', functionWord: 'Secondary Dom', state: 'Engineered Tension', rationale: 'Extended V/VI.', isForeign: true, is7th: false, isExtended: true, isFocus: false }
    ];

    const dorianChordDefs = [
        { interval: 0, numeral: 'i', quality: 'Minor', functionWord: 'Tonic', state: 'Stability', rationale: 'Dorian Tonic.', isForeign: false, is7th: false, isFocus: true },
        { interval: 0, numeral: 'i7', quality: 'Minor 7', functionWord: 'Tonic', state: 'Stability', rationale: 'Dorian Tonic.', isForeign: false, is7th: true, isFocus: true },
        { interval: 2, numeral: 'ii', quality: 'Minor', functionWord: 'Supertonic', state: 'Departure', rationale: 'Supertonic minor.', isForeign: false, is7th: false, isFocus: true },
        { interval: 2, numeral: 'ii7', quality: 'Minor 7', functionWord: 'Supertonic', state: 'Departure', rationale: 'Supertonic minor.', isForeign: false, is7th: true, isFocus: true },
        { interval: 3, numeral: 'III', quality: 'Major', functionWord: 'Mediant', state: 'Relative Major', rationale: 'Major Mediant.', isForeign: false, is7th: false, isFocus: true },
        { interval: 3, numeral: 'IIImaj7', quality: 'Major 7', functionWord: 'Mediant', state: 'Relative Major', rationale: 'Major Mediant.', isForeign: false, is7th: true, isFocus: true },
        { interval: 5, numeral: 'IV', quality: 'Major', functionWord: 'Subdominant', state: 'Departure', rationale: 'Dorian subdominant.', isForeign: false, is7th: false, isFocus: true },
        { interval: 5, numeral: 'IV7', quality: 'Dominant 7', functionWord: 'Subdominant', state: 'Departure', rationale: 'Dorian subdominant.', isForeign: false, is7th: true, isFocus: true },
        { interval: 7, numeral: 'v', quality: 'Minor', functionWord: 'Dominant', state: 'Weak Tension', rationale: 'Minor dominant.', isForeign: false, is7th: false, isFocus: true },
        { interval: 7, numeral: 'v7', quality: 'Minor 7', functionWord: 'Dominant', state: 'Weak Tension', rationale: 'Minor dominant.', isForeign: false, is7th: true, isFocus: true },
        { interval: 9, numeral: 'vi°', quality: 'Diminished', functionWord: 'Submediant', state: 'High Tension', rationale: 'Dorian characteristic 6th.', isForeign: false, is7th: false, isFocus: true },
        { interval: 9, numeral: 'viø7', quality: 'Half-diminished 7', functionWord: 'Submediant', state: 'High Tension', rationale: 'Dorian characteristic 6th.', isForeign: false, is7th: true, isFocus: true },
        { interval: 10, numeral: 'VII', quality: 'Major', functionWord: 'Subtonic', state: 'Departure', rationale: 'Subtonic major.', isForeign: false, is7th: false, isFocus: true },
        { interval: 10, numeral: 'VIImaj7', quality: 'Major 7', functionWord: 'Subtonic', state: 'Departure', rationale: 'Subtonic major.', isForeign: false, is7th: true, isFocus: true }
    ];

    const mixolydianChordDefs = [
        { interval: 0, numeral: 'I', quality: 'Major', functionWord: 'Tonic', state: 'Stability', rationale: 'Mixolydian Tonic.', isForeign: false, is7th: false, isFocus: true },
        { interval: 0, numeral: 'I7', quality: 'Dominant 7', functionWord: 'Tonic', state: 'Stability', rationale: 'Mixolydian Tonic.', isForeign: false, is7th: true, isFocus: true },
        { interval: 2, numeral: 'ii', quality: 'Minor', functionWord: 'Supertonic', state: 'Departure', rationale: 'Supertonic minor.', isForeign: false, is7th: false, isFocus: true },
        { interval: 2, numeral: 'ii7', quality: 'Minor 7', functionWord: 'Supertonic', state: 'Departure', rationale: 'Supertonic minor.', isForeign: false, is7th: true, isFocus: true },
        { interval: 4, numeral: 'iii°', quality: 'Diminished', functionWord: 'Mediant', state: 'High Tension', rationale: 'Mediant diminished.', isForeign: false, is7th: false, isFocus: true },
        { interval: 4, numeral: 'iiiø7', quality: 'Half-diminished 7', functionWord: 'Mediant', state: 'High Tension', rationale: 'Mediant diminished.', isForeign: false, is7th: true, isFocus: true },
        { interval: 5, numeral: 'IV', quality: 'Major', functionWord: 'Subdominant', state: 'Departure', rationale: 'Subdominant major.', isForeign: false, is7th: false, isFocus: true },
        { interval: 5, numeral: 'IVmaj7', quality: 'Major 7', functionWord: 'Subdominant', state: 'Departure', rationale: 'Subdominant major.', isForeign: false, is7th: true, isFocus: true },
        { interval: 7, numeral: 'v', quality: 'Minor', functionWord: 'Dominant', state: 'Weak Tension', rationale: 'Minor dominant.', isForeign: false, is7th: false, isFocus: true },
        { interval: 7, numeral: 'v7', quality: 'Minor 7', functionWord: 'Dominant', state: 'Weak Tension', rationale: 'Minor dominant.', isForeign: false, is7th: true, isFocus: true },
        { interval: 9, numeral: 'vi', quality: 'Minor', functionWord: 'Submediant', state: 'Stability', rationale: 'Submediant minor.', isForeign: false, is7th: false, isFocus: true },
        { interval: 9, numeral: 'vi7', quality: 'Minor 7', functionWord: 'Submediant', state: 'Stability', rationale: 'Submediant minor.', isForeign: false, is7th: true, isFocus: true },
        { interval: 10, numeral: '♭VII', quality: 'Major', functionWord: 'Subtonic', state: 'Departure', rationale: 'Mixolydian lowered 7th.', isForeign: false, is7th: false, isFocus: true },
        { interval: 10, numeral: '♭VIImaj7', quality: 'Major 7', functionWord: 'Subtonic', state: 'Departure', rationale: 'Mixolydian lowered 7th.', isForeign: false, is7th: true, isFocus: true }
    ];

    const phrygianChordDefs = [
        { interval: 0, numeral: 'i', quality: 'Minor', functionWord: 'Tonic', state: 'Stability', rationale: 'Phrygian Tonic.', isForeign: false, is7th: false, isFocus: true },
        { interval: 0, numeral: 'i7', quality: 'Minor 7', functionWord: 'Tonic', state: 'Stability', rationale: 'Phrygian Tonic.', isForeign: false, is7th: true, isFocus: true },
        { interval: 1, numeral: '♭II', quality: 'Major', functionWord: 'Supertonic', state: 'Extreme Tension', rationale: 'Neapolitan major.', isForeign: false, is7th: false, isFocus: true },
        { interval: 1, numeral: '♭IImaj7', quality: 'Major 7', functionWord: 'Supertonic', state: 'Extreme Tension', rationale: 'Neapolitan major.', isForeign: false, is7th: true, isFocus: true },
        { interval: 3, numeral: 'III', quality: 'Major', functionWord: 'Mediant', state: 'Relative Major', rationale: 'Relative major.', isForeign: false, is7th: false, isFocus: true },
        { interval: 3, numeral: 'III7', quality: 'Dominant 7', functionWord: 'Mediant', state: 'Relative Major', rationale: 'Relative major.', isForeign: false, is7th: true, isFocus: true },
        { interval: 5, numeral: 'iv', quality: 'Minor', functionWord: 'Subdominant', state: 'Departure', rationale: 'Subdominant minor.', isForeign: false, is7th: false, isFocus: true },
        { interval: 5, numeral: 'iv7', quality: 'Minor 7', functionWord: 'Subdominant', state: 'Departure', rationale: 'Subdominant minor.', isForeign: false, is7th: true, isFocus: true },
        { interval: 7, numeral: 'v°', quality: 'Diminished', functionWord: 'Dominant', state: 'High Tension', rationale: 'Dominant diminished.', isForeign: false, is7th: false, isFocus: true },
        { interval: 7, numeral: 'vø7', quality: 'Half-diminished 7', functionWord: 'Dominant', state: 'High Tension', rationale: 'Dominant diminished.', isForeign: false, is7th: true, isFocus: true },
        { interval: 8, numeral: 'VI', quality: 'Major', functionWord: 'Submediant', state: 'Departure', rationale: 'Submediant major.', isForeign: false, is7th: false, isFocus: true },
        { interval: 8, numeral: 'VImaj7', quality: 'Major 7', functionWord: 'Submediant', state: 'Departure', rationale: 'Submediant major.', isForeign: false, is7th: true, isFocus: true },
        { interval: 10, numeral: 'vii', quality: 'Minor', functionWord: 'Subtonic', state: 'Weak Tension', rationale: 'Subtonic minor.', isForeign: false, is7th: false, isFocus: true },
        { interval: 10, numeral: 'vii7', quality: 'Minor 7', functionWord: 'Subtonic', state: 'Weak Tension', rationale: 'Subtonic minor.', isForeign: false, is7th: true, isFocus: true }
    ];

    const lydianChordDefs = [
        { interval: 0, numeral: 'I', quality: 'Major', functionWord: 'Tonic', state: 'Stability', rationale: 'Lydian Tonic.', isForeign: false, is7th: false, isFocus: true },
        { interval: 0, numeral: 'Imaj7', quality: 'Major 7', functionWord: 'Tonic', state: 'Stability', rationale: 'Lydian Tonic.', isForeign: false, is7th: true, isFocus: true },
        { interval: 2, numeral: 'II', quality: 'Major', functionWord: 'Supertonic', state: 'Departure', rationale: 'Lydian supertonic.', isForeign: false, is7th: false, isFocus: true },
        { interval: 2, numeral: 'II7', quality: 'Dominant 7', functionWord: 'Supertonic', state: 'Departure', rationale: 'Lydian supertonic.', isForeign: false, is7th: true, isFocus: true },
        { interval: 4, numeral: 'iii', quality: 'Minor', functionWord: 'Mediant', state: 'Weak Departure', rationale: 'Mediant minor.', isForeign: false, is7th: false, isFocus: true },
        { interval: 4, numeral: 'iii7', quality: 'Minor 7', functionWord: 'Mediant', state: 'Weak Departure', rationale: 'Mediant minor.', isForeign: false, is7th: true, isFocus: true },
        { interval: 6, numeral: '♯iv°', quality: 'Diminished', functionWord: 'Subdominant', state: 'High Tension', rationale: 'Lydian raised 4th.', isForeign: false, is7th: false, isFocus: true },
        { interval: 6, numeral: '♯ivø7', quality: 'Half-diminished 7', functionWord: 'Subdominant', state: 'High Tension', rationale: 'Lydian raised 4th.', isForeign: false, is7th: true, isFocus: true },
        { interval: 7, numeral: 'V', quality: 'Major', functionWord: 'Dominant', state: 'Tension', rationale: 'Dominant major.', isForeign: false, is7th: false, isFocus: true },
        { interval: 7, numeral: 'Vmaj7', quality: 'Major 7', functionWord: 'Dominant', state: 'Tension', rationale: 'Dominant major.', isForeign: false, is7th: true, isFocus: true },
        { interval: 9, numeral: 'vi', quality: 'Minor', functionWord: 'Submediant', state: 'Stability', rationale: 'Submediant minor.', isForeign: false, is7th: false, isFocus: true },
        { interval: 9, numeral: 'vi7', quality: 'Minor 7', functionWord: 'Submediant', state: 'Stability', rationale: 'Submediant minor.', isForeign: false, is7th: true, isFocus: true },
        { interval: 11, numeral: 'vii', quality: 'Minor', functionWord: 'Leading Tone', state: 'Weak Tension', rationale: 'Minor leading tone.', isForeign: false, is7th: false, isFocus: true },
        { interval: 11, numeral: 'vii7', quality: 'Minor 7', functionWord: 'Leading Tone', state: 'Weak Tension', rationale: 'Minor leading tone.', isForeign: false, is7th: true, isFocus: true }
    ];

    let defs;
    if (mode === 'minor' || mode === true) defs = [...minorChordDefs];
    else if (mode === 'dorian') defs = [...dorianChordDefs];
    else if (mode === 'mixolydian') defs = [...mixolydianChordDefs];
    else if (mode === 'phrygian') defs = [...phrygianChordDefs];
    else if (mode === 'lydian') defs = [...lydianChordDefs];
    else defs = [...majorChordDefs];

    const isMinor = (mode === 'minor' || mode === true || mode === 'dorian' || mode === 'phrygian');
    const noteNames = isMinor ? noteNamesFlats : noteNamesSharps;

    for (const def of defs) {
        if (!includeForeign && def.isForeign) continue;

        let chordRootInt = (rootInt + def.interval) % 12;
        if (chordRootInt < 0) chordRootInt += 12;

        let spelling = noteNames[chordRootInt];
        
        // Smart spelling logic based on the Roman Numeral notation
        if (def.numeral.includes('♯')) {
            spelling = noteNamesSharps[chordRootInt];
        } else if (def.numeral.includes('♭')) {
            spelling = noteNamesFlats[chordRootInt];
        } else if (def.isForeign) {
            // Default to flats for most foreign chords without explicit #/b if they aren't secondary dominants
            if (def.quality !== 'Major' && def.numeral !== 'III' && def.numeral !== 'VI' && def.numeral !== 'IV') {
                spelling = noteNamesFlats[chordRootInt];
            }
        }

        chords.push({
            romanNumeral: def.numeral,
            quality: def.quality,
            functionWord: def.functionWord,
            state: def.state,
            rationale: def.rationale,
            rootInt: chordRootInt,
            rootSpelling: spelling,
            isForeign: def.isForeign,
            is7th: def.is7th,
            isExtended: def.isExtended || false,
            isFocus: def.isFocus
        });
    }

    return chords;
}
