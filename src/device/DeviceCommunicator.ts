import { DeviceConnectionState, DevicePacket, Esp32Config } from '../types';
import { Esp32Simulator } from './Esp32Simulator';

export class DeviceCommunicator {
  private config: Esp32Config = {
    ssid: 'ESP32-Ausculta',
    host: '192.168.4.1',
    port: 80,
    endpoint: '/data',
    pollIntervalMs: 100,
  };

  private simulator = new Esp32Simulator();
  private pollTimerId: any = null;
  private isSimulating = false;
  private consecutiveFailures = 0;

  private onStateChangeListeners: ((state: DeviceConnectionState) => void)[] = [];
  private onPacketListeners: ((packet: DevicePacket) => void)[] = [];

  private currentState: DeviceConnectionState = 'DISCONNECTED';
  private latestPacket: DevicePacket = {
    wave: [],
    spo2: 0,
    bpm: 0,
    finger: false,
    active: false,
    timestampMs: Date.now(),
  };

  constructor(config?: Partial<Esp32Config>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  public updateConfig(newConfig: Partial<Esp32Config>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): Esp32Config {
    return { ...this.config };
  }

  public getState(): DeviceConnectionState {
    return this.currentState;
  }

  public getLatestPacket(): DevicePacket {
    return this.latestPacket;
  }

  public addStateListener(listener: (state: DeviceConnectionState) => void): () => void {
    this.onStateChangeListeners.push(listener);
    listener(this.currentState);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter((l) => l !== listener);
    };
  }

  public addPacketListener(listener: (packet: DevicePacket) => void): () => void {
    this.onPacketListeners.push(listener);
    listener(this.latestPacket);
    return () => {
      this.onPacketListeners = this.onPacketListeners.filter((l) => l !== listener);
    };
  }

  private setState(state: DeviceConnectionState): void {
    if (this.currentState !== state) {
      this.currentState = state;
      this.onStateChangeListeners.forEach((l) => l(state));
    }
  }

  private emitPacket(packet: DevicePacket): void {
    this.latestPacket = packet;
    this.onPacketListeners.forEach((l) => l(packet));
  }

  public startConnecting(): void {
    if (this.isSimulating) {
      this.simulator.stop();
      this.isSimulating = false;
    }
    this.setState('CONNECTING');
    this.consecutiveFailures = 0;
    this.startPolling();
  }

  public startSimulationMode(): void {
    this.stopPolling();
    this.isSimulating = true;
    this.setState('SIMULATING');
    this.simulator.start((packet) => {
      if (this.isSimulating) {
        this.emitPacket(packet);
      }
    });
  }

  public disconnect(): void {
    if (this.isSimulating) {
      this.simulator.stop();
      this.isSimulating = false;
    }
    this.stopPolling();
    this.setState('DISCONNECTED');
  }

  private startPolling(): void {
    this.stopPolling();

    const poll = async () => {
      if (this.isSimulating || this.currentState === 'DISCONNECTED') return;

      const targetUrl = `http://${this.config.host}:${this.config.port}${this.config.endpoint}`;
      try {
        // Try proxy first (or direct)
        const proxyUrl = `/api/esp32/proxy?url=${encodeURIComponent(targetUrl)}&timeout=1500`;
        const res = await fetch(proxyUrl);
        if (res.ok) {
          const data = await res.json();
          const packet: DevicePacket = {
            wave: Array.isArray(data.wave) ? data.wave : [],
            spo2: Number(data.spo2) || 0,
            bpm: Number(data.bpm) || 0,
            finger: Boolean(data.finger),
            active: Boolean(data.active),
            timestampMs: Date.now(),
          };
          this.emitPacket(packet);
          this.setState('CONNECTED');
          this.consecutiveFailures = 0;
        } else {
          this.handlePollFailure();
        }
      } catch {
        this.handlePollFailure();
      }

      if (!this.isSimulating && this.currentState !== 'DISCONNECTED') {
        this.pollTimerId = setTimeout(poll, this.config.pollIntervalMs);
      }
    };

    poll();
  }

  private handlePollFailure(): void {
    this.consecutiveFailures++;
    if (this.consecutiveFailures >= 3) {
      this.setState('DEVICE_UNAVAILABLE');
    }
  }

  private stopPolling(): void {
    if (this.pollTimerId) {
      clearTimeout(this.pollTimerId);
      this.pollTimerId = null;
    }
  }
}

export const deviceCommunicator = new DeviceCommunicator();
