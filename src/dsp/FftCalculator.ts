/**
 * Computes a 16-band frequency power spectrum using discrete Fourier transform bins.
 * Directly corresponds to Kotlin FftCalculator.
 */
const N = 128;
const NUM_BANDS = 16;
const BIN_SIZE = Math.floor(N / 32);

// Precompute cos and sin tables to avoid expensive trigonometric calls per packet
// This saves 2048 Math.cos/Math.sin calls every time computeSpectrum16 is called
const cosTable = new Float32Array(NUM_BANDS * N);
const sinTable = new Float32Array(NUM_BANDS * N);

for (let b = 0; b < NUM_BANDS; b++) {
  const k = (b + 1) * BIN_SIZE;
  for (let t = 0; t < N; t++) {
    const angle = (2 * Math.PI * k * t) / N;
    cosTable[b * N + t] = Math.cos(angle);
    sinTable[b * N + t] = Math.sin(angle);
  }
}

export const FftCalculator = {
  computeSpectrum16(samples: number[] | Float32Array): number[] {
    const spectrum = new Array<number>(NUM_BANDS).fill(0.05);
    if (!samples || samples.length === 0) return spectrum;

    const real = new Float32Array(N);
    const limit = Math.min(samples.length, N);
    for (let i = 0; i < limit; i++) {
      real[i] = samples[i] / 32768;
    }

    for (let b = 0; b < NUM_BANDS; b++) {
      let re = 0;
      let im = 0;
      const offset = b * N;
      for (let t = 0; t < N; t++) {
        re += real[t] * cosTable[offset + t];
        im -= real[t] * sinTable[offset + t];
      }
      const binPower = Math.sqrt(re * re + im * im) / N;
      spectrum[b] = Math.max(0.05, Math.min(1.0, binPower * 4.0));
    }
    return spectrum;
  },
};
