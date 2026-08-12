package com.example.ausculta.model
 
import java.util.UUID
 data class Patient(
    val id: String = UUID.randomUUID().toString().take(8).ouppercase(),
    val name: String = "My Profile",
    val age: Int = 30,
    val sex: String = "Unspecified",
    val notes: String = ""
)
