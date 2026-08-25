/**
 * Web Audio API Acoustic Stethoscope Synthesizer
 * Generates realistic acoustic feedback (S1 / S2 cardiac beats and respiratory murmurs/breath sounds)
 * for real-time live headphone/speaker monitoring and recorded session listening.
 */
export class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isLiveListening: boolean = false;
  private nextBeatTime: number = 0;
  private timerId: any = null;
  private currentBpm: number = 72;
  private isLungMode: boolean = false;
  private noiseNode: AudioNode | null = null;

  public init(): void {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  public startLiveMonitoring(bpm: number = 72, isLungMode: boolean = false): void {
    this.init();
    this.isLiveListening = true;
    this.currentBpm = bpm || 72;
    this.isLungMode = isLungMode;
    this.scheduleNextBeat();
  }

  public updateTelemetry(bpm: number, isLungMode: boolean): void {
    if (bpm > 30 && bpm < 220) {
      this.currentBpm = bpm;
    }
    this.isLungMode = isLungMode;
  }

  public stopLiveMonitoring(): void {
    this.isLiveListening = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private scheduleNextBeat(): void {
    if (!this.isLiveListening) return;

    const intervalMs = Math.max(300, (60 / this.currentBpm) * 1000);
    this.playStethoscopeHeartbeat();

    this.timerId = setTimeout(() => {
      this.scheduleNextBeat();
    }, intervalMs);
  }

  public playStethoscopeHeartbeat(): void {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;

      // S1 Sound (Lub) - Low pitch resonant thump
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const filter1 = this.ctx.createBiquadFilter();

      filter1.type = 'lowpass';
      filter1.frequency.setValueAtTime(120, now);

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, now);
      osc1.frequency.exponentialRampToValueAtTime(35, now + 0.12);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.4, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc1.connect(filter1);
      filter1.connect(gain1);
      gain1.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.15);

      // S2 Sound (Dub) - Slightly higher pitch, shorter duration
      const s2Delay = 0.28;
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      const filter2 = this.ctx.createBiquadFilter();

      filter2.type = 'lowpass';
      filter2.frequency.setValueAtTime(150, now + s2Delay);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(70, now + s2Delay);
      osc2.frequency.exponentialRampToValueAtTime(45, now + s2Delay + 0.09);

      gain2.gain.setValueAtTime(0.001, now + s2Delay);
      gain2.gain.linearRampToValueAtTime(0.3, now + s2Delay + 0.015);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + s2Delay + 0.11);

      osc2.connect(filter2);
      filter2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc2.start(now + s2Delay);
      osc2.stop(now + s2Delay + 0.12);

      // If in Lung Mode: Add soft filtered breath whoosh
      if (this.isLungMode) {
        this.playBreathSound(now);
      }
    } catch {
      // Audio context may require user interaction
    }
  }

  private playBreathSound(startTime: number): void {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(220, startTime);
    filter.Q.setValueAtTime(1.5, startTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.06, startTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.38);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start(startTime);
    whiteNoise.stop(startTime + 0.4);
  }

  public playAudioBlob(blobUrl: string, onEnded?: () => void): HTMLAudioElement {
    const audio = new Audio(blobUrl);
    if (onEnded) {
      audio.onended = onEnded;
    }
    audio.play().catch(() => {});
    return audio;
  }
}

export const audioSynthesizer = new AudioSynthesizer();
