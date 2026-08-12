package com.example.ausculta.model
  data class AiAnalysisResult(
    val summaryTitle: String = "AI-Assisted Session Summary",
    val summaryDetails: String = "Waveform and physiological readings analyzed against user reference ranges.",
    val spo2Interpretation: String = "SpO2 is within normal reference range.",
    val pulseInterpretation: String = "Pulse rate is within normal resting range.",
    val acousticSignalQualityText: String = "Good waveform stability and signal amplitude.",
    val recommendedUserActions: List<String> = listOf(
        "Save session to local history",
        "Repeat examination if experiencing symptoms",
        "Share report with physician if needed"
    )
)
