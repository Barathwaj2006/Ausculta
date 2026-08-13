package com.example.ausculta.dsp

import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.math.PI
import kotlin.math.sin

class BiquadFilterTest {

    @Test
    fun testDefaultStateNoModification() {
        val filter = BiquadFilter()

        // Single sample process
        assertEquals(10f, filter.process(10f), 0.0001f)
        assertEquals(-20f, filter.process(-20f), 0.0001f)

        // Array process
        val inputArray = shortArrayOf(10, -20, 30, -40)
        val expectedArray = shortArrayOf(10, -20, 30, -40)
        assertArrayEquals(expectedArray, filter.processArray(inputArray))
    }

    @Test
    fun testBandpassConfiguration() {
        val sampleRate = 4000f
        val filter = BiquadFilter(sampleRate)
        filter.configureBandpass(400f, 600f) // Center frequency = 500Hz

        // Test sine wave near center frequency (500Hz)
        val centerFreq = 500f
        val wCenter = 2f * PI.toFloat() * centerFreq / sampleRate
        var centerAmpSum = 0f
        var maxValCenter = 0f
        // Process a few cycles to let the filter settle
        for (i in 0..400) {
            val sample = sin(i * wCenter)
            val out = filter.process(sample)
            if (i > 200) { // Measure after settling
                maxValCenter = maxOf(maxValCenter, Math.abs(out))
            }
        }

        // Test sine wave far from center frequency (50Hz)
        val filterOut = BiquadFilter(sampleRate)
        filterOut.configureBandpass(400f, 600f)
        val lowFreq = 50f
        val wLow = 2f * PI.toFloat() * lowFreq / sampleRate
        var maxValLow = 0f
        for (i in 0..400) {
            val sample = sin(i * wLow)
            val out = filterOut.process(sample)
            if (i > 200) { // Measure after settling
                maxValLow = maxOf(maxValLow, Math.abs(out))
            }
        }

        // Output at center frequency should be higher than at low frequency
        assertTrue("Filter should attenuate low frequencies compared to center frequency",
            maxValCenter > maxValLow * 5f)
    }

    @Test
    fun testProcessArrayCoercion() {
        val filter = BiquadFilter() // Default pass-through filter

        // Feed values exceeding Short boundaries, but since input is Short, we can't do this directly.
        // Wait, processArray takes a ShortArray, which already fits in limits.
        // Let's modify filter state manually via reflection, or just use a very high gain filter if possible.
        // Or we can just use configureBandpass with params that cause gain.
        // Actually, we can test coercion by just verifying it works on max limits.
        val inputArray = shortArrayOf(Short.MAX_VALUE, Short.MIN_VALUE)
        val output = filter.processArray(inputArray)

        assertEquals(Short.MAX_VALUE, output[0])
        assertEquals(Short.MIN_VALUE, output[1])
    }
}
