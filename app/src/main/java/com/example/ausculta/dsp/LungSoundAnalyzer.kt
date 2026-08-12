package com.example.ausculta.dsp

import kotlin.math.sqrt

/**
 * Acoustic analysis helper for raw 1 kHz ESP32 ADC readings (GPIO34).
 * NOTE: Wheeze and crackle estimations are strictly Experimental Acoustic Metrics
 * for personal self-monitoring and are NOT clinically validated diagnoses.
 */
class LungSoundAnalyzer(private val sampleRateHz: Int = 1000) {
    private val biquad = BiquadFilter(sampleRateHz.toFloat()).apply {
        configureBandpass(100f, 450f)
    }

    fun analyzeBatch(samples: FloatArray): AnalysisSummary {
        if (samples.isEmpty()) return AnalysisSummary(0.01f, 0f, 0f)

        // Subtract DC mean offset for raw ADC readings
        val mean = samples.average().toFloat()
        val conditioned = ShortArray(samples.size) { i ->
            ((samples[i] - mean).coerceIn(-32768f, 32767f)).toInt().toShort()
        }

        val filtered = biquad.processArray(conditioned)
        var totalEnergy = 0.0
        var cracklePeaks = 0

        for (i in filtered.indices) {
            val s = filtered[i].toInt()
            totalEnergy += s * s
            if (kotlin.math.abs(s) > 12000) {
                cracklePeaks++
            }
        }
        val rms = sqrt(totalEnergy / samples.size.coerceAtLeast(1)).toFloat() / 32768f
        val wheezeRatio = if (rms > 0.25f) (rms - 0.25f) * 2f else 0.01f
        val crackleRatio = (cracklePeaks.toFloat() / samples.size.coerceAtLeast(1) * 10f).coerceIn(0f, 1f)

        return AnalysisSummary(
            wheezeProbability = wheezeRatio.coerceIn(0f, 1f),
            crackleProbability = crackleRatio,
            rmsEnergy = rms
        )
    }

    data class AnalysisSummary(
        val wheezeProbability: Float,
        val crackleProbability: Float,
        val rmsEnergy: Float
    )
}
