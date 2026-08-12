package com.example.ausculta.model

data class SignalMetrics(
    val currentBpm: Int = 72,
    val signalQualityPercentage: Int = 92,
    val rmsEnergy: Float = 0.45f,
    val peakFrequencyHz: Float = 65f,
    val s1s2Confidence: Float = 0.88f,
    val murmurProbability: Float = 0.05f,
    val wheezeProbability: Float = 0.02f,
    val crackleProbability: Float = 0.01f,
    val isRecording: Boolean = false
)
