package com.example.ausculta.model

import kotlin.math.abs
import kotlin.math.sqrt

data class SignalMetrics(
    val rmsAmplitude: Float = 0f,
    val peakToPeakAmplitude: Float = 0f,
    val zeroCrossingRate: Float = 0f,
    val meanDcOffset: Float = 0f,
    val signalQualityScore: Int = 0,
    val waveformStability: String = "UNSTABLE_SIGNAL",
    val isUsableSignal: Boolean = false,
    val spo2: Int = 0,
    val spo2Status: String = "INSUFFICIENT_DATA",
    val bpm: Int = 0,
    val bpmStatus: String = "INSUFFICIENT_DATA",
    val populationScope: String = "Adult Population (Age 18+)"
) {
    fun getSpo2StatusText(): String = spo2Status
    fun getBpmStatusText(): String = bpmStatus
    fun getWaveformStabilityText(): String = waveformStability
    fun isUsableSignal(): Boolean = isUsableSignal

    companion object {
        fun calculateFromWaveform(wave: FloatArray, spo2: Int, bpm: Int, fingerContact: Boolean): SignalMetrics {
            if (wave.isEmpty() || !fingerContact) {
                return SignalMetrics()
            }

            // 1. Calculate DC Mean (raw ADC offset for analogRead GPIO34, range 0..4095)
            var sumAdc = 0.0
            var minVal = Float.MAX_VALUE
            var maxVal = -Float.MAX_VALUE

            for (sample in wave) {
                sumAdc += sample
                if (sample < minVal) minVal = sample
                if (sample > maxVal) maxVal = sample
            }

            val meanDc = (sumAdc / wave.size).toFloat()
            val p2p = if (maxVal >= minVal) maxVal - minVal else 0f

            // 2. DC-centering signal conditioning
            var sumConditionedSquares = 0.0
            var zeroCrossings = 0
            var lastConditioned = 0f

            for (i in wave.indices) {
                val conditioned = wave[i] - meanDc
                sumConditionedSquares += conditioned * conditioned
                if (i > 0) {
                    if ((lastConditioned >= 0f && conditioned < 0f) || (lastConditioned < 0f && conditioned >= 0f)) {
                        zeroCrossings++
                    }
                }
                lastConditioned = conditioned
            }

            val rms = sqrt(sumConditionedSquares / wave.size).toFloat()
            val zcr = zeroCrossings.toFloat() / wave.size.toFloat()

            val stability = when {
                p2p < 20f -> "INSUFFICIENT_DATA"
                p2p in 20f..3500f -> "STABLE_SIGNAL"
                else -> "UNSTABLE_SIGNAL"
            }

            val isUsable = p2p >= 20f && spo2 in 80..100 && bpm in 40..200
            val qualityScore = when {
                !isUsable -> 25
                stability == "STABLE_SIGNAL" && spo2 >= 95 -> 95
                stability == "STABLE_SIGNAL" -> 85
                else -> 50
            }

            val spo2Eval = when {
                spo2 >= 95 -> "WITHIN_RANGE (95-100% Adult Normal)"
                spo2 in 90..94 -> "BELOW_RANGE (90-94% Slightly Low)"
                spo2 in 1..89 -> "BELOW_RANGE (<90% Low SpO2)"
                else -> "INSUFFICIENT_DATA"
            }

            val bpmEval = when {
                bpm in 60..100 -> "WITHIN_RANGE (60-100 BPM Normal Resting)"
                bpm in 40..59 -> "BELOW_RANGE (<60 BPM Bradycardia)"
                bpm > 100 -> "ABOVE_RANGE (>100 BPM Tachycardia)"
                else -> "INSUFFICIENT_DATA"
            }

            return SignalMetrics(
                rmsAmplitude = rms,
                peakToPeakAmplitude = p2p,
                zeroCrossingRate = zcr,
                meanDcOffset = meanDc,
                signalQualityScore = qualityScore,
                waveformStability = stability,
                isUsableSignal = isUsable,
                spo2 = spo2,
                spo2Status = spo2Eval,
                bpm = bpm,
                bpmStatus = bpmEval,
                populationScope = "Adult Population (Age 18+)"
            )
        }
    }
}
