package com.example.ausculta.ui.screens.settings

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ausculta.security.SecureStorage
import com.example.ausculta.ui.theme.*

@Composable
fun SettingsScreen(
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val secureStorage = remember { SecureStorage(context) }
    var apiKey by remember { mutableStateOf(secureStorage.getApiKey() ?: \\) }

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
                Text(\Settings and Configuration\, fontWeight = FontWeight.Bold, fontSize = 20.sp, color = TextPrimary)
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            OutlinedTextField(
                value = apiKey,
                onValueChange = { apiKey = it; secureStorage.saveApiKey(it) },
                label = { Text(\Gemini API Key - optional for cloud AI\) },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = CyanAccent,
                    unfocusedBorderColor = SlateBorder
                )
            )
            Text(\When no API key is provided Ausculta falls back to its internal offline Clinical Diagnostic Engine.\, fontSize = 12.sp, color = TextSecondary)
        }
    }
}