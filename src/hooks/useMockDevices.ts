import { useEffect, useRef } from 'react';
import { useAppStore, Device } from '../store/useAppStore';

/**
 * Mock device discovery and management
 * Simulates Bluetooth device discovery and status updates
 */
export function useMockDevices() {
  const { devices, setDevices, updateDevice } = useAppStore((state) => ({
    devices: state.devices,
    setDevices: state.setDevices,
    updateDevice: state.updateDevice,
  }));

  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Initialize with mock devices
    const mockDevices: Device[] = [
      {
        id: 'dev-001',
        name: 'Living Room Strip',
        type: 'strip',
        status: 'connected',
        battery: 85,
        signalStrength: 92,
      },
      {
        id: 'dev-002',
        name: 'Desk Lamp',
        type: 'bulb',
        status: 'connected',
        signalStrength: 78,
      },
      {
        id: 'dev-003',
        name: 'Wall Panel',
        type: 'panel',
        status: 'connected',
        battery: 62,
        signalStrength: 88,
      },
      {
        id: 'dev-004',
        name: 'Bedroom Bulb',
        type: 'bulb',
        status: 'disconnected',
        signalStrength: 45,
      },
    ];

    setDevices(mockDevices);

    // Simulate periodic status updates
    intervalRef.current = setInterval(() => {
      devices.forEach((device) => {
        // Randomly fluctuate signal strength
        const signalDelta = (Math.random() - 0.5) * 10;
        const newSignal = Math.max(
          0,
          Math.min(100, device.signalStrength + signalDelta)
        );

        // Randomly drain battery if present
        const updates: Partial<Device> = {
          signalStrength: Math.round(newSignal),
        };

        if (device.battery !== undefined) {
          const batteryDrain = Math.random() * 0.5;
          updates.battery = Math.max(0, Math.round(device.battery - batteryDrain));
        }

        // Occasionally toggle connection status
        if (Math.random() < 0.02) {
          // 2% chance per update
          updates.status =
            device.status === 'connected' ? 'disconnected' : 'connected';
        }

        updateDevice(device.id, updates);
      });
    }, 2000); // Update every 2 seconds

    // Simulate device discovery after 5 seconds
    const discoveryTimeout = setTimeout(() => {
      const newDevice: Device = {
        id: 'dev-005',
        name: 'Kitchen Strip',
        type: 'strip',
        status: 'connecting',
        signalStrength: 0,
      };

      setDevices([...devices, newDevice]);

      // Connect the device after 2 seconds
      setTimeout(() => {
        updateDevice('dev-005', {
          status: 'connected',
          signalStrength: 85,
          battery: 95,
        });
      }, 2000);
    }, 5000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearTimeout(discoveryTimeout);
    };
  }, []);
}
