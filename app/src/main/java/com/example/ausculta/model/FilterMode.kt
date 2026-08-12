package com.example.ausculta.model

enum class FilterMode(val displayName: String, val lowCutoffHz: Float, val highCutoffHz: Float, val description: String) {
    WIDEBAND("Wideband Raw", 10f, 450f, "Full acoustic frequency spectrum without digital bandpass"),
    RAW("Wideband Raw", 10f, 450f, "Full acoustic frequency spectrum without digital bandpass"),
    HEART_BANDPASS("Heart Mode", 20f, 200f, "Isolates cardiac acoustic spectrum (20-200 Hz)"),
    LUNG_BANDPASS("Lung Mode", 100f, 450f, "Isolates respiratory acoustic spectrum (100-450 Hz)"),
    ECG_NOTCH("ECG 60Hz Notch", 0.5f, 150f, "Suppresses AC powerline hum from cardiac leads")
}
