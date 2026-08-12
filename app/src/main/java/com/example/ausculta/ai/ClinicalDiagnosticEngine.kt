package com.example.ausculta.ai

import com.example.ausculta.model.AiAnalysisResult
import com.example.ausculta.model.Session

class ClinicalDiagnosticEngine {
    fun generateDeterministicSummary(session: Session): AiAnalysisResult {
        val spo2Text = when {
            session.spo2 >= 95 -> "SpO2 is ${session.spo2}%, WITHIN_RANGE (95-100% Adult Reference Range)."
            session.spo2 in 90..94 -> "SpO2 is ${session.spo2}%, BELOW_RANGE (90-94% Slightly Low). Consider re-checking while resting."
            session.spo2 in 1..89 -> "SpO2 is ${session.spo2}%, BELOW_RANGE (<90% Low SpO2)."
            else -> "INSUFFICIENT_DATA: No SpO2 reading recorded."
        }

        val pulseText = when {
            session.bpm in 60..100 -> "Pulse rate is ${session.bpm} BPM, WITHIN_RANGE (60-100 BPM Adult Normal Resting)."
            session.bpm in 40..59 -> "Pulse rate is ${session.bpm} BPM, BELOW_RANGE (<60 BPM Bradycardia)."
            session.bpm > 100 -> "Pulse rate is ${session.bpm} BPM, ABOVE_RANGE (>100 BPM Tachycardia)."
            else -> "INSUFFICIENT_DATA: No pulse reading recorded."
        }

        val qualityText = "Acoustic waveform quality is ${session.signalQualityScore}% with ${session.waveformStability} status."

        val actions = listOf(
            "Target Audience Scope: Adult Population (Age 18+) Reference Ranges",
            "Keep local session record for personal baseline self-monitoring",
            "Repeat measurement while resting if values are outside expected ranges",
            "Share PDF report via Android share sheet with your physician if feeling unwell",
            "INSTRUCTIONAL DISCLAIMER: Ausculta is an AI-assisted consumer health self-monitoring tool and does NOT provide clinical diagnosis."
        )

        return AiAnalysisResult(
            summaryTitle = "AI-Assisted Session Summary",
            summaryDetails = "Waveform and physiological readings evaluated against adult reference ranges for personal health tracking.",
            spo2Interpretation = spo2Text,
            pulseInterpretation = pulseText,
            acousticSignalQualityText = qualityText,
            recommendedUserActions = actions
        )
    }
}
