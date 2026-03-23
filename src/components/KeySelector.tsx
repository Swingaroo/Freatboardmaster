import React from 'react';
import { NOTE_COLORS } from '../constants';
import MusicalNotation from './MusicalNotation';
import ChordButton from './ChordButton';
import { 
  CIRCLE_OF_FIFTHS, 
  NOTE_DISPLAY_NAMES, 
  getMajorScale, 
  getMinorScale, 
  getChordNotes, 
  CHORD_ROMAN_NUMERALS 
} from '../utils/theory';

interface KeySelectorProps {
  selectedNotes: Record<string, string | null>;
  onToggle: (note: string) => void;
  onSelectNotes: (notes: Record<string, string | null>) => void;
  onScaleChange: (root: string, mode: 'major' | 'minor', notes: Record<string, string | null>) => void;
  activeScale: { root: string, mode: 'major' | 'minor' } | null;
}

const KeySelector: React.FC<KeySelectorProps> = ({ selectedNotes, onToggle, onSelectNotes, onScaleChange, activeScale }) => {
  const [chordType, setChordType] = React.useState<'triad' | '7th' | '5'>('triad');
  const centerX = 250;
  const centerY = 250;

  const getPathData = (startAngle: number, endAngle: number, outerR: number, innerR: number) => {
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = centerX + outerR * Math.cos(startRad);
    const y1 = centerY + outerR * Math.sin(startRad);
    const x2 = centerX + outerR * Math.cos(endRad);
    const y2 = centerY + outerR * Math.sin(endRad);
    
    const x3 = centerX + innerR * Math.cos(endRad);
    const y3 = centerY + innerR * Math.sin(endRad);
    const x4 = centerX + innerR * Math.cos(startRad);
    const y4 = centerY + innerR * Math.sin(startRad);
    
    return `
      M ${x1} ${y1}
      A ${outerR} ${outerR} 0 0 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerR} ${innerR} 0 0 0 ${x4} ${y4}
      Z
    `;
  };

  const isChordSelected = (chordNotes: Record<string, string | null>) => {
    const chordKeys = Object.keys(chordNotes);
    const selectedKeys = Object.keys(selectedNotes);
    if (selectedKeys.length !== chordKeys.length) return false;
    return chordKeys.every(note => selectedKeys.includes(note));
  };

  const activeScaleNotes = activeScale 
    ? (activeScale.mode === 'major' ? getMajorScale(activeScale.root) : getMinorScale(activeScale.root))
    : null;

  const chords = activeScale && activeScaleNotes ? CHORD_ROMAN_NUMERALS[activeScale.mode][chordType].map((numeral, idx) => {
    const notesMap = getChordNotes(activeScaleNotes, idx, chordType);
    return { numeral, notes: notesMap, root: activeScaleNotes[idx] };
  }) : [];

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-6xl mx-auto mt-4 mb-4 select-none">
      {/* Chord Buttons Column */}
      <div className="flex lg:flex-col flex-wrap justify-center gap-2 min-w-[150px]">
        {activeScale ? (
          <>
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2 w-full text-center lg:text-left">
              {activeScale.root} {activeScale.mode} Chords
            </div>
            
            {/* Chord Type Toggle */}
            <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-lg border border-white/5 mb-4 w-full">
              {(['triad', '7th', '5'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setChordType(type)}
                  className={`flex-1 px-2 py-1 text-[10px] font-bold rounded transition-all ${
                    chordType === type ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {type === 'triad' ? 'Triads' : type === '7th' ? '7ths' : 'Power'}
                </button>
              ))}
            </div>

            {chords.map((chord, idx) => (
              <ChordButton
                key={idx}
                numeral={chord.numeral}
                root={chord.root}
                notes={chord.notes}
                isSelected={isChordSelected(chord.notes)}
                onClick={onSelectNotes}
              />
            ))}
          </>
        ) : (
          <div className="text-xs font-mono text-zinc-600 italic text-center lg:text-left max-w-[120px]">
            Select a scale in the circle to see chords
          </div>
        )}
      </div>

      {/* Circle Ring */}
      <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
        <svg 
          viewBox="0 0 500 500" 
          className="w-full h-full drop-shadow-2xl"
        >
          {CIRCLE_OF_FIFTHS.map((note, index) => {
            const isNoteSelected = selectedNotes[note] !== undefined;
            const displayName = NOTE_DISPLAY_NAMES[note] || note;
            const color = NOTE_COLORS[note];
            
            const startAngle = index * 30;
            const endAngle = (index + 1) * 30;
            const midAngle = (startAngle + endAngle) / 2 - 90;
            const midRad = midAngle * (Math.PI / 180);

            // Outer Ring: Notes
            const outerR1 = 240, innerR1 = 190;
            const labelX1 = centerX + ((outerR1 + innerR1) / 2) * Math.cos(midRad);
            const labelY1 = centerY + ((outerR1 + innerR1) / 2) * Math.sin(midRad);

            // Middle Ring: Major Scales
            const outerR2 = 185, innerR2 = 135;
            const labelX2 = centerX + ((outerR2 + innerR2) / 2) * Math.cos(midRad);
            const labelY2 = centerY + ((outerR2 + innerR2) / 2) * Math.sin(midRad);
            const majorScale = getMajorScale(note);
            const isMajorSelected = activeScale?.root === note && activeScale?.mode === 'major';

            // Inner Ring: Minor Scales
            const outerR3 = 130, innerR3 = 80;
            const labelX3 = centerX + ((outerR3 + innerR3) / 2) * Math.cos(midRad);
            const labelY3 = centerY + ((outerR3 + innerR3) / 2) * Math.sin(midRad);
            const minorScale = getMinorScale(note);
            const isMinorSelected = activeScale?.root === note && activeScale?.mode === 'minor';

            return (
              <g key={note}>
                {/* Note Sector */}
                <g className="cursor-pointer group" onClick={() => onToggle(note)}>
                  <path
                    d={getPathData(startAngle, endAngle, outerR1, innerR1)}
                    className="transition-all duration-300 stroke-white/5 group-hover:stroke-white/20"
                    style={{
                      fill: isNoteSelected ? color : 'rgba(24, 24, 27, 0.8)',
                      opacity: isNoteSelected ? 1 : 0.6,
                    }}
                  />
                  <text
                    x={labelX1}
                    y={labelY1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`text-[14px] font-bold transition-all duration-300 pointer-events-none ${
                      isNoteSelected ? 'fill-white' : 'fill-zinc-400 group-hover:fill-zinc-200'
                    }`}
                  >
                    {displayName}
                  </text>
                </g>

                {/* Major Scale Sector */}
                <g className="cursor-pointer group" onClick={() => {
                  const notesMap: Record<string, string | null> = {};
                  majorScale.forEach(n => notesMap[n] = null);
                  onScaleChange(note, 'major', notesMap);
                }}>
                  <path
                    d={getPathData(startAngle, endAngle, outerR2, innerR2)}
                    className="transition-all duration-300 stroke-white/5 group-hover:stroke-white/20"
                    style={{
                      fill: isMajorSelected ? color : 'rgba(39, 39, 42, 0.6)',
                      opacity: isMajorSelected ? 0.8 : 0.4,
                    }}
                  />
                  <text
                    x={labelX2}
                    y={labelY2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`text-[11px] font-bold transition-all duration-300 pointer-events-none ${
                      isMajorSelected ? 'fill-white' : 'fill-zinc-500 group-hover:fill-zinc-300'
                    }`}
                  >
                    {note} Maj
                  </text>
                </g>

                {/* Minor Scale Sector */}
                <g className="cursor-pointer group" onClick={() => {
                  const notesMap: Record<string, string | null> = {};
                  minorScale.forEach(n => notesMap[n] = null);
                  onScaleChange(note, 'minor', notesMap);
                }}>
                  <path
                    d={getPathData(startAngle, endAngle, outerR3, innerR3)}
                    className="transition-all duration-300 stroke-white/5 group-hover:stroke-white/20"
                    style={{
                      fill: isMinorSelected ? color : 'rgba(24, 24, 27, 0.4)',
                      opacity: isMinorSelected ? 0.6 : 0.3,
                    }}
                  />
                  <text
                    x={labelX3}
                    y={labelY3}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`text-[10px] font-bold transition-all duration-300 pointer-events-none ${
                      isMinorSelected ? 'fill-white' : 'fill-zinc-600 group-hover:fill-zinc-400'
                    }`}
                  >
                    {note} min
                  </text>
                </g>
              </g>
            );
          })}

          {/* Center Hole with Musical Notation */}
          <foreignObject x={centerX - 75} y={centerY - 75} width={150} height={150}>
            <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center border-4 border-zinc-300 shadow-inner">
              <MusicalNotation selectedNotes={selectedNotes} activeScale={activeScale} />
            </div>
          </foreignObject>
        </svg>
      </div>
    </div>
  );
};

export default KeySelector;
