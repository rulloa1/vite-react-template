import { motion } from 'framer-motion';
import { useAppStore, Mood } from '../store/useAppStore';

const moods: { value: Mood; label: string; icon: string }[] = [
  { value: 'calm', label: 'Calm', icon: '🌊' },
  { value: 'energetic', label: 'Energetic', icon: '⚡' },
  { value: 'focus', label: 'Focus', icon: '🎯' },
  { value: 'dream', label: 'Dream', icon: '💫' },
];

export function LightControls() {
  const {
    brightness,
    setBrightness,
    selectedPalette,
    setSelectedPalette,
    mood,
    setMood,
    palettes,
  } = useAppStore();

  return (
    <div className="glass-morphism p-6 space-y-6">
      <h2 className="text-xl font-bold gradient-text mb-4">Light Controls</h2>

      {/* Brightness Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-300">
            Brightness
          </label>
          <span className="text-sm text-cyan-400 font-mono">
            {brightness}%
          </span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-gray-700 via-cyan-500 to-cyan-400 rounded-full appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, rgb(55 65 81) 0%, rgb(6 182 212) ${brightness}%, rgb(55 65 81) ${brightness}%)`,
            }}
          />
        </div>
      </div>

      {/* Color Palettes */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">
          Color Palette
        </label>
        <div className="grid grid-cols-2 gap-3">
          {palettes.map((palette) => (
            <motion.button
              key={palette.id}
              onClick={() => setSelectedPalette(palette)}
              className={`relative p-3 rounded-lg border-2 transition-all ${
                selectedPalette.id === palette.id
                  ? 'border-cyan-400 bg-white/10'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{palette.icon}</span>
                <span className="text-sm font-medium text-white">
                  {palette.name}
                </span>
              </div>
              <div className="flex gap-1">
                {palette.colors.map((color, index) => (
                  <motion.div
                    key={index}
                    className="flex-1 h-6 rounded"
                    style={{ backgroundColor: color }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  />
                ))}
              </div>
              {selectedPalette.id === palette.id && (
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center"
                  layoutId="selected-palette"
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                  }}
                >
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Mood Toggles */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">Mood</label>
        <div className="grid grid-cols-4 gap-2">
          {moods.map((moodOption) => (
            <motion.button
              key={moodOption.value}
              onClick={() => setMood(moodOption.value)}
              className={`relative p-3 rounded-lg border-2 transition-all ${
                mood === moodOption.value
                  ? 'border-purple-400 bg-purple-500/20'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="text-2xl mb-1">{moodOption.icon}</div>
              <div className="text-xs font-medium text-white">
                {moodOption.label}
              </div>
              {mood === moodOption.value && (
                <motion.div
                  className="absolute inset-0 border-2 border-purple-400 rounded-lg"
                  layoutId="selected-mood"
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                  }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Sync Status */}
      <div className="glass-morphism p-4 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
            <span className="text-sm text-gray-300">Sync Active</span>
          </div>
          <span className="text-xs text-gray-400">
            {useAppStore((state) => state.devices.filter((d) => d.status === 'connected').length)}{' '}
            devices
          </span>
        </div>
      </div>
    </div>
  );
}
