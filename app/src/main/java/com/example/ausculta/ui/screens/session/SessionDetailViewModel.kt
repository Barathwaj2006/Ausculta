package com.example.ausculta.ui.screens.session

import android.app.Application
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.ausculta.ai.ClinicalDiagnosticEngine
import com.example.ausculta.data.DataRepository
import com.example.ausculta.model.AiAnalysisResult
import com.example.ausculta.model.Session
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.io.File

class SessionDetailViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = DataRepository(application)
    private val _session = MutableStateFlow<Session?>(null)
    val session: StateFlow<Session?> = _session

    private val _aiResult = MutableStateFlow<AiAnalysisResult?>(null)
    val aiResult: StateFlow<AiAnalysisResult?> = _aiResult

    private val _isAnalyzing = MutableStateFlow(false)
    val isAnalyzing: StateFlow<Boolean> = _isAnalyzing

    fun loadSession(sessionId: String) {
        viewModelScope.launch {
            repository.sessions.collect { list ->
                val s = list.find { it.id == sessionId }
                _session.value = s
                if (s != null && _aiResult.value == null) {
                    val deterministicEngine = ClinicalDiagnosticEngine()
                    _aiResult.value = deterministicEngine.generateDeterministicSummary(s)
                }
            }
        }
    }

    fun runAiAnalysis() {
        val s = _session.value ?: return
        viewModelScope.launch {
            _isAnalyzing.value = true
            _aiResult.value = repository.runAiAnalysis(s)
            _isAnalyzing.value = false
        }
    }

    fun playAudio() {
        val s = _session.value ?: return
        if (s.audioFilePath.isNotEmpty()) {
            repository.audioPlayer.playAudio(s.audioFilePath)
        }
    }

    fun generatePdf(): File? {
        val s = _session.value ?: return null
        val ai = _aiResult.value ?: ClinicalDiagnosticEngine().generateDeterministicSummary(s)
        return repository.generatePdf(s, ai)
    }

    fun shareReportViaWhatsApp(context: Context) {
        val pdfFile = generatePdf() ?: return
        repository.sharePdf(context, pdfFile)
    }
}
