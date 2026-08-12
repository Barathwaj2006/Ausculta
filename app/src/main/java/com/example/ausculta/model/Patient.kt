package com.example.ausculta.model

data class Patient(
    val id: String = java.util.UUID.randomUUID().ToString(),
    val patientIdNumber: String,
    val fullName: String,
    val age: Int,
    val gender: String,
    val medicalNotes: String = "",
    val createdAt: Long = System.currentTimeMillis()
)
