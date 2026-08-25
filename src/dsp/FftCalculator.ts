/**
 * Computes a 16-band frequency power spectrum using discrete Fourier transform bins.
 * Directly corresponds to Kotlin FftCalculator.
 */
export const FftCalculator = {
  computeSpectrum16(samples: number[] | Float32Array): number[] {
    const n = 128;
    const spectrum = new Array<number>(16).fill(0.05);
    if (!samples || samples.length === 0) return spectrum;

    const real = new Float32Array(n);
    const limit = Math.min(samples.length, n);
    for (let i = 0; i < limit; i++) {
      real[i] = samples[i] / 32768;
    }

    const binSize = Math.floor(n / 32);
    for (let b = 0; b < 16; b++) {
      const k = (b + 1) * binSize;
      let re = 0;
      let im = 0;
      for (let t = 0; t < n; t++) {
        const angle = (2 * Math.PI * k * t) / n;
        re += real[t] * Math.cos(angle);
        im -= real[t] * Math.sin(angle);
      }
      const binPower = Math.sqrt(re * re + im * im) / n;
      spectrum[b] = Math.max(0.05, Math.min(1.0, binPower * 4.0));
    }
    return spectrum;
  },
};
