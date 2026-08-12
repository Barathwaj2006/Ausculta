package com.example.ausculta

import com.example.ausculta.model.SignalMetrics
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class SignalMetricsTest {

    @Test
    fun testAdcWaveformDcOffsetCentering() {
        val rawAdcWaveform = floatArrayOf(
            2048f, 2200f, 2500f, 2200f, 2048f, 1900f, 1600f, 1900f,
            2048f, 2200f, 2500f, 2200f, 2048f, 1900f, 1600f, 1900f
        )
        
        val metrics = SignalMetrics.calculateFromWaveform(
            wave = rawAdcWaveform,
            spo2 = 98,
            bpm = 72,
            fingerContact = true
        )

        assertTrue(metrics.meanDcOffset > 2000f)
        assertTrue(metrics.rmsAmplitude > 0f)
        assertEquals("WITHIN_RANGE (95-100% Adult Normal)", metrics.spo2Status)
        assertEquals("WITHIN_RANGE (60-100 BPM Adult Normal Resting)", metrics.bpmStatus)
        assertEquals("Adult Population (Age 18+)", metrics.populationScope)
    }

    @Test
    fun testDeterministicBradycardia() {
        val rawAdcWaveform = floatArrayOf(2000f, 2100f, 2000f, 1900f)
        val metrics = SignalMetrics.calculateFromWaveform(
            wave = rawAdcWaveform,
            spo2 = 96,
            bpm = 52,
            fingerContact = true
        )

        assertTrue(metrics.bpmStatus.contains("BELOW_RANGE"))
        assertTrue(metrics.bpmStatus.contains("Bradycardia"))
    }
}
