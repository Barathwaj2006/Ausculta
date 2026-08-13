package com.example.ausculta.dsp

import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

class BiquadFilter(
    private var sampleRateHz: Float = 4000f
) {
    private var b0 = 1f; private var b1 = 0f; private var b2 = 0f
    private var a1 = 0f; private var a2 = 0f
    private var z1 = 0f; private var z2 = 0f

    fun configureBandpass(lowCutoffHz: Float, highCutoffHz: Float) {
        val centerHz = (lowCutoffHz + highCutoffHz) / 2f
        val bwHz = (highCutoffHz - lowCutoffHz).coerceAtLeast(5f)
        val q = centerHz / bwHz
        val w0 = 2f * PI.toFloat() * centerHz / sampleRateHz
        val alpha = sin(w0) / (2f * q)

        val b0Unscaled = alpha
        val b1Unscaled = 0f
        val b2Unscaled = -alpha
        val a0Unscaled = 1f + alpha
        val a1Unscaled = -2f * cos(w0)
        val a2Unscaled = 1f - alpha

        b0 = b0Unscaled / a0Unscaled
        b1 = b1Unscaled / a0Unscaled
        b2 = b2Unscaled / a0Unscaled
        a1 = a1Unscaled / a0Unscaled
        a2 = a2Unscaled / a0Unscaled
    }

    fun process(sample: Float): Float {
        val out = b0 * sample + z1
        z1 = b1 * sample - a1 * out + z2
        z2 = b2 * sample - a2 * out
        return out
    }

    fun processArray(input: ShortArray): ShortArray {
        val output = ShortArray(input.size)
        for (i in input.indices) {
            val filtered = process(input[i].toFloat())
            output[i] = filtered.coerceIn(-32768f, 32767f).toInt().toShort()
        }
        return output
    }
}
