import React from 'react';
import { NOTE_COLORS } from '../constants';

interface ChordButtonProps {
  numeral: string;
  root: string;
  notes: Record<string, string | null>;
  isSelected: boolean;
  onClick: (notes: Record<string, string | null>) => void;
}

const ChordButton: React.FC<ChordButtonProps> = ({ numeral, root, notes, isSelected, onClick }) => {
  const color = NOTE_COLORS[root];
  
  return (
    <button
      onClick={() => onClick(notes)}
      style={isSelected ? { backgroundColor: color, borderColor: color, boxShadow: `0 0 15px ${color}40` } : {}}
      className={`
        px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 min-w-[80px]
        ${isSelected 
          ? 'text-white scale-105 ring-2 ring-white/20' 
          : 'bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 border border-white/5'
        }
      `}
    >
      <span className="opacity-60 mr-2 text-[10px]">{numeral}</span>
      {root}
    </button>
  );
};

export default ChordButton;
