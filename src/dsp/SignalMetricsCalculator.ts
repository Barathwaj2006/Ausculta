import { SignalMetrics } from "../types";

function calculateDcMetrics(wave: number[]) {
  let sumAdc = 0;
  let minVal = Number.MAX_VALUE;
  let maxVal = -Number.MAX_VALUE;

  for (let i = 0; i < wave.length; i++) {
    const sample = wave[i];
    sumAdc += sample;
    if (sample < minVal) minVal = sample;
    if (sample > maxVal) maxVal = sample;
  }

  const meanDc = sumAdc / wave.length;
  const p2p = maxVal >= minVal ? maxVal - minVal : 0;

  return { meanDc, p2p };
}

function calculateConditionedMetrics(wave: number[], meanDc: number) {
  let sumConditionedSquares = 0;
  let zeroCrossings = 0;
  let lastConditioned = 0;

  for (let i = 0; i < wave.length; i++) {
    const conditioned = wave[i] - meanDc;
    sumConditionedSquares += conditioned * conditioned;
    if (i > 0) {
      if (
        (lastConditioned >= 0 && conditioned < 0) ||
        (lastConditioned < 0 && conditioned >= 0)
      ) {
        zeroCrossings++;
      }
    }
    lastConditioned = conditioned;
  }

  const rms = Math.sqrt(sumConditionedSquares / wave.length);
  const zcr = zeroCrossings / wave.length;

  return { rms, zcr };
}

function evaluateStability(
  p2p: number,
): "STABLE_SIGNAL" | "UNSTABLE_SIGNAL" | "INSUFFICIENT_DATA" {
  if (p2p < 20) {
    return "INSUFFICIENT_DATA";
  } else if (p2p >= 20 && p2p <= 3500) {
    return "STABLE_SIGNAL";
  }
  return "UNSTABLE_SIGNAL";
}

function isSignalUsable(p2p: number, spo2: number, bpm: number): boolean {
  return p2p >= 20 && spo2 >= 80 && spo2 <= 100 && bpm >= 40 && bpm <= 200;
}

function calculateQualityScore(
  isUsable: boolean,
  stability: string,
  spo2: number,
): number {
  if (!isUsable) {
    return 25;
  } else if (stability === "STABLE_SIGNAL" && spo2 >= 95) {
    return 95;
  } else if (stability === "STABLE_SIGNAL") {
    return 85;
  } else {
    return 50;
  }
}

function evaluateSpo2(spo2: number): string {
  if (spo2 >= 95) {
    return "WITHIN_RANGE (95-100% Adult Normal)";
  } else if (spo2 >= 90 && spo2 <= 94) {
    return "BELOW_RANGE (90-94% Slightly Low)";
  } else if (spo2 >= 1 && spo2 < 90) {
    return "BELOW_RANGE (<90% Low SpO2)";
  }
  return "INSUFFICIENT_DATA";
}

function evaluateBpm(bpm: number): string {
  if (bpm >= 60 && bpm <= 100) {
    return "WITHIN_RANGE (60-100 BPM Normal Resting)";
  } else if (bpm >= 40 && bpm < 60) {
    return "BELOW_RANGE (<60 BPM Bradycardia)";
  } else if (bpm > 100) {
    return "ABOVE_RANGE (>100 BPM Tachycardia)";
  }
  return "INSUFFICIENT_DATA";
}

export const SignalMetricsCalculator = {
  calculateFromWaveform(
    wave: number[],
    spo2: number,
    bpm: number,
    fingerContact: boolean,
  ): SignalMetrics {
    if (!wave || wave.length === 0 || !fingerContact) {
      return {
        rmsAmplitude: 0,
        peakToPeakAmplitude: 0,
        zeroCrossingRate: 0,
        meanDcOffset: 0,
        signalQualityScore: 0,
        waveformStability: "INSUFFICIENT_DATA",
        isUsableSignal: false,
        spo2: 0,
        spo2Status: "INSUFFICIENT_DATA",
        bpm: 0,
        bpmStatus: "INSUFFICIENT_DATA",
        populationScope: "Adult Population (Age 18+)",
        currentBpm: 0,
        fingerDetected: false,
        sensorActive: false,
        isRecording: false,
        rmsEnergy: 0,
        murmurProbability: 0,
        wheezeProbability: 0,
        crackleProbability: 0,
        signalQualityPercentage: 0,
      };
    }

    const { meanDc, p2p } = calculateDcMetrics(wave);
    const { rms, zcr } = calculateConditionedMetrics(wave, meanDc);

    const stability = evaluateStability(p2p);
    const isUsable = isSignalUsable(p2p, spo2, bpm);
    const qualityScore = calculateQualityScore(isUsable, stability, spo2);

    const spo2Eval = evaluateSpo2(spo2);
    const bpmEval = evaluateBpm(bpm);

    return {
      rmsAmplitude: rms,
      peakToPeakAmplitude: p2p,
      zeroCrossingRate: zcr,
      meanDcOffset: meanDc,
      signalQualityScore: qualityScore,
      waveformStability: stability,
      isUsableSignal: isUsable,
      spo2,
      spo2Status: spo2Eval,
      bpm,
      bpmStatus: bpmEval,
      populationScope: "Adult Population (Age 18+)",
      currentBpm: bpm,
      fingerDetected: fingerContact,
      sensorActive: true,
      isRecording: false,
      rmsEnergy: rms / 2000,
      murmurProbability: 0.02,
      wheezeProbability: 0.01,
      crackleProbability: 0,
      signalQualityPercentage: qualityScore,
    };
  },
};
