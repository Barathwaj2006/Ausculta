package com.example.ausculta.device

import com.example.ausculta.model.DevicePacket
import kotlinx.coroutines.*
import kotlin.math.sin

class Esp32Simulator {
    private var job: Job? = null
    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())

    fun start(onPacketReceived: (DevicePacket) -> Unit) {
        stop()
        job = scope.launch {
            var phase = 0.0
            while (isActive) {
                val wave = FloatArray(200)
                for (i in 0 until 200) {
                    val t = phase + (i * 0.05)
                    wave[i] = (sin(t) * 1000 + sin(t * 2.5) * 400 + (Math.random() * 50)).toFloat()
                }
                phase += 0.5

                val packet = DevicePacket(
                    wave = wave,
                    spo2 = 98 + (Math.random() * 2).toInt(),
                    bpm = 72 + (Math.random() * 6 - 3).toInt(),
                    finger = true,
                    active = true,
                    timestampMs = System.currentTimeMillis()
                )
                onPacketReceived(packet)
                delay(100L)
            }
        }
    }

    fun stop() {
        job?.cancel()
        job = null
    }
}
