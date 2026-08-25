import { BiquadFilter } from './BiquadFilter';

export interface LungAnalysisSummary {
  wheezeProbability: number;
  crackleProbability: number;
  rmsEnergy: number;
}

/**
 * Acoustic analysis helper for raw 1 kHz ESP32 ADC readings (GPIO34).
 * NOTE: Wheeze and crackle estimations are strictly Experimental Acoustic Metrics
 * for personal self-monitoring and are NOT clinically validated diagnoses.
 */
export class LungSoundAnalyzer {
  private biquad: BiquadFilter;

  constructor(sampleRateHz: number = 1000) {
    this.biquad = new BiquadFilter(sampleRateHz);
    this.biquad.configureBandpass(100, 450);
  }

  public analyzeBatch(samples: number[]): LungAnalysisSummary {
    if (!samples || samples.length === 0) {
      return {
        wheezeProbability: 0.01,
        crackleProbability: 0,
        rmsEnergy: 0,
      };
    }

    // Subtract DC mean offset for raw ADC readings
    const sum = samples.reduce((acc, v) => acc + v, 0);
    const mean = sum / samples.length;
    const conditioned = samples.map((s) => Math.max(-32768, Math.min(32767, s - mean)));

    const filtered = this.biquad.processArray(conditioned);
    let totalEnergy = 0;
    let cracklePeaks = 0;

    for (let i = 0; i < filtered.length; i++) {
      const s = filtered[i];
      totalEnergy += s * s;
      if (Math.abs(s) > 12000) {
        cracklePeaks++;
      }
    }

    const rms = Math.sqrt(totalEnergy / Math.max(1, samples.length)) / 32768;
    const wheezeRatio = rms > 0.25 ? (rms - 0.25) * 2.0 : 0.01;
    const crackleRatio = Math.max(0, Math.min(1.0, (cracklePeaks / Math.max(1, samples.length)) * 10.0));

    return {
      wheezeProbability: Math.max(0, Math.min(1.0, wheezeRatio)),
      crackleProbability: crackleRatio,
      rmsEnergy: rms,
    };
  }
}
