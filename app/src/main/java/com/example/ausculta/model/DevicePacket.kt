package com.example.ausculta.model

data class DevicePacket(
    val sequenceNumber: Long,
    val audioSamples: ShortArray,
    val ecgSample: Int = 512,
    val batteryLevel: Int = 95,
    val isValidCrc: Boolean = true,
    val timestampMs: Long = System.currentTimeMillis()
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as DevicePacket
        return sequenceNumber == other.sequenceNumber && audioSamples.contentEquals(other.audioSamples)
    }
    override fun hashCode(): Int {
        var result = sequenceNumber.hashCode()
        result = 31 * result + audioSamples.contentHashCode()
        return result
    }
}
