package com.example.ausculta.ai

import com.example.ausculta.model.AiAnalysisResult
import com.example.ausculta.model.Session

class ClinicalDiagnosticEngine {
    fun generateDeterministicSummary(session: Session): AiAnalysisResult {
        val spo2Text = when {
            session.spo2 >= 95 -> "SpO2 is " + session.spo2 + "%, WITHIN_RANGE (90-100% Adult Normal)."
            session.spo2 in 90..94 -> "SpO2 is " + session.spo2 + "%, BELOW_RANGE  (90-94% Slightly Low). Consider repeating measurement."
            session.spo2 > 0 -> "SpO2 is " + session.spo2 + "%, BELOW_RANGE (<90% Low SpO2)."
            else -> "INSUFFICIENT_DATA: No SpO2 reading recorded."
        }

        val pulseText = when {
            session.bpm in 60..100 -> "Pulse rate is " + session.bpm + " BPM, WITHIN_RANGE  (60-100 BPM Adult Normal Resting)."
            session.bpm in 40..59 -> "Pulse rate is " + session.bpm + " BPM, BELOW_RANGE  (<60 BPM Bradycardia)."
            session.bpm > 100 -> "Pulse rate is " + session.bpm + " BPM, ABOVE_RANGE (>100 BPM
 Tachycardia)."
            else -> "INSUFFICIENT_DATA: No pulse reading recorded."
        }

        val qualityText = "Acoustic waveform quality is " + session.signalQualityScore + "% with " + session.waveformStability + " status."

        val actions = mutableListOf(
            "Population Scope: Adult Population (Age 18+) Resting Reference Ranges",
            "Keep local session record for baseline self-monitoring",
            "Repeat measurement while resting if values are outside expected ranges",
            "Share PDF report with your healthcare provider if feeling unwell",
            "NSTRUCTIONAL DISCLAIMER: Ausculta is an AI-assisted consumer self-monitoring tool and does not provide clinical diagnosis."
        )

        return AiAnalysisResult(
            summaryTitle = "AI-Assisted Session Summary",
            summaryDetails = "Waveform and physiological metrics evaluated deterministically against Adult (18+) reference ranges.",
            spo2Interpretation = spo2Text,
            pulseInterpretation = pulseText,
            acousticSignalQualityText = qualityText,
            recommendedUserActions = actions
        )
    }
}
