import { describe, it, expect } from 'vitest';
import { FftCalculator } from './FftCalculator';

describe('FftCalculator', () => {
  it('should handle empty input', () => {
    const result = FftCalculator.computeSpectrum16([]);
    expect(result).toHaveLength(16);
    result.forEach((val) => {
      expect(val).toBeCloseTo(0.05);
    });
  });

  it('should handle undefined input', () => {
    // @ts-ignore
    const result = FftCalculator.computeSpectrum16(undefined);
    expect(result).toHaveLength(16);
    result.forEach((val) => {
      expect(val).toBeCloseTo(0.05);
    });
  });

  it('should compute spectrum for all zeros', () => {
    const samples = new Array(128).fill(0);
    const result = FftCalculator.computeSpectrum16(samples);
    expect(result).toHaveLength(16);
    result.forEach((val) => {
      expect(val).toBeCloseTo(0.05); // Min value clamped to 0.05
    });
  });

  it('should handle array smaller than 128', () => {
    const samples = new Array(64).fill(0);
    const result = FftCalculator.computeSpectrum16(samples);
    expect(result).toHaveLength(16);
  });

  it('should detect a sine wave at bin 0 (k=4)', () => {
    const n = 128;
    const samples = new Array(n);
    const k = 4; // Expected to fall in bin 0

    for (let t = 0; t < n; t++) {
      // Scale by 32768 as the calculator divides by 32768
      samples[t] = Math.sin((2 * Math.PI * k * t) / n) * 32768;
    }

    const result = FftCalculator.computeSpectrum16(samples);

    // Bin 0 should have a strong signal
    expect(result[0]).toBeGreaterThan(0.5);

    // Other bins should be much lower (mostly the 0.05 floor)
    for (let i = 1; i < 16; i++) {
      expect(result[i]).toBeLessThan(0.1);
    }
  });

  it('should detect a sine wave at bin 7 (k=32)', () => {
    const n = 128;
    const samples = new Array(n);
    const k = 32; // Expected to fall in bin 7 (b=7 -> k=(7+1)*4 = 32)

    for (let t = 0; t < n; t++) {
      samples[t] = Math.cos((2 * Math.PI * k * t) / n) * 32768;
    }

    const result = FftCalculator.computeSpectrum16(samples);

    // Bin 7 should have a strong signal
    expect(result[7]).toBeGreaterThan(0.5);

    // Other bins should be lower
    for (let i = 0; i < 16; i++) {
      if (i !== 7) {
        expect(result[i]).toBeLessThan(0.1);
      }
    }
  });
});
