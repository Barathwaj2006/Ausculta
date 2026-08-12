package com.example.ausculta.model
 
enum class DeviceConnectionState(val displayName: String) {
    DISCONNECTED("Disconnected"),
    CONNECTING("Connecting to ESP32 Wi-Fi..."),
    CONNECTED("Connected (ESP32 Wi-Fi)"),
    SIMULATING("Simulation Mode (Demo)"),
    DEVICE_UNAVAILABLE("Device Unavailable (Check Wi-Fi)")
}
