import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

export function AudioVisualizer() {
  const audioSnapshot = useAppStore((state) => state.audioSnapshot);
  const { fft, amplitude, bass, mid, treble, bpm, isPlaying } = audioSnapshot;

  return (
    <div className="glass-morphism p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold gradient-text">Audio Analysis</h2>
        <div className="flex items-center gap-2">
          <motion.div
            className={`w-3 h-3 rounded-full ${
              isPlaying ? 'bg-green-400' : 'bg-red-400'
            }`}
            animate={{
              scale: isPlaying ? [1, 1.2, 1] : 1,
              opacity: isPlaying ? [1, 0.6, 1] : 0.5,
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          />
          <span className="text-sm text-gray-300">
            {isPlaying ? 'Playing' : 'Paused'}
          </span>
        </div>
      </div>

      {/* Spectrum Bars */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-400">Frequency Spectrum</h3>
        <div className="flex items-end gap-1 h-32 bg-black/30 rounded-lg p-3">
          {fft.map((value, index) => (
            <motion.div
              key={index}
              className="flex-1 bg-gradient-to-t from-cyan-500 via-purple-500 to-pink-500 rounded-sm"
              initial={{ height: 0 }}
              animate={{
                height: `${value * 100}%`,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
            />
          ))}
        </div>
      </div>

      {/* Audio Metrics */}
      <div className="grid grid-cols-2 gap-4">
        {/* Amplitude Meter */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Amplitude</span>
            <span className="text-xs text-cyan-400 font-mono">
              {(amplitude * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600"
              initial={{ width: 0 }}
              animate={{ width: `${amplitude * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          </div>
        </div>

        {/* Bass Meter */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Bass</span>
            <span className="text-xs text-purple-400 font-mono">
              {(bass * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${bass * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          </div>
        </div>

        {/* Mid Meter */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Mid</span>
            <span className="text-xs text-pink-400 font-mono">
              {(mid * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-400 to-pink-600"
              initial={{ width: 0 }}
              animate={{ width: `${mid * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          </div>
        </div>

        {/* Treble Meter */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Treble</span>
            <span className="text-xs text-yellow-400 font-mono">
              {(treble * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600"
              initial={{ width: 0 }}
              animate={{ width: `${treble * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          </div>
        </div>
      </div>

      {/* BPM Display */}
      <div className="glass-morphism p-4 text-center">
        <div className="text-sm text-gray-400 mb-1">BPM</div>
        <motion.div
          className="text-3xl font-bold gradient-text neon-glow"
          key={bpm}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          {bpm}
        </motion.div>
      </div>
    </div>
  );
}
