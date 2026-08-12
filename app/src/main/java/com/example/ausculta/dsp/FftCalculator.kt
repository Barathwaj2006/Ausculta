package com.example.ausculta.dsp

import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt

object FftCalculator {
    fun computeSpectrum16(samples: ShortArray): FloatArray {
        val n = 128
        val spectrum = FloatArray(16)
        if (samples.isEmpty()) return spectrum

        val real = FloatArray(n)
        val limit = samples.size.coerceAtMost(n)
        for (i in 0 until limit) {
            real[i] = samples[i].toFloat() / 32768f
        }

        val binSize = n / 32
        for (b in 0 until 16) {
            val k = (b + 1) * binSize
            var re = 0f
            var im = 0f
            for (t in 0 until n) {
                val angle = 2f * PI.toFloat() * k * t / n
                re += real[t] * cos(angle)
                im -= real[t] * sin(angle)
            }
            val binPower = sqrt(re * re + im * im) / n
            spectrum[b] = (binPower * 4f).coerceIn(0.05f, 1.0f)
        }
        return spectrum
    }
}
