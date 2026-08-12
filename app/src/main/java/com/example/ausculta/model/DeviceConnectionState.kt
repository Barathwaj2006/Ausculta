package com.example.ausculta.model

sealed class DeviceConnectionState {
    object Disconnected : DeviceConnectionState()
    object Scanning : DeviceConnectionState()
    data class Connecting(val deviceName: String) : DeviceConnectionState()
    data class Connected(
        val deviceName: String,
        val batteryPercentage: Int,
        val isSimulator: Boolean = false,
        val signalRssi: Int = -60
    ) : DeviceConnectionState()
    data class Error(val message: String) : DeviceConnectionState()
}