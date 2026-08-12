package com.example.ausculta.model

enum class FilterMode(val displayName: String, val lowCutoffHz: Float, val highCutoffHz: Float, val description: String) {
    RAW("Wideband Raw", 10f, 2000f, "Full acoustic frequency spectrum without digital bandpass"),
    HEART_BANDPASS("Heart Mode", 20f, 200f, "Isolates S1, S2, S3, S4, and cardiac murmurs"),
    LUNG_BANDPASS("Lung Mode", 100f, 1000f, "Isolates vesicular sounds, wheezes, and crackles"),
    ECG_NOTCH("ECG 60Hz Notch", 0.5f, 150f, "Suppresses AC powerline hum from cardiac leads")
}
