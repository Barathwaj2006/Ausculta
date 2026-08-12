package com.example.ausculta.dsp

import kotlin.math.sqrt

class LungSoundAnalyzer(private val sampleRateHz: Int = 4000) {
    private val biquad = BiquadFilter(sampleRateHz.toFloat()).apply {
        configureBandpass(100f, 1000f)
    }

    fun analyzeBatch(samples: ShortArray): AnalysisSummary {
        val filtered = biquad.processArray(samples)
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
