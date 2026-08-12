package com.example.ausculta.ui.screens.history

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.ausculta.data.DataRepository
import com.example.ausculta.model.Session
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface HistoryUiState {
    object Loading : HistoryUiState
    data class Success(
        val sessions: List<Session>,
        val avgSpO2: Int,
        val avgBpm: Int,
        val filterSite: String = "All"
    ) : HistoryUiState
    data class Error(val message: String) : HistoryUiState
}

class HistoryViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = DataRepository(application)
    private val _uiState = MutableStateFlow<HistoryUiState>(HistoryUiState.Loading)
    val uiState: StateFlow<HistoryUiState> = _uiState.asStateFlow()

    init {
        loadHistory()
    }

    fun loadHistory(filterSite: String = "All") {
        viewModelScope.launch {
            _uiState.value = HistoryUiState.Loading
            try {
                repository.getAllSessions().collect { sessions ->
                    val filtered = if (filterSite == "All") sessions else sessions.filter { it.siteName.equals(filterSite, ignoreCase = true) }
                    val avgSpO2 = if (filtered.isNotEmpty()) filtered.map { it.spo2 }.average().toInt() else 98
                    val avgBpm = if (filtered.isNotEmpty()) filtered.map { it.bpm }.average().toInt() else 74

                    _uiState.value = HistoryUiState.Success(
                        sessions = filtered,
                        avgSpO2 = avgSpO2,
                        avgBpm = avgBpm,
                        filterSite = filterSite
                    )
                }
            } catch (e: Exception) {
                _uiState.value = HistoryUiState.Error(e.localizedMessage ?: "Failed to load history")
            }
        }
    }
}
