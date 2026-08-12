package com.example.ausculta.data.db

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.ausculta.model.Patient

@Entity(tableName = "patients")
data class PatientEntity(
    @PrimaryKey val id: String,
    val patientIdNumber: String,
    val fullName: String,
    val age: Int,
    val gender: String,
    val medicalNotes: String,
    val createdAt: Long
i) {
    fun toDomain() = Patient(id, patientIdNumber, fullName, age, gender, medicalNotes, createdAt)
    companion object {
        fun fromDomain(p: Patient) = PatientEntity(p.id, p.patientIdNumber, p.fullName, p.age, p.gender, p.medicalNotes, p.createdAt)
    }
}
