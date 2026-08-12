package com.example.ausculta.ui.screens.patients

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ausculta.ui.theme.*

@Composable
fun PatientsScreen(
    onBack: () -> Unit
) {
    Scaffold(
        containerColor = SlateDark,
        topBar = {
            Row(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                verticalAlignment = Alignment.CenterVertical
            ) {
                IconButton(onClick = onBack) {
                    Text(\Back\, fontSize = 16.sp, color = CyanAccent)
                }
                Text(\Patient Records\, fontWeight = FontWeight.Bold, fontSize = 20.sp, color = TextPrimary)
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            Card(colors = CardDefaults.cardColors(containerColor = SlateCard), modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(\John Doe\, fontWeight = FontWeight.Bold, color = TextPrimary)
                    Text(\ID: PT-9841 - 45 YOA - Male\, color = TextSecondary)
                }
            }
        }
    }
}