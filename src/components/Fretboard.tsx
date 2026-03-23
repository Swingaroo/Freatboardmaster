import React from 'react';
import { NOTES, FRET_COUNT, getNoteAtFret, NOTE_COLORS, CHORD_STEP_COLORS } from '../constants';
import { motion } from 'motion/react';
import { FretboardOrientation, Tuning } from '../types';
import { audioService } from '../services/audioService';

interface FretboardProps {
  selectedNotes: Record<string, string | null>;
  orientation: FretboardOrientation;
  tuning: Tuning;
}

const NOTE_DISPLAY_NAMES: Record<string, string> = {
  'C#': 'C#/Db',
  'D#': 'D#/Eb',
  'F#': 'F#/Gb',
  'G#': 'G#/Ab',
  'A#': 'A#/Bb',
};

const Fretboard: React.FC<FretboardProps> = ({ selectedNotes, orientation, tuning }) => {
  const { nutOnLeft, lowStringOnBottom } = orientation;

  // Adjust strings based on lowStringOnBottom
  const strings = lowStringOnBottom ? [...tuning.strings] : [...tuning.strings].reverse();
  
  // Adjust frets based on nutOnLeft
  const fretIndices = Array.from({ length: FRET_COUNT + 1 }).map((_, i) => i);
  const displayFretIndices = nutOnLeft ? fretIndices : [...fretIndices].reverse();

  const handleNoteClick = (note: string, octave: number) => {
    audioService.playNote(note, octave);
  };

  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
      <div className="min-w-[800px] relative bg-[#2a2a2a] p-8 rounded-lg shadow-2xl border border-white/10">
        {/* Strings */}
        <div className="flex flex-col justify-between h-64 relative">
          {strings.map((string, stringIdx) => (
            <div key={stringIdx} className="relative flex items-center h-full group">
              {/* String Label */}
              <div className={`absolute ${nutOnLeft ? '-left-8' : '-right-8'} w-6 text-center font-mono text-sm text-zinc-400 font-bold`}>
                {string.note}
              </div>
              
              {/* The actual string line */}
              <div 
                className="w-full bg-zinc-400/40 shadow-[0_1px_2px_rgba(0,0,0,0.5)]" 
                style={{ 
                  height: `${1 + (lowStringOnBottom ? (strings.length - 1 - stringIdx) * 0.5 : stringIdx * 0.5)}px`,
                  marginLeft: nutOnLeft ? `${(string.startFret / (FRET_COUNT + 1)) * 100}%` : '0',
                  marginRight: !nutOnLeft ? `${(string.startFret / (FRET_COUNT + 1)) * 100}%` : '0',
                  width: `${((FRET_COUNT + 1 - string.startFret) / (FRET_COUNT + 1)) * 100}%`
                }} 
              />

              {/* Frets and Markers */}
              <div className="absolute inset-0 flex">
                {displayFretIndices.map((fretIdx) => {
                  const isAvailable = fretIdx >= string.startFret;
                  const noteData = isAvailable ? getNoteAtFret(string.note, string.octave, fretIdx - string.startFret) : null;
                  const role = noteData ? selectedNotes[noteData.note] : undefined;
                  const isSelected = role !== undefined;
                  const color = noteData ? (role ? CHORD_STEP_COLORS[role] : NOTE_COLORS[noteData.note]) : null;

                  // Determine border position based on nut orientation
                  const isNut = fretIdx === 0;
                  const borderClass = nutOnLeft 
                    ? (isNut ? 'border-r-4 border-zinc-200' : 'border-r border-zinc-600/50')
                    : (isNut ? 'border-l-4 border-zinc-200' : 'border-l border-zinc-600/50');

                  return (
                    <div
                      key={fretIdx}
                      className={`flex-1 flex items-center justify-center relative ${borderClass}`}
                    >
                      {isSelected && color && noteData && (
                        <motion.button
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleNoteClick(noteData.note, noteData.octave)}
                          style={{ backgroundColor: color, borderColor: `${color}80` }}
                          className="z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 text-white font-bold text-[8px] sm:text-[10px] cursor-pointer hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-shadow"
                        >
                          {NOTE_DISPLAY_NAMES[noteData.note] || noteData.note}
                        </motion.button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Fret Numbers */}
        <div className="flex mt-4 ml-0">
          {displayFretIndices.map((fretNum) => (
            <div key={fretNum} className="flex-1 text-center text-[10px] font-mono text-zinc-500">
              {fretNum}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Fretboard;
