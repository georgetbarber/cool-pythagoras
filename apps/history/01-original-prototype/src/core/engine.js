// 1. 0-11 integer base for the chromatic scale
export const CHROMATIC_SCALE_SIZE = 12;

// 2. Local string representations (A#, Bb, etc.).
// Bans double-sharps (Fx) and double-flats (Ebb) by strictly mapping to normalized 12-tone equivalents.
export const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// 3. Intervallic calculator returning an array of note integers.
const CHORD_INTERVALS = {
  'Major': [0, 4, 7],         // 1, 3, 5
  'Minor': [0, 3, 7],         // 1, b3, 5
  'Diminished': [0, 3, 6],    // 1, b3, b5
  'Augmented': [0, 4, 8],     // 1, 3, #5
  'Dominant 7': [0, 4, 7, 10],// 1, 3, 5, b7
  'Sus4': [0, 5, 7],          // 1, 4, 5
  'Major 7': [0, 4, 7, 11],   // 1, 3, 5, 7
  'Minor 7': [0, 3, 7, 10],   // 1, b3, 5, b7
  'Half-diminished 7': [0, 3, 6, 10], // 1, b3, b5, b7
  'Diminished 7': [0, 3, 6, 9], // 1, b3, b5, bb7
  'Dominant 7 sus4': [0, 5, 7, 10],
  'Major 7 sus4': [0, 5, 7, 11],
  'Major 9': [0, 4, 7, 11, 2],
  'Minor 9': [0, 3, 7, 10, 2],
  'Dominant 9': [0, 4, 7, 10, 2],
  'Major 11': [0, 4, 7, 11, 2, 5],
  'Minor 11': [0, 3, 7, 10, 2, 5],
  'Dominant 11': [0, 4, 7, 10, 2, 5],
  'Major 13': [0, 4, 7, 11, 2, 5, 9],
  'Minor 13': [0, 3, 7, 10, 2, 5, 9],
  'Dominant 13': [0, 4, 7, 10, 2, 5, 9]
};

export const CHORD_INTERVAL_NAMES = {
  'Major': ['1', '3', '5'],
  'Minor': ['1', 'b3', '5'],
  'Diminished': ['1', 'b3', 'b5'],
  'Augmented': ['1', '3', '#5'],
  'Dominant 7': ['1', '3', '5', 'b7'],
  'Sus4': ['1', '4', '5'],
  'Major 7': ['1', '3', '5', '7'],
  'Minor 7': ['1', 'b3', '5', 'b7'],
  'Half-diminished 7': ['1', 'b3', 'b5', 'b7'],
  'Diminished 7': ['1', 'b3', 'b5', 'bb7'],
  'Dominant 7 sus4': ['1', '4', '5', 'b7'],
  'Major 7 sus4': ['1', '4', '5', '7'],
  'Major 9': ['1', '3', '5', '7', '9'],
  'Minor 9': ['1', 'b3', '5', 'b7', '9'],
  'Dominant 9': ['1', '3', '5', 'b7', '9'],
  'Major 11': ['1', '3', '5', '7', '9', '11'],
  'Minor 11': ['1', 'b3', '5', 'b7', '9', '11'],
  'Dominant 11': ['1', '3', '5', 'b7', '9', '11'],
  'Major 13': ['1', '3', '5', '7', '9', '11', '13'],
  'Minor 13': ['1', 'b3', '5', 'b7', '9', '11', '13'],
  'Dominant 13': ['1', '3', '5', 'b7', '9', '11', '13']
};

export function getChordNotes(rootInt, quality) {
  const intervals = CHORD_INTERVALS[quality];
  if (!intervals) {
    throw new Error(`Unsupported chord quality: ${quality}`);
  }
  
  // Return normalized integers (0-11)
  return intervals.map(interval => (rootInt + interval) % CHROMATIC_SCALE_SIZE);
}

// 4. Returns the string representation of a note integer.
export function getNoteName(noteInt, isFlatContext = false) {
  // Normalize the integer to always be within 0-11 (handles negative numbers gracefully)
  const normalizedInt = ((noteInt % CHROMATIC_SCALE_SIZE) + CHROMATIC_SCALE_SIZE) % CHROMATIC_SCALE_SIZE;
  return isFlatContext ? FLAT_NAMES[normalizedInt] : SHARP_NAMES[normalizedInt];
}

// 5. Scale intervals for major and natural minor
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

/**
 * Returns all 7 scale degree integers for a given root and mode.
 * @param {number} rootInt - Root note integer (0-11)
 * @param {boolean} isMinor - True for natural minor, false for major
 * @returns {number[]} Array of 7 note integers (0-11)
 */
export function getScaleNotes(rootInt, isMinor = false) {
  const intervals = isMinor ? MINOR_SCALE_INTERVALS : MAJOR_SCALE_INTERVALS;
  return intervals.map(interval => (rootInt + interval) % CHROMATIC_SCALE_SIZE);
}

// 6. Pentatonic intervals
const MAJOR_PENTATONIC_INTERVALS = [0, 2, 4, 7, 9];
const MINOR_PENTATONIC_INTERVALS = [0, 3, 5, 7, 10];

/**
 * Returns 5 pentatonic scale degree integers.
 * @param {number} rootInt - Root note integer (0-11)
 * @param {boolean} isMinor - True for minor pentatonic, false for major pentatonic
 * @returns {number[]} Array of 5 note integers
 */
export function getPentatonicNotes(rootInt, isMinor = false) {
  const intervals = isMinor ? MINOR_PENTATONIC_INTERVALS : MAJOR_PENTATONIC_INTERVALS;
  return intervals.map(interval => (rootInt + interval) % CHROMATIC_SCALE_SIZE);
}
