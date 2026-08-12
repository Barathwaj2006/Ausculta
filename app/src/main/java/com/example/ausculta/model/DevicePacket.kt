package com.example.ausculta.model

import com.google.gson.annotations.SerializedName

data class DevicePacket(
    @SerializedName("wave")
    val wave: FloatArray = FloatArray(0),
    @SerializedName("spo2")
    val spo2: Int = 0,
    @SerializedName("bpm")
    val bpm: Int = 0,
    @SerializedName("finger")
    val finger: Boolean = false,
    @SerializedName("active")
    val active: Boolean = false,
    val timestampMs: Long = System.currentTimeMillis()
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as DevicePacket
        return wave.contentEquals(other.wave) &&
                spo2 == other.spo2 &&
                bpm == other.bpm &&
                finger == other.finger &&
                active == other.active
    }

    override fun hashCode(): Int {
        var result = wave.contentHashCode()
        result = 31 * result + spo2
        result = 31 * result + bpm
        result = 31 * result + finger.hashCode()
        result = 31 * result + active.hashCode()
        return result
    }
}
