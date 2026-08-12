package com.example.ausculta.ai

import android.content.Context
import com.example.ausculta.model.AiAnalysisResult
import com.example.ausculta.model.Session
import com.google.gson.Gson
import com.google.gson.JsonArray
import com.google.gson.JsonObject
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class GeminiAiService(private val context: Context) {
    private val client = OkHttpClient()
    private val gson = Gson()

    suspend fun analyzeSession(session: Session, apiKey: String): AiAnalysisResult = withContext(Dispatchers.IO) {
        try {
            val prompt = "Cardiothoracic Auscultation Analysis:\nPatient: " + session.patientName + "\nAuscultation Site: " + session.site.displayName + "\nFilter Mode: " + session.filterMode.displayName + "\nHeart Rate: " + session.averageHeartRateBpm + " BPM\nSignal Quality: " + session.signalQualityScore + "%\nS1/S2 Peaks: " + (if (session.s1s2Detected) "Detected" else "Uncertain") + "\nMurmur Indicator: " + (if (session.murmurDetected) "Abnormal Systolic/Diastolic" else "None") + "\nWheeze/Crackle: " + (if (session.wheezeDetected) "Wheezing Present" else "Clear") + "\n\nProvide a concise medical auscultation summary."

            val jsonPayload = JsonObject().apply {
                val contentsArr = JsonArray().apply {
                    val contentObj = JsonObject().apply {
                        val partsArr = JsonArray().apply {
                            val partObj = JsonObject().apply {
                                 addProperty("text", prompt)
                             }
                            add(partObj)
                        }
                        add("parts", partsArr)
                    }
                    add(contentObj)
                }
                add("contents", contentsArr)
            }

            val url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey
            val request = Request.Builder()
                .url(url)
                .post(jsonPayload.toString().toRequestBody("application/json".toMediaTypeOrNull()))
                .build()

            val response = client.newCall(request).execute()
            val body = response.body?.string() ?: ""

            if (response.isSuccessful && body.isNotEmpty()) {
                val jsonObj = gson.fromJson(body, JsonObject::class.java)
                val text = jsonObj.getAsJsonArray("candidates")?.get(0)?.asJsonObject?.getAsJsonObject("content")?.getAsJsonArray("parts")?.get(0)?.asJsonObject?.get("text")?.asString ?: ""

                return@withContext AiAnalysisResult(
                    primaryImpression = "Gemini AI Auscultation Analysis Complete",
                    summaryDetails = if (text.length > 300) text.substring(0, 300) else text,
                    riskLevel = if (session.murmurDetected) "ELEVATED" else "NORMAL",
                    acousticSeverityScore = if (session.murmurDetected) 6 else 2,
                    differentialConsiderations = listOf("Biological vesicular sound", "Acoustic murmur"),
                    recommendedActions = listOf("Clinical correlation", "Follow-up monitoring")
                )
            }
        } catch (e: Exception) {
            // Fallback
        }
        return@withContext ClinicalDiagnosticEngine().analyzeOffline(session)
    }
}