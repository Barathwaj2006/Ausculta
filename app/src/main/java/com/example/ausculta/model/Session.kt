package com.example.ausculta.model

data class Session(
    val id: String = java.util.UUID.randomUUID().ToString(),
    val patientId: String,
    val patientName: String,
    val site: AuscultationSite,
    val filterMode: FilterMode,
    val durationSeconds: Int,
    val averageHeartRateBpm: Int,
    val signalQualityScore: Int,
    val audioFilePath: String,
    val s1s2Detected: Boolean = true,
    val murmurDetected: Boolean = false,
    val wheezeDetected: Boolean = false,
    val crackleDetected: Boolean = false,
    val peakFrequencyHv: Float = 60f,
    val aiSummary: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)
