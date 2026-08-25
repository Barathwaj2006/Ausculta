import { DevicePacket } from '../types/index';

export class Esp32Simulator {
  private timerId: any = null;
  private phase: number = 0;
  private isRunning: boolean = false;

  public start(onPacketReceived: (packet: DevicePacket) => void): void {
    this.stop();
    this.isRunning = true;
    this.phase = 0;

    const intervalMs = 100;
    const waveLength = 200;
    const wave: number[] = new Array(waveLength);
    this.timerId = setInterval(() => {
      if (!this.isRunning) return;

      for (let i = 0; i < waveLength; i++) {
        const t = this.phase + i * 0.05;
        // Cardiac acoustic waveform with harmonic components and subtle baseline noise
        wave[i] =
          Math.sin(t) * 1000 +
          Math.sin(t * 2.5) * 400 +
          Math.sin(t * 5.0) * 150 +
          (Math.random() * 50 - 25);
      }
      this.phase += 0.5;

      const packet: DevicePacket = {
        wave,
        spo2: 98 + Math.floor(Math.random() * 2), // 98-99%
        bpm: 72 + Math.floor(Math.random() * 6 - 3), // 69-75 BPM
        finger: true,
        active: true,
        timestampMs: Date.now(),
      };

      onPacketReceived(packet);
    }, intervalMs);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
