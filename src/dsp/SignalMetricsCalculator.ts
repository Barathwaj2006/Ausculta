import { SignalMetrics } from '../types';

export const SignalMetricsCalculator = {
  calculateFromWaveform(
    wave: number[],
    spo2: number,
    bpm: number,
    fingerContact: boolean
  ): SignalMetrics {
    if (!wave || wave.length === 0 || !fingerContact) {
      return {
        rmsAmplitude: 0,
        peakToPeakAmplitude: 0,
        zeroCrossingRate: 0,
        meanDcOffset: 0,
        signalQualityScore: 0,
        waveformStability: 'INSUFFICIENT_DATA',
        isUsableSignal: false,
        spo2: 0,
        spo2Status: 'INSUFFICIENT_DATA',
        bpm: 0,
        bpmStatus: 'INSUFFICIENT_DATA',
        populationScope: 'Adult Population (Age 18+)',
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

    // 1. Calculate DC Mean (raw ADC offset for analogRead GPIO34, range 0..4095)
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

    // 2. DC-centering signal conditioning
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

    let stability: 'STABLE_SIGNAL' | 'UNSTABLE_SIGNAL' | 'INSUFFICIENT_DATA' = 'UNSTABLE_SIGNAL';
    if (p2p < 20) {
      stability = 'INSUFFICIENT_DATA';
    } else if (p2p >= 20 && p2p <= 3500) {
      stability = 'STABLE_SIGNAL';
    }

    const isUsable = p2p >= 20 && spo2 >= 80 && spo2 <= 100 && bpm >= 40 && bpm <= 200;

    let qualityScore = 25;
    if (!isUsable) {
      qualityScore = 25;
    } else if (stability === 'STABLE_SIGNAL' && spo2 >= 95) {
      qualityScore = 95;
    } else if (stability === 'STABLE_SIGNAL') {
      qualityScore = 85;
    } else {
      qualityScore = 50;
    }

    let spo2Eval = 'INSUFFICIENT_DATA';
    if (spo2 >= 95) {
      spo2Eval = 'WITHIN_RANGE (95-100% Adult Normal)';
    } else if (spo2 >= 90 && spo2 <= 94) {
      spo2Eval = 'BELOW_RANGE (90-94% Slightly Low)';
    } else if (spo2 >= 1 && spo2 < 90) {
      spo2Eval = 'BELOW_RANGE (<90% Low SpO2)';
    }

    let bpmEval = 'INSUFFICIENT_DATA';
    if (bpm >= 60 && bpm <= 100) {
      bpmEval = 'WITHIN_RANGE (60-100 BPM Normal Resting)';
    } else if (bpm >= 40 && bpm < 60) {
      bpmEval = 'BELOW_RANGE (<60 BPM Bradycardia)';
    } else if (bpm > 100) {
      bpmEval = 'ABOVE_RANGE (>100 BPM Tachycardia)';
    }

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
      populationScope: 'Adult Population (Age 18+)',
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
