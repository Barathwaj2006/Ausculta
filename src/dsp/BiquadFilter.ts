/**
 * Real-time Digital Biquad Filter (Bandpass & Lowpass) for acoustic signal processing.
 * Matches Kotlin BiquadFilter implementation for 1 kHz - 4 kHz sample rates.
 */
export class BiquadFilter {
  private sampleRateHz: number;
  private b0 = 1;
  private b1 = 0;
  private b2 = 0;
  private a1 = 0;
  private a2 = 0;
  private z1 = 0;
  private z2 = 0;

  constructor(sampleRateHz: number = 4000) {
    this.sampleRateHz = sampleRateHz;
  }

  public configureBandpass(lowCutoffHz: number, highCutoffHz: number): void {
    const centerHz = (lowCutoffHz + highCutoffHz) / 2;
    const bwHz = Math.max(5, highCutoffHz - lowCutoffHz);
    const q = centerHz / bwHz;
    const w0 = (2 * Math.PI * centerHz) / this.sampleRateHz;
    const alpha = Math.sin(w0) / (2 * q);

    const b0Unscaled = alpha;
    const b1Unscaled = 0;
    const b2Unscaled = -alpha;
    const a0Unscaled = 1 + alpha;
    const a1Unscaled = -2 * Math.cos(w0);
    const a2Unscaled = 1 - alpha;

    this.b0 = b0Unscaled / a0Unscaled;
    this.b1 = b1Unscaled / a0Unscaled;
    this.b2 = b2Unscaled / a0Unscaled;
    this.a1 = a1Unscaled / a0Unscaled;
    this.a2 = a2Unscaled / a0Unscaled;
  }

  public process(sample: number): number {
    const out = this.b0 * sample + this.z1;
    this.z1 = this.b1 * sample - this.a1 * out + this.z2;
    this.z2 = this.b2 * sample - this.a2 * out;
    return out;
  }

  public processArray(input: number[] | Float32Array): number[] {
    const output: number[] = new Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const filtered = this.process(input[i]);
      output[i] = Math.max(-32768, Math.min(32767, filtered));
    }
    return output;
  }
}
