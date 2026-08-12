package com.example.ausculta.ui.screens.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ausculta.model.Session
import com.example.ausculta.ui.components.DeviceStatusCard
import com.example.ausculta.ui.theme.*

@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel,
    onNavigateToLive: () -> Unit,
    onNavigateToSession: (String) -> Unit,
    onNavigateToPatients: () -> Unit,
    onNavigateToSettings: () -> Unit
) {
    val connectionState by viewModel.connectionState.collectAsStateWithLifecycle()
    val recentSessions by viewModel.recentSessions.collectAsStateWithLifecycle(initialValue = emptyList())

    Scaffold(
        containerColor = SlateDark,
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertical,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(" AUSCULTA\, fontWeight = FontWeight.Bold, fontSize = 24.sp, color = CyanAccent)
 Text(\Digital Stethoscope and AI Analyzer\, fontSize = 12.sp, color = TextSecondary)
 }
 IconButton(onClick = onNavigateToSettings) {
 Text(\Settings\, fontSize = 14.sp, color = CyanAccent)
 }
 }
 }
 ) { padding ->
 LazyColumn(
 modifier = Modifier
 .fillMaxSize()
 .padding(padding)
 .padding(16.dp),
 verticalArrangement = Arrangement.spacedBy(16.dp)
 ) {
 item {
 DeviceStatusCard(
 state = connectionState,
 onConnectSimulator = { viewModel.connectSimulator() },
 onDisconnect = { viewModel.disconnect() }
 )
 }

 item {
 Button(
 onClick = onNavigateToLive,
 modifier = Modifier.fillMaxWidth().height(56.dp),
 colors = ButtonDefaults.buttonColors(containerColor = CyanAccent, contentColor = SlateDark),
 shape = androidx.compose.foundation.shape.RoundedCornerShape(16.dp)
 ) {
 Text(\Start Live Auscultation Session\, fontWeight = FontWeight.Bold, fontSize = 16.sp)
 }
 }

 item {
 Row(
 modifier = Modifier.fillMaxWidth(),
 horizontalArrangement = Arrangement.SpaceBetween,
 verticalAlignment = Alignment.CenterVertical
 ) {
 Text(\Recent Auscultations\, fontWeight = FontWeight.Bold, fontSize = 18.sp, color = TextPrimary)
 TextButton(onClick = onNavigateToPatients) {
 Text(\View Patients\, color = CyanAccent)
 }
 }
 }

 items(recentSessions) { session ->
 Card(
 onClick = { onNavigateToSession(session.id) },
 modifier = Modifier.fillMaxWidth(),
 colors = CardDefaults.cardColors(containerColor = SlateCard)
 ) {
 Column(modifier = Modifier.padding(16.dp)) {
 Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
 Text(session.patientName, fontWeight = FontWeight.Bold, color = TextPrimary)
 Text(session.averageHeartRateBpm.toString() + " BPM\, color = EmeraldGreen)
                        }
                        Text(session.site.displayName + " • \ + session.durationSeconds + \s\, fontSize = 12.sp, color = TextSecondary)
 }
 }
 }
 }
 }
}