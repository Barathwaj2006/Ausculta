package com.example.ausculta.dsp

import org.junit.Assert.*
import org.junit.Test
import kotlin.math.PI
import kotlin.math.sin

class HeartSoundAnalyzerTest {

    @Test
    fun testEmptyBatch() {
        val analyzer = HeartSoundAnalyzer()
        val result = analyzer.analyzeBatch(FloatArray(0))

        assertEquals(72, result.bpm)
        assertEquals(0f, result.rmsEnergy, 0.001f)
        assertFalse(result.isPeakDetected)
        assertEquals(0.02f, result.murmurProbability, 0.001f)
    }

    @Test
    fun testConstantSignal() {
        val analyzer = HeartSoundAnalyzer()
        // A constant signal should have its DC offset removed completely
        val samples = FloatArray(1000) { 1000f }
        val result = analyzer.analyzeBatch(samples)

        assertEquals(0f, result.rmsEnergy, 0.001f)
        assertFalse(result.isPeakDetected)
    }

    @Test
    fun testLoudSignal() {
        val analyzer = HeartSoundAnalyzer()
        // Generate a 100 Hz sine wave (within the 20-200 Hz bandpass)
        val sampleRate = 1000
        val frequency = 100.0
        val duration = 1.0 // 1 second
        val samples = FloatArray((sampleRate * duration).toInt())
        for (i in samples.indices) {
            samples[i] = (20000.0 * sin(2 * PI * frequency * i / sampleRate)).toFloat()
        }

        val result = analyzer.analyzeBatch(samples)

        // The signal is strong enough, so a peak should be detected
        assertTrue(result.isPeakDetected)
    }

    @Test
    fun testHighRmsSignal() {
        val analyzer = HeartSoundAnalyzer()
        // Generate a signal with very high amplitude to increase RMS
        val sampleRate = 1000
        val frequency = 100.0
        val duration = 1.0 // 1 second
        val samples = FloatArray((sampleRate * duration).toInt())
        for (i in samples.indices) {
            // Very high amplitude, almost square wave or very loud sine
            samples[i] = (30000.0 * sin(2 * PI * frequency * i / sampleRate)).toFloat()
        }

        val result = analyzer.analyzeBatch(samples)

        // RMS should be high
        assertTrue(result.rmsEnergy > 0.35f)

        // Calculate expected murmur probability
        val expectedMurmur = ((result.rmsEnergy - 0.35f) * 1.5f).coerceIn(0f, 1f)
        assertEquals(expectedMurmur, result.murmurProbability, 0.001f)
    }
}
