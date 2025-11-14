import { useEffect, useRef, useState } from 'react';
import { useAppStore, Device } from '../store/useAppStore';

/**
 * Real device manager using Web Bluetooth API
 * Discovers and manages Bluetooth Low Energy (BLE) devices
 */
export function useDeviceManager() {
  const { devices, addDevice, updateDevice, removeDevice } = useAppStore((state) => ({
    devices: state.devices,
    addDevice: state.addDevice,
    updateDevice: state.updateDevice,
    removeDevice: state.removeDevice,
  }));

  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connectedDevicesRef = useRef<Map<string, any>>(new Map());

  // Check if Web Bluetooth is available
  const isBluetoothAvailable = () => {
    return 'bluetooth' in navigator;
  };

  // Request Bluetooth device
  const requestDevice = async () => {
    if (!isBluetoothAvailable()) {
      setError('Web Bluetooth API is not available in this browser');
      return;
    }

    try {
      setError(null);
      setIsScanning(true);

      // Request device with specific service UUIDs for lighting devices
      // Common BLE service UUIDs for smart lighting
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true, // Accept any BLE device for now
        optionalServices: [
          '0000180f-0000-1000-8000-00805f9b34fb', // Battery Service
          '0000180a-0000-1000-8000-00805f9b34fb', // Device Information
        ],
      });

      await connectToDevice(device);
    } catch (err: any) {
      if (err.name === 'NotFoundError') {
        setError('No device selected');
      } else if (err.name === 'SecurityError') {
        setError('Bluetooth access denied');
      } else {
        setError(err.message || 'Failed to connect to device');
      }
      setIsScanning(false);
      console.error('Bluetooth error:', err);
    }
  };

  // Connect to a Bluetooth device
  const connectToDevice = async (bluetoothDevice: any) => {
    try {
      if (!bluetoothDevice.gatt) {
        throw new Error('Device GATT server not available');
      }

      const server = await bluetoothDevice.gatt.connect();
      connectedDevicesRef.current.set(bluetoothDevice.id, bluetoothDevice);

      // Determine device type based on name or services
      let deviceType: 'bulb' | 'strip' | 'panel' = 'bulb';
      const name = bluetoothDevice.name || 'Unknown Device';
      if (name.toLowerCase().includes('strip')) {
        deviceType = 'strip';
      } else if (name.toLowerCase().includes('panel')) {
        deviceType = 'panel';
      }

      // Create device object
      const device: Device = {
        id: bluetoothDevice.id,
        name: name,
        type: deviceType,
        status: 'connected',
        signalStrength: 100, // BLE doesn't provide direct signal strength
      };

      // Try to read battery level if available
      try {
        const batteryService = await server.getPrimaryService('battery_service');
        const batteryLevelCharacteristic = await batteryService.getCharacteristic('battery_level');
        const batteryData = await batteryLevelCharacteristic.readValue();
        const batteryLevel = batteryData.getUint8(0);
        device.battery = batteryLevel;
      } catch {
        // Battery service not available, that's okay
      }

      // Add or update device
      const existingDevice = devices.find((d) => d.id === device.id);
      if (existingDevice) {
        updateDevice(device.id, device);
      } else {
        addDevice(device);
      }

      setIsScanning(false);

      // Listen for device disconnection
      bluetoothDevice.addEventListener('gattserverdisconnected', () => {
        updateDevice(device.id, { status: 'disconnected' });
        connectedDevicesRef.current.delete(bluetoothDevice.id);
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
      setError(errorMessage);
      setIsScanning(false);
      console.error('Connection error:', err);
    }
  };

  // Disconnect a device
  const disconnectDevice = async (deviceId: string) => {
    const bluetoothDevice = connectedDevicesRef.current.get(deviceId);
    if (bluetoothDevice && bluetoothDevice.gatt) {
      try {
        bluetoothDevice.gatt.disconnect();
        updateDevice(deviceId, { status: 'disconnected' });
        connectedDevicesRef.current.delete(deviceId);
      } catch (err) {
        console.error('Disconnect error:', err);
      }
    }
  };

  // Remove a device
  const removeDeviceHandler = async (deviceId: string) => {
    await disconnectDevice(deviceId);
    removeDevice(deviceId);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Disconnect all devices
      connectedDevicesRef.current.forEach((device) => {
        if (device.gatt) {
          device.gatt.disconnect().catch(console.error);
        }
      });
      connectedDevicesRef.current.clear();
    };
  }, []);

  return {
    devices,
    isScanning,
    error,
    isBluetoothAvailable: isBluetoothAvailable(),
    requestDevice,
    disconnectDevice,
    removeDevice: removeDeviceHandler,
  };
}

