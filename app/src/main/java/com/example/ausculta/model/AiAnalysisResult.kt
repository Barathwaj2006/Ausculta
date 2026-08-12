package com.example.ausculta.model

data class AiAnalysisResult(
    val primaryImpression: String,
    val summaryDetails: String,
    val riskLevel: String,
    val acousticSeverityScore: Int,
    val differentialConsiderations: List<String>,
    val recommendedActions: List<String>,
    val generatedAt: Long = System.currentTimeMillis()
)
