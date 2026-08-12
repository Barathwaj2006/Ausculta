package com.example.ausculta.dsp

import kotlin.math.abs
import kotlin.math.sqrt

class HeartSoundAnalyzer(private val sampleRateHz: Int = 4000) {
    private val biquad = BiquadFilter(sampleRateHz.toFloat()).apply {
        configureBandpass(20f, 200f)
    }

    private var recentPeaks = mutableListOf<Long>()
    private var lastPeakTimeMs = 0L

    fun analyzeBatch(samples: ShortArray): AnalysisSummary {
        var totalEnergy = 0.0
        val filtered = biquad.processArray(samples)

        for (s in filtered) {
            totalEnergy += s * s
        }
        val rms = sqrt(totalEnergy / samples.size.coerceAtLeast(1)).toFloat() / 32768f

        var maxPeak = 0
        for (s in filtered) {
            val mag = abs(s.toInt())
            if (mag > maxPeak) maxPeak = mag
        }

        val now = System.currentTimeMillis()
        if (maxPeak > 8000 && (now - lastPeakTimeMs) > 400) {
            lastPeakTimeMs = now
            recentPeaks.add(now)
            if (recentPeaks.size > 8) recentPeaks.removeAt(0)
        }

        var bpm = 72
        if (recentPeaks.size >= 2) {
            val intervals = mutableListOf<Long>()
            for (i in 1 until recentPeaks.size) {
                intervals.add(recentPeaks[i] - recentPeaks[i - 1])
            }
            val avgIntervalMs = intervals.average()
            if (avgIntervalMs > 0) {
                bpm = (60000.0 / avgIntervalMs).toInt().coerceIn(40, 180)
            }
        }

        val murmurRatio = if (rms > 0.35f) (rms - 0.35f) * 1.5f else 0.02f

        return AnalysisSummary(
            bpm = bpm,
            rmsEnergy = rms,
            isPeakDetected = maxPeak > 8000,
            murmurProbability = murmurRatio.coerceIn(0f, 1f)
        )
    }

    data class AnalysisSummary(
        val bpm: Int,
        val rmsEnergy: Float,
        val isPeakDetected: Boolean,
        val murmurProbability: Float
    )
}
