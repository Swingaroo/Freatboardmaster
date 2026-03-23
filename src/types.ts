
export type FretboardOrientation = {
  nutOnLeft: boolean;
  lowStringOnBottom: boolean;
};

export interface InstrumentString {
  note: string;
  octave: number;
  startFret: number;
}

export interface Tuning {
  name: string;
  strings: InstrumentString[];
}

export interface Instrument {
  name: string;
  tunings: Tuning[];
}

export const ORIENTATION_MODES = [
  { id: '1', label: 'Nut Left, Low Bottom', nutOnLeft: true, lowStringOnBottom: true },
  { id: '2', label: 'Nut Left, Low Top', nutOnLeft: true, lowStringOnBottom: false },
  { id: '3', label: 'Nut Right, Low Bottom', nutOnLeft: false, lowStringOnBottom: true },
  { id: '4', label: 'Nut Right, Low Top', nutOnLeft: false, lowStringOnBottom: false },
];
