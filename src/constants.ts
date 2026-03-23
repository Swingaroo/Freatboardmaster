
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const FRET_COUNT = 14;

export const NOTE_COLORS: Record<string, string> = {
  'C': '#ef4444',    // Red
  'C#': '#f97316',   // Orange
  'D': '#f59e0b',    // Amber
  'D#': '#84cc16',   // Lime
  'E': '#22c55e',    // Green
  'F': '#14b8a6',    // Teal
  'F#': '#06b6d4',   // Cyan
  'G': '#0ea5e9',    // Sky
  'G#': '#3b82f6',   // Blue
  'A': '#6366f1',    // Indigo
  'A#': '#a855f7',   // Purple
  'B': '#ec4899',    // Pink
};

export const CHORD_STEP_COLORS: Record<string, string> = {
  'root': '#ef4444',    // Red
  '3rd': '#22c55e',     // Green
  '5th': '#3b82f6',     // Blue
  '7th': '#f59e0b',     // Amber
};

export function getNoteAtFret(startNote: string, startOctave: number, fret: number): { note: string, octave: number } {
  const startIndex = NOTES.indexOf(startNote);
  const totalIndex = startIndex + fret;
  const noteIndex = totalIndex % 12;
  const octaveIncrease = Math.floor(totalIndex / 12);
  
  return {
    note: NOTES[noteIndex],
    octave: startOctave + octaveIncrease
  };
}
