package com.example.ausculta.ui.screens.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ausculta.model.DeviceConnectionState
import com.example.ausculta.model.Session
import com.example.ausculta.theme.*
import com.example.ausculta.ui.components.DeviceStatusCard
import com.example.ausculta.ui.components.EmptyStateView

@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel,
    onNavigateToLive: () -> Unit,
    onNavigateToSession: (String) -> Unit,
    onNavigateToHistory: () -> Unit,
    onNavigateToPatients: () -> Unit,
    onNavigateToSettings: () -> Unit
) {
    val connectionState by viewModel.connectionState.collectAsStateWithLifecycle()
    val latestPacket by viewModel.packetState.collectAsStateWithLifecycle()
    val recentSessions by viewModel.recentSessions.collectAsStateWithLifecycle(initialValue = emptyList())

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate900)
            .padding(16.dp)
    ) {
        // Top Bar Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "AUSCULTA",
                    style = MaterialTheme.typography.displayLarge,
                    color = ElectricCyan400,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.ExtraBold
                )
                Text(
                    text = "Deep Rhythm Intelligence Platform",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Slate400
                )
            }
            IconButton(
                onClick = onNavigateToSettings,
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .background(Slate800)
            ) {
                Text("⚙️", fontSize = 18.sp)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Hardware Status Card
            item {
                DeviceStatusCard(
                    connectionState = connectionState,
                    isFingerContact = latestPacket.finger,
                    onConnectClick = { viewModel.connectDevice() },
                    onToggleSimulator = {
                        if (connectionState == DeviceConnectionState.SIMULATING) {
                            viewModel.connectDevice()
                        } else {
                            viewModel.startSimulator()
                        }
                    }
                )
            }

            // Real-Time Vitals Bar (if connected or simulating)
            if (connectionState == DeviceConnectionState.CONNECTED || connectionState == DeviceConnectionState.SIMULATING) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Slate800),
                        shape = RoundedCornerShape(16.dp),
                        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(ElectricCyanGlow))
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceAround,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("HEART RATE", style = MaterialTheme.typography.labelSmall, color = Slate400)
                                Text(
                                    text = if (latestPacket.bpm > 0) "${latestPacket.bpm} BPM" else "--",
                                    style = MaterialTheme.typography.headlineLarge,
                                    color = HeartPulsePink,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Divider(
                                modifier = Modifier
                                    .height(40.dp)
                                    .width(1.dp),
                                color = Slate700
                            )
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("SPO2 LEVEL", style = MaterialTheme.typography.labelSmall, color = Slate400)
                                Text(
                                    text = if (latestPacket.spo2 > 0) "${latestPacket.spo2}%" else "--",
                                    style = MaterialTheme.typography.headlineLarge,
                                    color = OxygenTeal,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }

            // Action Card - Live Auscultation Trigger
            item {
                Button(
                    onClick = onNavigateToLive,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(60.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = ElectricCyan500,
                        contentColor = Slate950
                    ),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("🎙️", fontSize = 20.sp)
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "Start Live Auscultation",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            // Navigation Quick Links Row
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = onNavigateToHistory,
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = ElectricCyan400),
                        border = ButtonDefaults.outlinedButtonBorder.copy(brush = androidx.compose.ui.graphics.SolidColor(Slate700)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("History & Trends", fontWeight = FontWeight.SemiBold)
                    }
                    OutlinedButton(
                        onClick = onNavigateToPatients,
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = ElectricCyan400),
                        border = ButtonDefaults.outlinedButtonBorder.copy(brush = androidx.compose.ui.graphics.SolidColor(Slate700)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Patients Registry", fontWeight = FontWeight.SemiBold)
                    }
                }
            }

            // Recent Sessions Section Header
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Recent Auscultations",
                        style = MaterialTheme.typography.titleLarge,
                        color = Slate100,
                        fontWeight = FontWeight.Bold
                    )
                    TextButton(onClick = onNavigateToHistory) {
                        Text("View All", color = ElectricCyan400, fontWeight = FontWeight.Bold)
                    }
                }
            }

            // Recent Sessions List
            if (recentSessions.isEmpty()) {
                item {
                    EmptyStateView(
                        title = "No Recent Sessions",
                        subtitle = "Recorded stethoscope sessions and AI health reports will appear here.",
                        onActionClick = onNavigateToLive,
                        actionText = "Start Live Session"
                    )
                }
            } else {
                items(recentSessions.take(5)) { session ->
                    DashboardSessionCard(
                        session = session,
                        onClick = { onNavigateToSession(session.id) }
                    )
                }
            }
        }
    }
}

@Composable
fun DashboardSessionCard(
    session: Session,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = Slate800),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(Slate700))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = session.patientName,
                    style = MaterialTheme.typography.titleMedium,
                    color = Slate100,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${session.site.displayName} • ${session.durationSeconds}s duration",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Slate400
                )
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "${session.bpm} BPM",
                    style = MaterialTheme.typography.titleMedium,
                    color = HeartPulsePink,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${session.spo2}% SpO2",
                    style = MaterialTheme.typography.bodyMedium,
                    color = OxygenTeal
                )
            }
        }
    }
}
