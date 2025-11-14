import { useEffect, useRef, useState } from 'react';
import { useAppStore, AudioSnapshot } from '../store/useAppStore';

/**
 * Real audio analyzer using Web Audio API
 * Analyzes microphone input or system audio to extract frequency data
 */
export function useAudioAnalyzer() {
  const setAudioSnapshot = useAppStore((state) => state.setAudioSnapshot);
  const [isEnabled, setIsEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const bpmDetectorRef = useRef({
    peaks: [] as number[],
    lastPeakTime: 0,
    bpm: 0,
  });

  // Initialize audio context and analyser
  const initializeAudio = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      streamRef.current = stream;

      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create analyser node
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64; // 32 frequency bins
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Create source from stream
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      // Create data array for frequency data
      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      setIsEnabled(true);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access audio';
      setError(errorMessage);
      setIsEnabled(false);
      console.error('Audio initialization error:', err);
    }
  };

  // Analyze audio data
  const analyzeAudio = () => {
    if (!analyserRef.current || !dataArrayRef.current || !audioContextRef.current) {
      return;
    }

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    // Get frequency data
    analyser.getByteFrequencyData(dataArray);

    // Normalize to 0-1 range
    const fft = Array.from(dataArray).map((value) => value / 255);

    // Calculate frequency bands
    const bass = fft.slice(0, 8).reduce((sum, val) => sum + val, 0) / 8;
    const mid = fft.slice(8, 20).reduce((sum, val) => sum + val, 0) / 12;
    const treble = fft.slice(20).reduce((sum, val) => sum + val, 0) / 12;

    // Overall amplitude
    const amplitude = fft.reduce((sum, val) => sum + val, 0) / fft.length;

    // Simple BPM detection using peak detection
    const detector = bpmDetectorRef.current;
    const currentTime = Date.now();
    const threshold = 0.7;

    if (amplitude > threshold && currentTime - detector.lastPeakTime > 200) {
      detector.peaks.push(currentTime);
      detector.lastPeakTime = currentTime;

      // Keep only last 10 peaks
      if (detector.peaks.length > 10) {
        detector.peaks.shift();
      }

      // Calculate BPM from peak intervals
      if (detector.peaks.length >= 2) {
        const intervals = [];
        for (let i = 1; i < detector.peaks.length; i++) {
          intervals.push(detector.peaks[i] - detector.peaks[i - 1]);
        }
        const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
        detector.bpm = Math.round(60000 / avgInterval);
      }
    }

    // Decay BPM if no recent peaks
    if (currentTime - detector.lastPeakTime > 2000) {
      detector.bpm = Math.max(0, detector.bpm - 1);
    }

    const isPlaying = amplitude > 0.01;

    const snapshot: AudioSnapshot = {
      amplitude,
      bass,
      mid,
      treble,
      fft,
      bpm: detector.bpm,
      isPlaying,
      timestamp: Date.now(),
    };

    setAudioSnapshot(snapshot);
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  };

  // Start analysis loop
  useEffect(() => {
    if (isEnabled && analyserRef.current) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Disconnect audio nodes
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }

      // Stop media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  return {
    isEnabled,
    error,
    initializeAudio,
    stopAudio: () => {
      setIsEnabled(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
      streamRef.current = null;
      audioContextRef.current = null;
      analyserRef.current = null;
      sourceRef.current = null;
    },
  };
}

