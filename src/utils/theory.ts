import { NOTES } from '../constants';

// Circle of Fifths order
export const CIRCLE_OF_FIFTHS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

export const NOTE_DISPLAY_NAMES: Record<string, string> = {
  'C#': 'C#/Db',
  'Db': 'Db/C#',
  'D#': 'D#/Eb',
  'Eb': 'Eb/D#',
  'F#': 'F#/Gb',
  'Gb': 'Gb/F#',
  'G#': 'G#/Ab',
  'Ab': 'Ab/G#',
  'A#': 'A#/Bb',
  'Bb': 'Bb/A#',
};

const getNoteIndex = (note: string) => {
  const flatToSharp: Record<string, string> = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
  };
  return NOTES.indexOf(flatToSharp[note] || note);
};

export const getMajorScale = (root: string) => {
  const intervals = [0, 2, 4, 5, 7, 9, 11];
  const rootIndex = getNoteIndex(root);
  return intervals.map(i => NOTES[(rootIndex + i) % 12]);
};

export const getMinorScale = (root: string) => {
  const intervals = [0, 2, 3, 5, 7, 8, 10];
  const rootIndex = getNoteIndex(root);
  return intervals.map(i => NOTES[(rootIndex + i) % 12]);
};

export const getChordNotes = (scaleNotes: string[], degree: number, type: 'triad' | '7th' | '5'): Record<string, string | null> => {
  const root = scaleNotes[degree];
  const fifth = scaleNotes[(degree + 4) % 7];
  if (type === '5') return { [root]: 'root', [fifth]: '5th' };
  
  const third = scaleNotes[(degree + 2) % 7];
  if (type === 'triad') return { [root]: 'root', [third]: '3rd', [fifth]: '5th' };
  
  const seventh = scaleNotes[(degree + 6) % 7];
  return { [root]: 'root', [third]: '3rd', [fifth]: '5th', [seventh]: '7th' };
};

export const CHORD_ROMAN_NUMERALS = {
  major: {
    triad: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
    '7th': ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viiø7'],
    '5': ['I5', 'ii5', 'iii5', 'IV5', 'V5', 'vi5', 'vii5'],
  },
  minor: {
    triad: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
    '7th': ['im7', 'iiø7', 'IIImaj7', 'ivm7', 'vm7', 'VImaj7', 'VII7'],
    '5': ['i5', 'ii5', 'III5', 'iv5', 'v5', 'VI5', 'VII5'],
  },
};
