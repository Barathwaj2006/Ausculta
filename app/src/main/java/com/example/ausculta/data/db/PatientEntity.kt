package com.example.ausculta.data.db

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.ausculta.model.Patient

@Entity(tableName = "patients")
data class PatientEntity(
    @PrimaryKey val id: String,
    val name: String,
    val age: Int,
    val sex: String,
    val notes: String
) {
    fun toDomain() = Patient(id, name, age, sex, notes)

    companion object {
        fun fromDomain(p: Patient) = PatientEntity(p.id, p.name, p.age, p.sex, p.notes)
    }
}
