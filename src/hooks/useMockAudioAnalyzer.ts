import { useEffect, useRef } from 'react';
import { useAppStore, AudioSnapshot } from '../store/useAppStore';

/**
 * Mock audio analyzer that simulates real-time audio analysis
 * Generates FFT spectrum data, amplitude, bass, mid, treble values
 * Updates the store continuously for reactive UI
 */
export function useMockAudioAnalyzer() {
  const setAudioSnapshot = useAppStore((state) => state.setAudioSnapshot);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    let isPlaying = false;
    let phase = 0;

    const updateAudioData = () => {
      timeRef.current += 0.016; // ~60fps
      phase += 0.05;

      // Simulate playing state toggle every 10 seconds
      if (Math.floor(timeRef.current) % 10 === 0 && timeRef.current % 1 < 0.02) {
        isPlaying = !isPlaying;
      }

      // Generate realistic audio values with smooth transitions
      const bassWave = Math.sin(phase * 0.5) * 0.5 + 0.5;
      const midWave = Math.sin(phase * 1.5) * 0.5 + 0.5;
      const trebleWave = Math.sin(phase * 3) * 0.5 + 0.5;

      // Generate FFT spectrum (32 frequency bins)
      const fft = Array.from({ length: 32 }, (_, i) => {
        const frequency = i / 32;
        const bassComponent = bassWave * Math.exp(-frequency * 5);
        const midComponent = midWave * Math.exp(-Math.pow(frequency - 0.5, 2) * 8);
        const trebleComponent = trebleWave * Math.exp(-Math.pow(frequency - 0.8, 2) * 6);

        // Add some randomness for realism
        const noise = (Math.random() - 0.5) * 0.1;
        const value = bassComponent + midComponent + trebleComponent + noise;

        return isPlaying ? Math.max(0, Math.min(1, value)) : 0;
      });

      // Overall amplitude is average of FFT
      const amplitude = isPlaying
        ? fft.reduce((sum, val) => sum + val, 0) / fft.length
        : 0;

      // Bass is average of lower frequencies
      const bass = isPlaying
        ? fft.slice(0, 8).reduce((sum, val) => sum + val, 0) / 8
        : 0;

      // Mid is average of middle frequencies
      const mid = isPlaying
        ? fft.slice(8, 20).reduce((sum, val) => sum + val, 0) / 12
        : 0;

      // Treble is average of higher frequencies
      const treble = isPlaying
        ? fft.slice(20).reduce((sum, val) => sum + val, 0) / 12
        : 0;

      // Simulate BPM detection (oscillates between 90-140)
      const bpm = isPlaying ? Math.round(115 + Math.sin(phase * 0.1) * 25) : 0;

      const snapshot: AudioSnapshot = {
        amplitude,
        bass,
        mid,
        treble,
        fft,
        bpm,
        isPlaying,
        timestamp: Date.now(),
      };

      setAudioSnapshot(snapshot);
      animationFrameRef.current = requestAnimationFrame(updateAudioData);
    };

    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(updateAudioData);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [setAudioSnapshot]);
}
