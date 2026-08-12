package com.example.ausculta.ui.screens.live

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.ausculta.data.DataRepository
import com.example.ausculta.model.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class LiveAuscultationViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = DataRepository(application)

    val signalMetrics: StateFlow<SignalMetrics> = repository.signalMetrics
    val liveSpectrum: StateFlow<FloatArray> = repository.liveSpectrum
    val connectionState: StateFlow<DeviceConnectionState> = repository.deviceCommunicator.connectionState
    val latestPacket: StateFlow<DevicePacket> = repository.deviceCommunicator.packetState

    private val _selectedSite = MutableStateFlow(AuscultationSite.ANTERIOR_CHEST)
    val selectedSite: StateFlow<AuscultationSite> = _selectedSite

    private val _selectedFilter = MutableStateFlow(FilterMode.WIDEBAND)
    val selectedFilter: StateFlow<FilterMode> = _selectedFilter

    fun setSite(site: AuscultationSite) {
        _selectedSite.value = site
    }

    fun setFilter(filter: FilterMode) {
        _selectedFilter.value = filter
    }

    fun startConnecting() {
        repository.deviceCommunicator.startConnecting()
    }

    fun startSimulator() {
        repository.deviceCommunicator.startSimulationMode()
    }

    fun toggleRecording(onSaved: (String) -> Unit) {
        if (signalMetrics.value.isRecording) {
            viewModelScope.launch {
                val session = repository.stopRecordingAndSave(
                    patientId = "user-self",
                    patientName = "My Profile",
                    site = _selectedSite.value,
                    filterMode = _selectedFilter.value
                )
                onSaved(session.id)
            }
        } else {
            repository.startRecording(getApplication())
        }
    }
}
