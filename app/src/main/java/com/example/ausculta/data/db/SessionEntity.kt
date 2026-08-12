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
    val patientAge: Int,
    val patientSex: String,
    val examinationType: String,
    val siteName: String,
    val filterModeName: String,
    val startTimestampMs: Long,
    val endTimestampMs: Long,
    val durationSeconds: Long,
    val appSessionId: String,
    val appVersion: String,
    val deviceStatus: String,
    val deviceIdentifier: String,
    val spo2: Int,
    val spo2Status: String,
    val bpm: Int,
    val bpmStatus: String,
    val signalQualityScore: Int,
    val waveformStability: String,
    val isUsableSignal: Boolean,
    val sampleCount: Int,
    val waveDataCsv: String,
    val audioFilePath: String,
    val aiSummary: String,
    val reportPath: String
) {
    fun toDomain() = Session(
        id = id,
        patientId = patientId,
        patientName = patientName,
        patientAge = patientAge,
        patientSex = patientSex,
        examinationType = examinationType,
        site = try { AuscultationSite.valueOf(siteName) } catch (e: Exception) { AuscultationSite.ANTERIOR_CHEST },
        filterMode = try { FilterMode.valueOf(filterModeName) } catch (e: Exception) { FilterMode.WIDEBAND },
        startTimestampMs = startTimestampMs,
        endTimestampMs = endTimestampMs,
        durationSeconds = durationSeconds,
        appSessionId = appSessionId,
        appVersion = appVersion,
        deviceStatus = deviceStatus,
        deviceIdentifier = deviceIdentifier,
        spo2 = spo2,
        spo2Status = spo2Status,
        bpm = bpm,
        bpmStatus = bpmStatus,
        signalQualityScore = signalQualityScore,
        waveformStability = waveformStability,
        isUsableSignal = isUsableSignal,
        sampleCount = sampleCount,
        waveDataCsv = waveDataCsv,
        audioFilePath = audioFilePath,
        aiSummary = aiSummary,
        reportPath = reportPath
    )

    companion object {
        fun fromDomain(s: Session) = SessionEntity(
            id = s.id,
            patientId = s.patientId,
            patientName = s.patientName,
            patientAge = s.patientAge,
            patientSex = s.patientSex,
            examinationType = s.examinationType,
            siteName = s.site.name,
            filterModeName = s.filterMode.name,
            startTimestampMs = s.startTimestampMs,
            endTimestampMs = s.endTimestampMs,
            durationSeconds = s.durationSeconds,
            appSessionId = s.appSessionId,
            appVersion = s.appVersion,
            deviceStatus = s.deviceStatus,
            deviceIdentifier = s.deviceIdentifier,
            spo2 = s.spo2,
            spo2Status = s.spo2Status,
            bpm = s.bpm,
            bpmStatus = s.bpmStatus,
            signalQualityScore = s.signalQualityScore,
            waveformStability = s.waveformStability,
            isUsableSignal = s.isUsableSignal,
            sampleCount = s.sampleCount,
            waveDataCsv = s.waveDataCsv,
            audioFilePath = s.audioFilePath,
            aiSummary = s.aiSummary,
            reportPath = s.reportPath
        )
    }
}
