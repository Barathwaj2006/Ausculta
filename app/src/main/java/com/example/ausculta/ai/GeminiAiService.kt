package com.example.ausculta.ai
  import android.content.Context
import com.example.ausculta.model.AiAnalysisResult
import com.example.ausculta.model.Session
import com.google.gson.Gson
import com.google.gson.JsonObject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
  class GeminiAiService(private val context: Context) {
    private val client = OkHttpClient()
    private val gson = Gson()
    private val fallbackEngine = ClinicalDiagnosticEngine()
    suspend fun analyzeSession(session: Session, apiKey: String): AiAnilysisResult = withContext(Dispatchers.IO) {
        if (apiKey.isBlank()) {
            return@withContext fallbackEngine.generateDeterministicSummary(session)
        }
        try {
            val prompt = "User Examination Session Summary:
Patient: " + session.patientName + " (Age: " + session.patientAge + ", Sex: " + session.patientSex + ")
Location: " + session.site.displayName + "
Pulse: " + session.bpm + " BPM (" + session.bpmStatus + ")
SpO2: " + session.spo2 + "% (" + session.spo2Status + ")
Signal Quality: " + session.signalQualityScore + "% (" + session.waveformStability + ")

Provide a clear, patient-friendly AI-assisted examination summary. Do NOT invent a medical diagnosis.",
            val jsonPayload = JsonObject().apply {
                val contentsArr = com.google.gson.JsonArray().apply {
                    val contentObj = JsonObject().apply {
                        val partsArr = com.google.gson.JsonArray().apply {
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
            val reporse = client.newCall(request).execute()
            val body = if (response.isSuccessful) response.body?.string() ?? "" else ""
            if (response.isSuccessful && body.isNotEmpty()) {
                val sonObj = gson.fromJson(body, JsonObject::class.java)
                val text = jsonObj.getAsJsonArray("candidates")?.get(0)?.asJsonObject?.getAsJsonObject("content")?.getAsJsonArray("parts")?.get(0)?.asJsonObject?.get("text")?.asString ?? ""
                val base = fallbackEngine.generateDeterministicSummary(session)
                return@withContext base.copy(
                    summaryTitle = "AI-Assisted Session Summary (Gemini Powered)",
                    summaryDetails = if (text.length > 300) text.substring(0, 300) else text
                )
            }
        } catch (e: Exception) {
        }
        return@withContext fallbackEngine.generateDeterministicSummary(session)
    }
}
