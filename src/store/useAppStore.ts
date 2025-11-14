import { create } from 'zustand';

export interface AudioSnapshot {
  amplitude: number; // 0-1
  bass: number; // 0-1
  mid: number; // 0-1
  treble: number; // 0-1
  fft: number[]; // frequency spectrum array
  bpm: number;
  isPlaying: boolean;
  timestamp: number;
}

export interface Device {
  id: string;
  name: string;
  type: 'bulb' | 'strip' | 'panel';
  status: 'connected' | 'disconnected' | 'connecting';
  battery?: number; // 0-100
  signalStrength: number; // 0-100
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[]; // hex colors
  icon?: string;
}

export type Mood = 'calm' | 'energetic' | 'focus' | 'dream';

interface AppState {
  // Audio state
  audioSnapshot: AudioSnapshot;
  setAudioSnapshot: (snapshot: AudioSnapshot) => void;

  // Device state
  devices: Device[];
  addDevice: (device: Device) => void;
  updateDevice: (id: string, updates: Partial<Device>) => void;
  removeDevice: (id: string) => void;
  setDevices: (devices: Device[]) => void;

  // Light controls
  brightness: number; // 0-100
  setBrightness: (value: number) => void;

  selectedPalette: ColorPalette;
  setSelectedPalette: (palette: ColorPalette) => void;

  mood: Mood;
  setMood: (mood: Mood) => void;

  // Available palettes
  palettes: ColorPalette[];
}

// Default palettes
const defaultPalettes: ColorPalette[] = [
  {
    id: 'ocean',
    name: 'Ocean Depths',
    colors: ['#0E4C92', '#2B8CBE', '#7FCDCD', '#B2E0E6'],
    icon: '🌊',
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    colors: ['#FF6B6B', '#FFA07A', '#FFD700', '#FFA500'],
    icon: '🌅',
  },
  {
    id: 'forest',
    name: 'Forest Dream',
    colors: ['#2D5016', '#4A7C2F', '#7CB342', '#AED581'],
    icon: '🌲',
  },
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    colors: ['#00F5FF', '#7B68EE', '#DA70D6', '#FF1493'],
    icon: '✨',
  },
  {
    id: 'fire',
    name: 'Fire Dance',
    colors: ['#8B0000', '#DC143C', '#FF4500', '#FF8C00'],
    icon: '🔥',
  },
  {
    id: 'cosmic',
    name: 'Cosmic Purple',
    colors: ['#2D1B4E', '#512DA8', '#7E57C2', '#B39DDB'],
    icon: '🌌',
  },
];

// Initial audio snapshot
const initialAudioSnapshot: AudioSnapshot = {
  amplitude: 0,
  bass: 0,
  mid: 0,
  treble: 0,
  fft: new Array(32).fill(0),
  bpm: 0,
  isPlaying: false,
  timestamp: Date.now(),
};

export const useAppStore = create<AppState>((set) => ({
  // Audio state
  audioSnapshot: initialAudioSnapshot,
  setAudioSnapshot: (snapshot) => set({ audioSnapshot: snapshot }),

  // Device state
  devices: [],
  addDevice: (device) =>
    set((state) => ({
      devices: [...state.devices, device],
    })),
  updateDevice: (id, updates) =>
    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    })),
  removeDevice: (id) =>
    set((state) => ({
      devices: state.devices.filter((d) => d.id !== id),
    })),
  setDevices: (devices) => set({ devices }),

  // Light controls
  brightness: 75,
  setBrightness: (value) => set({ brightness: value }),

  selectedPalette: defaultPalettes[0],
  setSelectedPalette: (palette) => set({ selectedPalette: palette }),

  mood: 'calm',
  setMood: (mood) => set({ mood }),

  palettes: defaultPalettes,
}));
