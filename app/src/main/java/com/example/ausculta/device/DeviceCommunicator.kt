package com.example.ausculta.device

import android.content.Context
import com.example.ausculta.model.DeviceConnectionState
import com.example.ausculta.model.DevicePacket
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class DeviceCommunicator(private val context: Context) {
    private val httpManager = Esp32HttpManager()
    private val simulator = Esp32Simulator()
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    private val _connectionState = MutableStateFlow(DeviceConnectionState.DISCONNECTED)
    val connectionState: StateFlow<DeviceConnectionState> = _connectionState

    private val _packetState = MutableStateFlow(DevicePacket())
    val packetState: StateFlow<DevicePacket> = _packetState

    private var isSimulating = false

    init {
        scope.launch {
            httpManager.connectionState.collect { state ->
                if (!isSimulating) {
                    _connectionState.value = state
                }
            }
        }
        scope.launch {
            httpManager.latestPacket.collect { packet ->
                if (!isSimulating) {
                    _packetState.value = packet
                }
            }
        }
    }

    fun startConnecting() {
        if (isSimulating) {
            simulator.stop()
            isSimulating = false
        }
        _connectionState.value = DeviceConnectionState.CONNECTING
        httpManager.connect()
    }

    fun startSimulationMode() {
        httpManager.disconnect()
        isSimulating = true
        _connectionState.value = DeviceConnectionState.SIMULATING
        simulator.start { packet ->
            if (isSimulating) {
                _packetState.value = packet
            }
        }
    }

    fun disconnect() {
        if (isSimulating) {
            simulator.stop()
            isSimulating = false
        }
        httpManager.disconnect()
        _connectionState.value = DeviceConnectionState.DISCONNECTED
    }
}
