import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

const deviceIcons = {
  bulb: '💡',
  strip: '🌈',
  panel: '🔲',
};

const statusColors = {
  connected: 'bg-green-500',
  disconnected: 'bg-red-500',
  connecting: 'bg-yellow-500',
};

export function DeviceManager() {
  const devices = useAppStore((state) => state.devices);

  return (
    <div className="glass-morphism p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold gradient-text">Device Manager</h2>
        <div className="text-sm text-gray-400">
          {devices.filter((d) => d.status === 'connected').length}/
          {devices.length} connected
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {devices.map((device) => (
            <motion.div
              key={device.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }}
              className="glass-morphism p-4 hover:bg-white/15 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-3xl">{deviceIcons[device.type]}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">
                        {device.name}
                      </h3>
                      <motion.div
                        className={`w-2 h-2 rounded-full ${
                          statusColors[device.status]
                        }`}
                        animate={
                          device.status === 'connecting'
                            ? {
                                scale: [1, 1.3, 1],
                                opacity: [1, 0.5, 1],
                              }
                            : {}
                        }
                        transition={{
                          duration: 1,
                          repeat: device.status === 'connecting' ? Infinity : 0,
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400 capitalize">
                        {device.type}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400 capitalize">
                        {device.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {/* Signal Strength */}
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-sm ${
                            device.signalStrength > i * 25
                              ? 'bg-cyan-400'
                              : 'bg-gray-600'
                          }`}
                          style={{ height: `${(i + 1) * 3}px` }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      {device.signalStrength}%
                    </span>
                  </div>

                  {/* Battery Level */}
                  {device.battery !== undefined && (
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 border border-gray-500 rounded-sm relative overflow-hidden">
                        <motion.div
                          className={`h-full ${
                            device.battery > 50
                              ? 'bg-green-400'
                              : device.battery > 20
                                ? 'bg-yellow-400'
                                : 'bg-red-400'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${device.battery}%` }}
                          transition={{ type: 'spring', stiffness: 200 }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 font-mono">
                        {device.battery}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {devices.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-sm">No devices found</p>
          <p className="text-xs mt-1">Searching for Bluetooth devices...</p>
        </div>
      )}
    </div>
  );
}
