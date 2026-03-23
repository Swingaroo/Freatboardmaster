import * as Tone from 'tone';

// Using a more reliable and faster loading soundfont source
const SOUNDFONT_URL = 'https://nbrosowsky.github.io/tonejs-instruments/samples/';

const INSTRUMENT_MAP: Record<string, string> = {
  'Guitar': 'guitar-acoustic',
  'Bass': 'bass-electric',
  'Banjo': 'banjo',
  'Ukulele': 'ukulele',
};

class AudioService {
  private sampler: Tone.Sampler | null = null;
  private fallbackSynth: Tone.PolySynth;
  private isInitialized: boolean = false;
  private currentInstrument: string = 'Guitar';
  private isLoading: boolean = false;

  constructor() {
    // Initialize a simple fallback synth that is always ready
    this.fallbackSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
    }).toDestination();
  }

  private async init() {
    if (this.isInitialized) return;
    try {
      await Tone.start();
      console.log('Tone.js Context started');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to start Tone.js:', error);
    }
  }

  public async setInstrument(instrumentName: string) {
    await this.init();
    
    if (this.currentInstrument === instrumentName && this.sampler) return;

    this.isLoading = true;
    this.currentInstrument = instrumentName;
    const folder = INSTRUMENT_MAP[instrumentName] || INSTRUMENT_MAP['Guitar'];
    
    // Dispose old sampler if it exists
    if (this.sampler) {
      this.sampler.dispose();
      this.sampler = null;
    }

    console.log(`Loading samples for ${instrumentName}...`);

    return new Promise<void>((resolve) => {
      this.sampler = new Tone.Sampler({
        urls: {
          A0: "A0.mp3",
          C1: "C1.mp3",
          "D#1": "Ds1.mp3",
          "F#1": "Fs1.mp3",
          A1: "A1.mp3",
          C2: "C2.mp3",
          "D#2": "Ds2.mp3",
          "F#2": "Fs2.mp3",
          A2: "A2.mp3",
          C3: "C3.mp3",
          "D#3": "Ds3.mp3",
          "F#3": "Fs3.mp3",
          A3: "A3.mp3",
          C4: "C4.mp3",
          "D#4": "Ds4.mp3",
          "F#4": "Fs4.mp3",
          A4: "A4.mp3",
          C5: "C5.mp3",
          "D#5": "Ds5.mp3",
          "F#5": "Fs5.mp3",
          A5: "A5.mp3",
          C6: "C6.mp3",
          "D#6": "Ds6.mp3",
          "F#6": "Fs6.mp3",
          A6: "A6.mp3",
          C7: "C7.mp3",
          "D#7": "Ds7.mp3",
          "F#7": "Fs7.mp3",
          A7: "A7.mp3",
          C8: "C8.mp3"
        },
        baseUrl: `${SOUNDFONT_URL}${folder}/`,
        onload: () => {
          console.log(`${instrumentName} sampler loaded successfully`);
          this.isLoading = false;
          resolve();
        },
        onerror: (err) => {
          console.error(`Error loading samples for ${instrumentName}:`, err);
          this.isLoading = false;
          resolve(); // Resolve anyway to allow fallback usage
        }
      }).toDestination();
    });
  }

  public async playNote(note: string, octave: number) {
    await this.init();
    const fullNote = `${note}${octave}`;

    // If sampler is loaded, use it. Otherwise use fallback synth.
    if (this.sampler && this.sampler.loaded) {
      this.sampler.triggerAttackRelease(fullNote, '8n');
    } else {
      console.log('Using fallback synth (sampler not ready)');
      this.fallbackSynth.triggerAttackRelease(fullNote, '8n');
      
      // If sampler isn't even created, try to create it
      if (!this.sampler && !this.isLoading) {
        this.setInstrument(this.currentInstrument);
      }
    }
  }
}

export const audioService = new AudioService();
