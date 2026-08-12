package com.example.ausculta.device

import com.example.ausculta.model.DeviceConnectionState
import com.example.ausculta.model.DevicePacket
import com.example.ausculta.model.Esp32Config
import com.google.gson.Gson
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import okhttp3.OkHttpClient
import okhttp3.Request
import java.util.concurrent.TimeUnit

class Esp32HttpManager(
    private val config: Esp32Config = Esp32Config()
) {
    private val client = OkHttpClient.Builder()
        .connectTimeout(2, TimeUnit.SECONDS)
        .readTimeout(2, TimeUnit.SECONDS)
        .build()

    private val gson = Gson()
    private var pollJob: Job? = null
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    private val _connectionState = MutableStateFlow(DeviceConnectionState.DISCONNECTED)
    val connectionState: StateFlow<DeviceConnectionState> = _connectionState

    private val _latestPacket = MutableStateFlow(DevicePacket())
    val latestPacket: StateFlow<DevicePacket> = _latestPacket

    private var consecutiveFailures = 0

    fun connect() {
        if (_connectionState.value == DeviceConnectionState.CONNECTED || _connectionState.value == DeviceConnectionState.CONNECTING) return
        _connectionState.value = DeviceConnectionState.CONNECTING
        consecutiveFailures = 0

        pollJob?.cancel()
        pollJob = scope.launch {
            while (isActive) {
                try {
                    val request = Request.Builder().url(config.getFullUrl()).build()
                    val response = client.newCall(request).execute()
                    val body = response.body?.string()

                    if (response.isSuccessful && !body.isNullOrEmpty()) {
                        val packet = gson.fromJson(body, DevicePacket::class.java)
                        _latestPacket.value = packet.copy(timestampMs = System.currentTimeMillis())
                        _connectionState.value = DeviceConnectionState.CONNECTED
                        consecutiveFailures = 0
                    } else {
                        handleFailure()
                    }
                } catch (e: Exception) {
                    handleFailure()
                }
                delay(config.pollIntervalMs)
            }
        }
    }

    private fun handleFailure() {
        consecutiveFailures++
        if (consecutiveFailures >= 3) {
            _connectionState.value = DeviceConnectionState.DEVICE_UNAVAILABLE
        }
    }

    fun disconnect() {
        pollJob?.cancel()
        pollJob = null
        _connectionState.value = DeviceConnectionState.DISCONNECTED
    }
}
