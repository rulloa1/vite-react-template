import { motion } from 'framer-motion';
import { ThreeScene } from './ThreeScene';
import { AudioVisualizer } from './AudioVisualizer';
import { DeviceManager } from './DeviceManager';
import { LightControls } from './LightControls';
import { useMockAudioAnalyzer } from '../hooks/useMockAudioAnalyzer';
import { useMockDevices } from '../hooks/useMockDevices';

export function ControllerLayout() {
  // Initialize mock data hooks
  useMockAudioAnalyzer();
  useMockDevices();

  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <motion.header
        className="relative z-10 p-6 glass-morphism m-4"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text neon-glow">
              Resonance Control Hub
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Immersive Audio-Reactive Lighting Control
            </p>
          </div>
          <motion.div
            className="flex items-center gap-2 glass-morphism px-4 py-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-300">System Active</span>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 h-[calc(100vh-120px)]">
        {/* Left Panel - Three.js Scene */}
        <motion.div
          className="lg:col-span-2 glass-morphism overflow-hidden"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ThreeScene />
        </motion.div>

        {/* Right Panel - Controls */}
        <div className="space-y-4 overflow-y-auto scrollbar-hide">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AudioVisualizer />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <LightControls />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <DeviceManager />
          </motion.div>
        </div>
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" />
      </div>
    </div>
  );
}
