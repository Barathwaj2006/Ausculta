package com.example.ausculta.device

import com.example.ausculta.model.DevicePacket
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlin.math.sin

class Esp32Simulator {
    private var job: Job? = null
    private val _packetFlow = MutableSharedFlow<DevicePacket>(extraBufferCapacity = 64)
    val packetFlow: SharedFlow<DevicePacket> = _packetFlow

    private var sequenceCounter = 0L
    private var phase = 0f

    fun startSimulation(scope: CoroutineScope) {
        job?.cancel()
        job = scope.launch(Dispatchers.Default) {
            while (isActive) {
                delay(40)
                val samples = ShortArray(160)
                for (i in samples.indices) {
                    phase += 0.05f
                    val s1 = sin(phase * 2f) * 16000f
                    val s2 = sin(phase * 3.5f + 1.2f) * 11000f
                    val cardiacSound = (s1 + s2) * (if (sin(phase * 0.2f) > 0.3f) 1f else 0.1f)
                    samples[i] = cardiacSound.toInt().coerceIn(-32768, 32767).toShort()
                }

                sequenceCounter++
                val packet = DevicePacket(
                    sequenceNumber = sequenceCounter,
                    audioSamples = samples,
                    ecgSample = (512 + sin(phase) * 200).toInt(),
                    batteryLevel = 94,
                    isValidCrc = true
                )
                _packetFlow.emit(packet)
            }
        }
    }

    fun stopSimulation() {
        job?.cancel()
        job = null
    }
}
