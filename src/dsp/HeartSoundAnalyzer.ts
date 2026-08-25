import { BiquadFilter } from './BiquadFilter';

export interface HeartAnalysisSummary {
  bpm: number;
  rmsEnergy: number;
  isPeakDetected: boolean;
  murmurProbability: number;
}

/**
 * Acoustic analysis helper for raw 1 kHz ESP32 ADC readings (GPIO34).
 * NOTE: Estimated metrics (e.g. murmur ratio) are strictly Experimental Acoustic Metrics
 * for personal self-monitoring and are NOT clinically validated diagnoses.
 */
export class HeartSoundAnalyzer {
  private biquad: BiquadFilter;
  private recentPeaks: number[] = [];
  private lastPeakTimeMs = 0;

  constructor(sampleRateHz: number = 1000) {
    this.biquad = new BiquadFilter(sampleRateHz);
    this.biquad.configureBandpass(20, 200);
  }

  public analyzeBatch(samples: number[]): HeartAnalysisSummary {
    if (!samples || samples.length === 0) {
      return {
        bpm: 72,
        rmsEnergy: 0,
        isPeakDetected: false,
        murmurProbability: 0.02,
      };
    }

    // Subtract DC mean offset for raw ADC readings
    const sum = samples.reduce((acc, v) => acc + v, 0);
    const mean = sum / samples.length;
    const conditioned = samples.map((s) => Math.max(-32768, Math.min(32767, s - mean)));

    const filtered = this.biquad.processArray(conditioned);

    let totalEnergy = 0;
    let maxPeak = 0;

    for (let i = 0; i < filtered.length; i++) {
      const s = filtered[i];
      totalEnergy += s * s;
      const mag = Math.abs(s);
      if (mag > maxPeak) maxPeak = mag;
    }

    const rms = Math.sqrt(totalEnergy / Math.max(1, samples.length)) / 32768;

    const now = Date.now();
    if (maxPeak > 8000 && now - this.lastPeakTimeMs > 400) {
      this.lastPeakTimeMs = now;
      this.recentPeaks.push(now);
      if (this.recentPeaks.length > 8) {
        this.recentPeaks.shift();
      }
    }

    let bpm = 72;
    if (this.recentPeaks.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < this.recentPeaks.length; i++) {
        intervals.push(this.recentPeaks[i] - this.recentPeaks[i - 1]);
      }
      const avgIntervalMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (avgIntervalMs > 0) {
        bpm = Math.max(40, Math.min(180, Math.round(60000 / avgIntervalMs)));
      }
    }

    const experimentalMurmurRatio = rms > 0.35 ? (rms - 0.35) * 1.5 : 0.02;

    return {
      bpm,
      rmsEnergy: rms,
      isPeakDetected: maxPeak > 8000,
      murmurProbability: Math.max(0, Math.min(1, experimentalMurmurRatio)),
    };
  }
}
