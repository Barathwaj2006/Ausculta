package com.example.ausculta.ui.screens.dashboard

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import com.example.ausculta.data.DataRepository
import com.example.ausculta.model.DeviceConnectionState
import com.example.ausculta.model.Patient
import com.example.ausculta.model.Session
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.StateFlow

class DashboardViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = DataRepository(application)

    val connectionState: StateFlow<DeviceConnectionState> = repository.deviceCommunicator.connectionState
    val recentSessions: Flow<List<Session>> = repository.sessions
    val patients: Flow<List<Patient>> = repository.patients

    fun connectSimulator() {
        repository.deviceCommunicator.startSimulator()
    }

    fun disconnect() {
        repository.deviceCommunicator.disconnect()
    }
}