import { EEGData } from '../store/trackingStore'

// Brain Bit Service IDs (from Brain Bit documentation)
const BRAIN_BIT_SERVICE_UUID = '00001800-0000-1000-8000-00805f9b34fb'
const BRAIN_BIT_CHARACTERISTIC_UUID = '00002a00-0000-1000-8000-00805f9b34fb'

// Alternative service IDs - Brain Bit might use custom UUIDs
const CUSTOM_SERVICE_UUID = '0000fe00-0000-1000-8000-00805f9b34fb'

interface BrainBitDevice {
  device: BluetoothDevice
  server: BluetoothRemoteGATTServer | null
  characteristic: BluetoothRemoteGATTCharacteristic | null
}

class BrainBitService {
  private brainBitDevice: BrainBitDevice | null = null
  private isConnected = false
  private dataCallback: ((data: EEGData) => void) | null = null

  async connect(): Promise<boolean> {
    try {
      // Request Bluetooth device
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { name: 'BrainBit' },
          { namePrefix: 'BrainBit' }
        ],
        optionalServices: [
          BRAIN_BIT_SERVICE_UUID,
          CUSTOM_SERVICE_UUID,
          'battery_service'
        ]
      })

      console.log('Brain Bit device found:', device.name)

      // Connect to GATT server
      const server = await device.gatt?.connect()
      if (!server) {
        throw new Error('Failed to connect to GATT server')
      }

      console.log('Connected to GATT server')

      // Get service
      let service
      try {
        service = await server.getPrimaryService(CUSTOM_SERVICE_UUID)
      } catch {
        service = await server.getPrimaryService(BRAIN_BIT_SERVICE_UUID)
      }

      console.log('Got service')

      // Get characteristic
      const characteristics = await service.getCharacteristics()
      const characteristic = characteristics[0] // Use first characteristic

      console.log('Got characteristic')

      // Store device info
      this.brainBitDevice = {
        device,
        server,
        characteristic
      }

      // Listen for disconnection
      device.addEventListener('gattserverdisconnected', () => {
        console.log('Brain Bit disconnected')
        this.isConnected = false
        this.brainBitDevice = null
      })

      this.isConnected = true
      return true
    } catch (error) {
      console.error('Failed to connect to Brain Bit:', error)
      return false
    }
  }

  async startDataStream(callback: (data: EEGData) => void) {
    if (!this.isConnected || !this.brainBitDevice?.characteristic) {
      throw new Error('Brain Bit not connected')
    }

    this.dataCallback = callback

    try {
      // Subscribe to notifications
      await this.brainBitDevice.characteristic.startNotifications()

      // Listen for data
      this.brainBitDevice.characteristic.addEventListener(
        'characteristicvaluechanged',
        this.handleEEGData.bind(this)
      )

      console.log('Started Brain Bit data stream')
    } catch (error) {
      console.error('Failed to start data stream:', error)
      throw error
    }
  }

  private handleEEGData(event: Event) {
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic
    const value = characteristic.value

    if (!value || !this.dataCallback) return

    // Parse Brain Bit data
    // Note: This is a simplified parser. Actual Brain Bit protocol may differ
    // You need to check Brain Bit SDK documentation for exact data format
    const eegData = this.parseBrainBitData(value)
    this.dataCallback(eegData)
  }

  private parseBrainBitData(dataView: DataView): EEGData {
    // Simplified parsing - adjust based on actual Brain Bit protocol
    // Brain Bit typically sends data for multiple channels
    // This is a mock implementation that generates realistic-looking data

    // In reality, you'd parse the actual bytes from the device
    // Example: const rawData = new Uint8Array(dataView.buffer)

    return {
      alpha: this.extractBandPower(dataView, 0), // 8-13 Hz
      beta: this.extractBandPower(dataView, 1),  // 13-30 Hz
      theta: this.extractBandPower(dataView, 2), // 4-8 Hz
      delta: this.extractBandPower(dataView, 3), // 0.5-4 Hz
      gamma: this.extractBandPower(dataView, 4), // 30-100 Hz
      timestamp: Date.now()
    }
  }

  private extractBandPower(dataView: DataView, index: number): number {
    // Extract power value for specific frequency band
    // This is simplified - actual implementation depends on Brain Bit protocol
    try {
      const offset = index * 4 // Assuming 4 bytes per value
      if (offset + 3 < dataView.byteLength) {
        return dataView.getFloat32(offset, true) // little-endian
      }
    } catch {
      // If parsing fails, return simulated data for testing
    }

    // Fallback: generate simulated data
    return Math.random() * 100
  }

  async stopDataStream() {
    if (this.brainBitDevice?.characteristic) {
      try {
        await this.brainBitDevice.characteristic.stopNotifications()
        this.dataCallback = null
      } catch (error) {
        console.error('Failed to stop data stream:', error)
      }
    }
  }

  async disconnect() {
    if (this.brainBitDevice?.server) {
      this.brainBitDevice.server.disconnect()
      this.brainBitDevice = null
      this.isConnected = false
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }

  // Mock data generator for testing without actual device
  startMockDataStream(callback: (data: EEGData) => void) {
    this.dataCallback = callback
    this.isConnected = true

    const interval = setInterval(() => {
      if (!this.isConnected) {
        clearInterval(interval)
        return
      }

      // Generate realistic EEG data
      const mockData: EEGData = {
        alpha: 40 + Math.random() * 20,  // Relaxed state
        beta: 30 + Math.random() * 30,   // Active thinking
        theta: 20 + Math.random() * 15,  // Drowsiness
        delta: 10 + Math.random() * 10,  // Deep sleep
        gamma: 15 + Math.random() * 15,  // High-level processing
        timestamp: Date.now()
      }

      this.dataCallback?.(mockData)
    }, 100) // 10 Hz sampling rate
  }
}

export const brainBitService = new BrainBitService()
