package com.example.ausculta.model
 
data class Esp32Config(
    val ssid: String = "ESP32-Ausculta",
    val host: String = "192.168.4.1",
    val port: Int = 80,
    val endpoint: String = "/data",
    val pollIntervalMs: Long = 100L
) {
    fun getFullUrl(): String = "http://" + host + ":" + port + endpoint
}
