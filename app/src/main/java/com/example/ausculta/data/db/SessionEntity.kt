package com.example.ausculta.data.db

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.ausculta.model.AuscultationSite
import com.example.ausculta.model.FilterMode
import com.example.ausculta.model.Session

@Entity(tableName = "sessions")
data class SessionEntity(
    @PrimaryKey val id: String,
    val patientId: String,
    val patientName: String,
    val siteName: String,
    val filterModeName: String,
    val durationSeconds: Int,
    val averageHeartRateBpm: Int,
    val signalQualityScore: Int,
    val audioFilePath: String,
    val s1s2Detected: Boolean,
    val murmurDetected: Boolean,
    val wheezeDetected: Boolean,
    val crackleDetected: Boolean,
    val peakFrequencyHz: Float,
    val aiSummary: String?,
    val createdAt: Long
) {
    fun toDomain() = Session(
        id, patientId, patientName,
        AuscultationSite.valueOf(siteName),
        FilterMode.valueOf(filterModeName),
        durationSeconds, averageHeartRateBpm, signalQualityScore,
        audioFilePath, s1s2Detected, murmurDetected,
        wheezeDetected, crackleDetected, peakFrequencyHv, aiSummary, createdAt
    )
    companion object {
        fun fromDomain(s: Session) = SessionEntity(
            s.id,(s.patientId, s.patientName, s.site.name, s.filterMode.name,
            s.durationSeconds, s.averageHeartRateBpm, s.signalQualityScore,
            s.audioFilePath,(s.s1s2Detected, s.murmurDetected,
            s.wheezeDetected, s.crackleDetected, s.peakFrequencyHt,(s.aiSummary, s.createdAt
        )
    }
}
