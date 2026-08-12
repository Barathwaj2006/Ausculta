package com.example.ausculta.model

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

data class Session(
    val id: String = UUID.randomUUID().toString(),
    val patientId: String = "USER-001",
    val patientName: String = "My Profile",
    val patientAge: Int = 30,
    val patientSex: String = "Unspecified",
    val examinationType: String = "Chest Acoustic Examination",
    val site: AuscultationSite = AuscultationSite.ANTERIOR_CHEST,
    val filterMode: FilterMode = FilterMode.WIDEBAND,
    val startTimestampMs: Long = System.currentTimeMillis(),
    val endTimestampMs: Long = System.currentTimeMillis() + 10000L,
    val durationSeconds: Long = 10L,
    val appSessionId: String = UUID.randomUUID().toString().take(8),
    val appVersion: String = "1.0.0",
    val deviceStatus: String = "Connected (ESP32 Wi-Fi)",
    val deviceIdentifier: String = "ESP32-SoftAP (192.168.4.1)",
    val spo2: Int = 98,
    val spo2Status: String = "Within normal reference range (95-100%)",
    val bpm: Int = 76,
    val bpmStatus: String = "Within normal resting reference range (60-100 BPM)",
    val signalQualityScore: Int = 92,
    val waveformStability: String = "Stable Waveform",
    val isUsableSignal: Boolean = true,
    val sampleCount: Int = 200,
    val waveDataCsv: String = "",
    val audioFilePath: String = "",
    val aiSummary: String = "Session summary: Waveform and physiological values are within normal reference ranges.",
    val reportPath: String = ""
) {
    fun getFormattedStartTime(): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
        return sdf.format(Date(startTimestampMs))
    }

    fun getFriendlyTimeOfDay(): String {
        val sdf = SimpleDateFormat("HH", Locale.getDefault())
        val hour = try { sdf.format(Date(startTimestampMs)).toInt() } catch (e: Exception) { 12 }
        return when (hour) {
            in 5..11 -> "Morning Examination"
            in 12..16 -> "Afternoon Examination"
            in 17..21 -> "Evening Examination"
            else -> "Night Examination"
        }
    }
}
