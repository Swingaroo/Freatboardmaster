import React from 'react';
import { CHORD_STEP_COLORS } from '../constants';

interface MusicalNotationProps {
  selectedNotes: Record<string, string | null>;
  activeScale: { root: string, mode: 'major' | 'minor' } | null;
}

const MusicalNotation: React.FC<MusicalNotationProps> = ({ selectedNotes, activeScale }) => {
  // Key signature definitions
  const majorKeySignatures: Record<string, { type: 'sharp' | 'flat', count: number }> = {
    'C': { type: 'sharp', count: 0 },
    'G': { type: 'sharp', count: 1 },
    'D': { type: 'sharp', count: 2 },
    'A': { type: 'sharp', count: 3 },
    'E': { type: 'sharp', count: 4 },
    'B': { type: 'sharp', count: 5 },
    'F#': { type: 'sharp', count: 6 },
    'C#': { type: 'sharp', count: 7 },
    'F': { type: 'flat', count: 1 },
    'Bb': { type: 'flat', count: 2 },
    'Eb': { type: 'flat', count: 3 },
    'Ab': { type: 'flat', count: 4 },
    'Db': { type: 'flat', count: 5 },
    'Gb': { type: 'flat', count: 6 },
    'Cb': { type: 'flat', count: 7 },
  };

  const minorToMajor: Record<string, string> = {
    'A': 'C', 'E': 'G', 'B': 'D', 'F#': 'A', 'C#': 'E', 'G#': 'B', 'D#': 'F#', 'A#': 'C#',
    'D': 'F', 'G': 'Bb', 'C': 'Eb', 'F': 'Ab', 'Bb': 'Db', 'Eb': 'Gb', 'Ab': 'Cb'
  };

  const getKeySignature = () => {
    if (!activeScale) return { type: 'sharp' as const, count: 0 };
    const root = activeScale.root;
    const majorRoot = activeScale.mode === 'minor' ? (minorToMajor[root] || root) : root;
    return majorKeySignatures[majorRoot] || { type: 'sharp', count: 0 };
  };

  const keySig = getKeySignature();
  const sharpOrder = [10, 7, 11, 8, 5, 9, 6]; // F5, C5, G5, D5, A4, E5, B4
  const flatOrder = [6, 9, 5, 8, 4, 7, 3];   // B4, E5, A4, D5, G4, C5, F4

  // Notes that are altered by the key signature
  const alteredNotesInKey: string[] = [];
  if (keySig.count > 0) {
    const notesInOrder = keySig.type === 'sharp' 
      ? ['F', 'C', 'G', 'D', 'A', 'E', 'B'] 
      : ['B', 'E', 'A', 'D', 'G', 'C', 'F'];
    for (let i = 0; i < keySig.count; i++) {
      alteredNotesInKey.push(notesInOrder[i]);
    }
  }

  // Sort notes by role priority: root, 3rd, 5th, 7th
  const rolePriority: Record<string, number> = { 'root': 0, '3rd': 1, '5th': 2, '7th': 3 };
  
  const sortedNotes = Object.entries(selectedNotes)
    .filter(([_, role]) => role !== null)
    .sort((a, b) => {
      const roleA = a[1] as string;
      const roleB = b[1] as string;
      return (rolePriority[roleA] ?? 99) - (rolePriority[roleB] ?? 99);
    });

  // Simple mapping for staff positions (Treble Clef)
  // We'll map notes to a "step" relative to C4 (0)
  const noteToStepBase: Record<string, number> = {
    'C': 0, 'C#': 0, 'Db': 0,
    'D': 1, 'D#': 1, 'Eb': 1,
    'E': 2, 'Fb': 2,
    'F': 3, 'F#': 3, 'Gb': 3,
    'G': 4, 'G#': 4, 'Ab': 4,
    'A': 5, 'A#': 5, 'Bb': 5,
    'B': 6, 'Cb': 6
  };

  // Calculate actual steps ensuring each subsequent note is higher than the previous
  let lastStep = -999;
  const noteSteps: { note: string, role: string, step: number }[] = [];

  sortedNotes.forEach(([note, role]) => {
    let step = noteToStepBase[note] || 0;
    
    if (lastStep !== -999) {
      while (step <= lastStep) {
        step += 7;
      }
    }
    
    noteSteps.push({ note, role: role as string, step });
    lastStep = step;
  });

  const getDisplayName = (note: string) => {
    const sharpToFlat: Record<string, string> = {
      'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb'
    };
    // If the note is in the key signature, we don't need to show the accidental
    // unless it's a "natural" or a different accidental (but our app is simple)
    const baseNote = note.replace(/[#b]/g, '');
    const isAlteredInKey = alteredNotesInKey.includes(baseNote);
    
    if (isAlteredInKey) {
      // If it's already altered in key, we only show it if it's NOT the key's alteration
      // For simplicity in this app, if it's in the key, we assume it matches the key's alteration
      return baseNote;
    }

    if (keySig.type === 'flat' && sharpToFlat[note]) return sharpToFlat[note];
    return note;
  };

  // Calculate horizontal positions with room for accidentals
  let currentX = 28 + (keySig.count * 8); // Start after clef and key signature
  const noteRenderData = noteSteps.map((item) => {
    const displayName = getDisplayName(item.note);
    const hasAccidental = displayName.length > 1;
    
    if (hasAccidental) {
      currentX += 10; // Make room for accidental
    }
    
    const x = currentX;
    currentX += 14; // Spacing for next note
    
    return { ...item, x, displayName, hasAccidental };
  });

  const staffLines = [0, 1, 2, 3, 4]; // 5 lines
  const lineHeight = 10;
  const startY = 25;

  return (
    <div className="flex items-center justify-center w-full h-full p-2">
      <svg viewBox="0 0 120 80" className="w-full h-full">
        {/* Staff Lines */}
        {staffLines.map(line => (
          <line
            key={line}
            x1="10"
            y1={startY + line * lineHeight}
            x2="110"
            y2={startY + line * lineHeight}
            stroke="#18181b"
            strokeWidth="1"
            opacity="0.8"
          />
        ))}

        {/* Treble Clef (G-clef) Unicode */}
        <text
          x="5"
          y="62"
          fill="#18181b"
          fontSize="52"
          className="select-none font-serif"
          opacity="0.9"
        >
          &#119070;
        </text>

        {/* Key Signature Accidentals */}
        {Array.from({ length: keySig.count }).map((_, i) => {
          const step = keySig.type === 'sharp' ? sharpOrder[i] : flatOrder[i];
          const y = startY + 50 - (step * lineHeight) / 2;
          const x = 24 + i * 7;
          return (
            <text
              key={`keysig-${i}`}
              x={x}
              y={y + 4}
              fill="#18181b"
              fontSize="14"
              fontWeight="bold"
              className="select-none font-serif"
            >
              {keySig.type === 'sharp' ? '♯' : '♭'}
            </text>
          );
        })}

        {/* Notes */}
        {noteRenderData.map((item, idx) => {
          const { note, role, step, x, displayName, hasAccidental } = item;
          const color = CHORD_STEP_COLORS[role as keyof typeof CHORD_STEP_COLORS] || '#18181b';
          
          const y = startY + 50 - (step * lineHeight) / 2;

          if (idx > 5) return null;

          return (
            <g key={note}>
              {/* Ledger lines */}
              {step === 0 && (
                <line x1={x - 8} y1={y} x2={x + 8} y2={y} stroke="#18181b" strokeWidth="1" opacity="0.8" />
              )}
              {step === -2 && (
                <line x1={x - 8} y1={y} x2={x + 8} y2={y} stroke="#18181b" strokeWidth="1" opacity="0.8" />
              )}
              {step === 12 && (
                <line x1={x - 8} y1={y} x2={x + 8} y2={y} stroke="#18181b" strokeWidth="1" opacity="0.8" />
              )}
              {step === 14 && (
                <line x1={x - 8} y1={y} x2={x + 8} y2={y} stroke="#18181b" strokeWidth="1" opacity="0.8" />
              )}
              
              {/* Accidental (only shown if not in key signature) */}
              {hasAccidental && (
                <text
                  x={x - 10}
                  y={y + 4}
                  fill={color}
                  fontSize="14"
                  fontWeight="bold"
                  className="select-none font-serif"
                >
                  {displayName.includes('#') ? '♯' : '♭'}
                </text>
              )}

              {/* Note Head */}
              <ellipse
                cx={x}
                cy={y}
                rx="5"
                ry="4"
                fill={color}
                className="transition-all duration-300"
                transform={`rotate(-20, ${x}, ${y})`}
              />
              
              {/* Stem */}
              <line
                x1={x + 4.5}
                y1={y}
                x2={x + 4.5}
                y2={y - 25}
                stroke={color}
                strokeWidth="1.2"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default MusicalNotation;
