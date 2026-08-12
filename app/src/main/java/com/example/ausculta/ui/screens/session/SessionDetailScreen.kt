package com.example.ausculta.ui.screens.session

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ausculta.theme.*
import com.example.ausculta.ui.components.EmptyStateView
import com.example.ausculta.ui.components.LoadingStateView

@Composable
fun SessionDetailScreen(
    sessionId: String,
    viewModel: SessionDetailViewModel,
    onBack: () -> Unit
) {
    val context = LocalContext.current

    LaunchedEffect(sessionId) {
        viewModel.loadSession(sessionId)
    }

    val session by viewModel.session.collectAsStateWithLifecycle()
    val aiResult by viewModel.aiResult.collectAsStateWithLifecycle()
    val isAnalyzing by viewModel.isAnalyzing.collectAsStateWithLifecycle()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate900)
            .padding(16.dp)
    ) {
        // Navigation Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Text("←", fontSize = 24.sp, color = Slate100)
            }
            Text(
                text = "AI Health Report",
                style = MaterialTheme.typography.titleLarge,
                color = Slate100,
                fontWeight = FontWeight.Bold
            )
            IconButton(onClick = { viewModel.shareReportViaWhatsApp(context) }) {
                Text("📄", fontSize = 20.sp)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        val currentSession = session
        if (currentSession == null) {
            EmptyStateView(
                title = "Session Not Found",
                subtitle = "The requested auscultation record could not be retrieved."
            )
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Session Meta Header Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Slate800),
                    shape = RoundedCornerShape(16.dp),
                    border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(Slate700))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = currentSession.patientName,
                                    style = MaterialTheme.typography.headlineMedium,
                                    color = Slate100,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "${currentSession.patientAge} YRS • ${currentSession.patientSex} • ${currentSession.site.displayName}",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = Slate400
                                )
                            }
                            Surface(
                                color = ElectricCyanGlow,
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(
                                    text = "VERIFIED",
                                    color = ElectricCyan400,
                                    style = MaterialTheme.typography.labelSmall,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceAround
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("HEART RATE", style = MaterialTheme.typography.labelSmall, color = Slate400)
                                Text("${currentSession.bpm} BPM", style = MaterialTheme.typography.titleLarge, color = HeartPulsePink, fontWeight = FontWeight.Bold)
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("SPO2 LEVEL", style = MaterialTheme.typography.labelSmall, color = Slate400)
                                Text("${currentSession.spo2}%", style = MaterialTheme.typography.titleLarge, color = OxygenTeal, fontWeight = FontWeight.Bold)
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("SIGNAL QUALITY", style = MaterialTheme.typography.labelSmall, color = Slate400)
                                Text("${currentSession.signalQualityScore}%", style = MaterialTheme.typography.titleLarge, color = ElectricCyan400, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }

                // AI Diagnostic Findings Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Slate800),
                    shape = RoundedCornerShape(16.dp),
                    border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(ElectricCyanGlow))
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("🤖", fontSize = 22.sp)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Clinical AI Intelligence",
                                    style = MaterialTheme.typography.titleLarge,
                                    color = Slate100,
                                    fontWeight = FontWeight.Bold
                                )
                            }

                            if (aiResult != null) {
                                Surface(
                                    color = OxygenTeal.copy(alpha = 0.2f),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text(
                                        text = "${aiResult?.confidencePercentage}% Confidence",
                                        color = OxygenTeal,
                                        style = MaterialTheme.typography.labelSmall,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        if (isAnalyzing) {
                            LoadingStateView(message = "Executing Gemini AI Diagnostic Model...")
                        } else {
                            Text(
                                text = aiResult?.primaryDiagnosis ?: currentSession.aiSummary,
                                style = MaterialTheme.typography.bodyLarge,
                                color = Slate200,
                                lineHeight = 22.sp
                            )

                            val details = aiResult?.summaryDetails
                            if (!details.isNullOrEmpty()) {
                                Spacer(modifier = Modifier.height(10.dp))
                                Text(
                                    text = details,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = Slate400
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Button(
                            onClick = { viewModel.runAiAnalysis() },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = ElectricCyan500, contentColor = Slate950),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Re-Run Gemini AI Analysis", fontWeight = FontWeight.Bold)
                        }
                    }
                }

                // Audio Playback & Filter Controls
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Slate800),
                    shape = RoundedCornerShape(16.dp),
                    border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(Slate700))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Auscultation Audio Playback",
                            style = MaterialTheme.typography.titleMedium,
                            color = Slate100,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "High-Fidelity Filtered Waveform Recording",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Slate400
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Button(
                                onClick = { viewModel.playAudio() },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(containerColor = Slate700, contentColor = Slate100),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Text("▶ Play Recording")
                            }

                            Button(
                                onClick = { viewModel.shareReportViaWhatsApp(context) },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(containerColor = Slate700, contentColor = Slate100),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Text("📤 Share Report")
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}
