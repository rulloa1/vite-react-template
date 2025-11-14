import { useEffect, useRef, useState } from "react";
import { useAppStore, Device } from "../store/useAppStore";

interface BluetoothRemoteGATTCharacteristicLike {
  readValue(): Promise<DataView>;
}

interface BluetoothRemoteGATTServiceLike {
  getCharacteristic(
    characteristic: string,
  ): Promise<BluetoothRemoteGATTCharacteristicLike>;
}

interface BluetoothRemoteGATTServerLike {
  connect(): Promise<BluetoothRemoteGATTServerLike>;
  disconnect(): void;
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTServiceLike>;
  connected?: boolean;
}

interface BluetoothDeviceLike {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATTServerLike;
  addEventListener(
    type: "gattserverdisconnected",
    listener: (event: Event) => void,
  ): void;
}

interface BluetoothNavigator {
  requestDevice(options: {
    acceptAllDevices?: boolean;
    optionalServices?: string[];
  }): Promise<BluetoothDeviceLike>;
}

interface NavigatorWithBluetooth extends Navigator {
  bluetooth?: BluetoothNavigator;
}

/**
 * Real device manager using Web Bluetooth API
 * Discovers and manages Bluetooth Low Energy (BLE) devices
 */
export function useDeviceManager() {
  const { devices, addDevice, updateDevice, removeDevice } = useAppStore(
    (state) => ({
      devices: state.devices,
      addDevice: state.addDevice,
      updateDevice: state.updateDevice,
      removeDevice: state.removeDevice,
    }),
  );

  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connectedDevicesRef = useRef<Map<string, BluetoothDeviceLike>>(
    new Map(),
  );

  // Check if Web Bluetooth is available
  const getBluetooth = () => {
    const bluetoothNavigator = navigator as NavigatorWithBluetooth;
    return bluetoothNavigator.bluetooth ?? null;
  };

  const isBluetoothAvailable = () => {
    return Boolean(getBluetooth());
  };

  const getErrorDetails = (
    error: unknown,
  ): { name?: string; message: string } => {
    if (error instanceof Error) {
      return { name: error.name, message: error.message };
    }
    return { message: String(error ?? "Unknown error") };
  };

  // Request Bluetooth device
  const requestDevice = async () => {
    if (!isBluetoothAvailable()) {
      setError("Web Bluetooth API is not available in this browser");
      return;
    }

    try {
      setError(null);
      setIsScanning(true);

      const bluetooth = getBluetooth();
      if (!bluetooth) {
        throw new Error("Web Bluetooth API is not available in this browser");
      }

      // Request device with specific service UUIDs for lighting devices
      // Common BLE service UUIDs for smart lighting
      const device = await bluetooth.requestDevice({
        acceptAllDevices: true, // Accept any BLE device for now
        optionalServices: [
          "0000180f-0000-1000-8000-00805f9b34fb", // Battery Service
          "0000180a-0000-1000-8000-00805f9b34fb", // Device Information
        ],
      });

      await connectToDevice(device);
    } catch (err) {
      const { name, message } = getErrorDetails(err);
      if (name === "NotFoundError") {
        setError("No device selected");
      } else if (name === "SecurityError") {
        setError("Bluetooth access denied");
      } else {
        setError(message || "Failed to connect to device");
      }
      setIsScanning(false);
      console.error("Bluetooth error:", err);
    }
  };

  // Connect to a Bluetooth device
  const connectToDevice = async (bluetoothDevice: BluetoothDeviceLike) => {
    try {
      if (!bluetoothDevice.gatt) {
        throw new Error("Device GATT server not available");
      }

      const server = await bluetoothDevice.gatt.connect();
      connectedDevicesRef.current.set(bluetoothDevice.id, bluetoothDevice);

      // Determine device type based on name or services
      let deviceType: "bulb" | "strip" | "panel" = "bulb";
      const name = bluetoothDevice.name || "Unknown Device";
      if (name.toLowerCase().includes("strip")) {
        deviceType = "strip";
      } else if (name.toLowerCase().includes("panel")) {
        deviceType = "panel";
      }

      // Create device object
      const device: Device = {
        id: bluetoothDevice.id,
        name: name,
        type: deviceType,
        status: "connected",
        signalStrength: 100, // BLE doesn't provide direct signal strength
      };

      // Try to read battery level if available
      try {
        const batteryService =
          await server.getPrimaryService("battery_service");
        const batteryLevelCharacteristic =
          await batteryService.getCharacteristic("battery_level");
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
      bluetoothDevice.addEventListener("gattserverdisconnected", () => {
        updateDevice(device.id, { status: "disconnected" });
        connectedDevicesRef.current.delete(bluetoothDevice.id);
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect";
      setError(errorMessage);
      setIsScanning(false);
      console.error("Connection error:", err);
    }
  };

  // Disconnect a device
  const disconnectDevice = async (deviceId: string) => {
    const bluetoothDevice = connectedDevicesRef.current.get(deviceId);
    if (bluetoothDevice && bluetoothDevice.gatt) {
      try {
        bluetoothDevice.gatt.disconnect();
        updateDevice(deviceId, { status: "disconnected" });
        connectedDevicesRef.current.delete(deviceId);
      } catch (err) {
        console.error("Disconnect error:", err);
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
    const connectedDevices = connectedDevicesRef.current;
    return () => {
      // Disconnect all devices
      connectedDevices.forEach((device) => {
        const gatt = device.gatt;
        if (gatt?.connected) {
          try {
            gatt.disconnect();
          } catch (cleanupError) {
            console.error("Error while disconnecting device", cleanupError);
          }
        }
      });
      connectedDevices.clear();
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
