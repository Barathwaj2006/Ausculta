package com.example.ausculta.ai

import com.example.ausculta.model.AiAnalysisResult
import com.example.ausculta.model.Session

class ClinicalDiagnosticEngine {
    fun analyzeOffline(session: Session): AiAnalysisResult {
        val isAbnormal = session.murmurDetected || session.wheezeDetected || session.crackleDetected
        val risk = if (isAbnormal) "ELEVATED" else "NORMAL"
        val score = if (isAbnormal) 5 else 1
        val impression = if (isAbnormal) {
            "Acoustic anomaly detected at " + session.site.displayName + ". Clinical correlation recommended."
        } else {
            "Normal S1/S2 cardiac/normal vesicular breath sounds at " + session.site.displayName + "."
        }

        return AiAnalysisResult(
            primaryImpression = impression,
            summaryDetails = "Heart Rate: " + session.averageHeartRateBpm + " BPM, Signal Quality: " + session.signalQualityScore + "%.",
            riskLevel = risk,
            acousticSeverityScore = score,
            differentialConsiderations = listOf("Biological S1/S2 variance", "Vesicular breath acoustics"),
            recommendedActions = listOf("routine clinical monitoring")
        )
    }
}