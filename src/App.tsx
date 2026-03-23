import { useState, useEffect } from 'react';
import Fretboard from './components/Fretboard';
import KeySelector from './components/KeySelector';
import { Music, Guitar, Settings2, Sliders, Volume2, VolumeX } from 'lucide-react';
import { ORIENTATION_MODES, FretboardOrientation, Instrument, Tuning } from './types';
import instrumentData from './config/instruments.json';
import { audioService } from './services/audioService';
import * as Tone from 'tone';

const instruments: Instrument[] = instrumentData.instruments;

export default function App() {
  const [selectedNotes, setSelectedNotes] = useState<Record<string, string | null>>({ 'C': null });
  const [activeScale, setActiveScale] = useState<{ root: string, mode: 'major' | 'minor' } | null>(null);
  const [orientation, setOrientation] = useState<FretboardOrientation>(ORIENTATION_MODES[0]);
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>(instruments[0]);
  const [selectedTuning, setSelectedTuning] = useState<Tuning>(instruments[0].tunings[0]);
  const [isAudioContextRunning, setIsAudioContextRunning] = useState(false);

  useEffect(() => {
    audioService.setInstrument(selectedInstrument.name);
  }, [selectedInstrument]);

  useEffect(() => {
    const checkAudio = setInterval(() => {
      if (Tone.getContext().state === 'running') {
        setIsAudioContextRunning(true);
      } else {
        setIsAudioContextRunning(false);
      }
    }, 1000);
    return () => clearInterval(checkAudio);
  }, []);

  const startAudio = async () => {
    await Tone.start();
    setIsAudioContextRunning(true);
    audioService.setInstrument(selectedInstrument.name);
  };

  const toggleNote = (note: string) => {
    setSelectedNotes(prev => {
      const next = { ...prev };
      if (next[note] !== undefined) {
        delete next[note];
      } else {
        next[note] = null;
      }
      return next;
    });
  };

  const handleScaleChange = (root: string, mode: 'major' | 'minor', notes: Record<string, string | null>) => {
    setActiveScale({ root, mode });
    setSelectedNotes(notes);
  };

  const handleInstrumentChange = (instrumentName: string) => {
    const instrument = instruments.find(i => i.name === instrumentName);
    if (instrument) {
      setSelectedInstrument(instrument);
      setSelectedTuning(instrument.tunings[0]);
    }
  };

  const handleTuningChange = (tuningName: string) => {
    const tuning = selectedInstrument.tunings.find(t => t.name === tuningName);
    if (tuning) {
      setSelectedTuning(tuning);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-zinc-100 p-4 md:p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500 rounded-lg">
            <Guitar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Fretboard Master</h1>
            <p className="text-zinc-500 text-sm">Visualizer & Theory Helper</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={startAudio}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              isAudioContextRunning 
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                : 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 animate-pulse'
            }`}
          >
            {isAudioContextRunning ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            {isAudioContextRunning ? 'Audio Active' : 'Enable Audio'}
          </button>
          <div className="hidden sm:flex items-center gap-4 text-zinc-400 text-sm font-medium">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              <span>{selectedInstrument.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              <span>{selectedTuning.name}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-12">
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <h2 className="text-lg font-semibold text-zinc-300 italic serif">Guitar Neck</h2>
              
              <div className="flex items-center gap-2 bg-zinc-900/80 p-1 rounded-lg border border-white/5">
                <Guitar className="w-3.5 h-3.5 text-zinc-500 ml-2" />
                <select 
                  value={selectedInstrument.name}
                  onChange={(e) => handleInstrumentChange(e.target.value)}
                  className="bg-transparent text-xs font-medium text-zinc-300 focus:outline-none pr-2 cursor-pointer"
                >
                  {instruments.map((inst) => (
                    <option key={inst.name} value={inst.name} className="bg-zinc-900 text-zinc-300">
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-zinc-900/80 p-1 rounded-lg border border-white/5">
                <Sliders className="w-3.5 h-3.5 text-zinc-500 ml-2" />
                <select 
                  value={selectedTuning.name}
                  onChange={(e) => handleTuningChange(e.target.value)}
                  className="bg-transparent text-xs font-medium text-zinc-300 focus:outline-none pr-2 cursor-pointer"
                >
                  {selectedInstrument.tunings.map((tuning) => (
                    <option key={tuning.name} value={tuning.name} className="bg-zinc-900 text-zinc-300">
                      {tuning.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-zinc-900/80 p-1 rounded-lg border border-white/5">
              <Settings2 className="w-4 h-4 text-zinc-500 ml-2" />
              <select 
                value={ORIENTATION_MODES.findIndex(m => m.nutOnLeft === orientation.nutOnLeft && m.lowStringOnBottom === orientation.lowStringOnBottom) + 1}
                onChange={(e) => setOrientation(ORIENTATION_MODES[parseInt(e.target.value) - 1])}
                className="bg-transparent text-xs font-medium text-zinc-300 focus:outline-none pr-2 cursor-pointer"
              >
                {ORIENTATION_MODES.map((mode, idx) => (
                  <option key={mode.id} value={idx + 1} className="bg-zinc-900 text-zinc-300">
                    {mode.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Fretboard selectedNotes={selectedNotes} orientation={orientation} tuning={selectedTuning} />
        </section>

        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-[0.2em] mb-4">Select Notes</h2>
            <KeySelector 
              selectedNotes={selectedNotes} 
              onToggle={toggleNote} 
              onSelectNotes={setSelectedNotes} 
              onScaleChange={handleScaleChange}
              activeScale={activeScale}
            />
          </div>
        </section>

        <section className="max-w-2xl mx-auto mt-16 p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Quick Tips
          </h3>
          <ul className="space-y-3 text-sm text-zinc-400 leading-relaxed">
            <li>• Select multiple notes below to visualize scales, chords, or intervals across the first 14 frets.</li>
            <li>• Click a note to toggle it on or off.</li>
            <li>• Use this to visualize scale patterns and chord shapes.</li>
            <li>• Scroll the fretboard horizontally if you're on a smaller screen.</li>
          </ul>
        </section>
      </main>

      <footer className="mt-20 text-center text-zinc-600 text-xs font-mono uppercase tracking-widest">
        &copy; {new Date().getFullYear()} Fretboard Master
      </footer>
    </div>
  );
}
