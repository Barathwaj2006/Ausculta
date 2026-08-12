package com.example.ausculta.ui.screens.live

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
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
import com.example.ausculta.model.AuscultationSite
import com.example.ausculta.model.DeviceConnectionState
import com.example.ausculta.model.FilterMode
import com.example.ausculta.theme.*
import com.example.ausculta.ui.components.DisconnectedStateView
import com.example.ausculta.ui.components.PoorSignalStateView
import com.example.ausculta.ui.components.SpectrumView
import com.example.ausculta.ui.components.WaveformView

@Composable
fun LiveAuscultationScreen(
    viewModel: LiveAuscultationViewModel,
    onSessionSaved: (String) -> Unit,
    onBack: () -> Unit
) {
    val connectionState by viewModel.connectionState.collectAsStateWithLifecycle()
    val signalMetrics by viewModel.signalMetrics.collectAsStateWithLifecycle()
    val latestPacket by viewModel.latestPacket.collectAsStateWithLifecycle()
    val spectrum by viewModel.liveSpectrum.collectAsStateWithLifecycle()
    val selectedSite by viewModel.selectedSite.collectAsStateWithLifecycle()
    val selectedFilter by viewModel.selectedFilter.collectAsStateWithLifecycle()

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
                text = "Live Auscultation",
                style = MaterialTheme.typography.titleLarge,
                color = Slate100,
                fontWeight = FontWeight.Bold
            )
            Surface(
                color = if (signalMetrics.isRecording) ErrorRose.copy(alpha = 0.2f) else Slate800,
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    text = if (signalMetrics.isRecording) "● REC" else "READY",
                    color = if (signalMetrics.isRecording) ErrorRose else ElectricCyan400,
                    style = MaterialTheme.typography.labelSmall,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                    fontWeight = FontWeight.Bold
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        if (connectionState == DeviceConnectionState.DISCONNECTED || connectionState == DeviceConnectionState.DEVICE_UNAVAILABLE) {
            DisconnectedStateView(
                onConnectClick = { viewModel.startConnecting() },
                onSimulatorClick = { viewModel.startSimulator() }
            )
        } else {
            // Poor Signal / Loss of Contact Alert
            AnimatedVisibility(visible = !latestPacket.finger) {
                PoorSignalStateView(modifier = Modifier.padding(bottom = 12.dp))
            }

            // Real-time Vitals Display Row
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Slate800),
                shape = RoundedCornerShape(14.dp),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(Slate700))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceAround,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("HEART RATE", style = MaterialTheme.typography.labelSmall, color = Slate400)
                        Text(
                            text = if (latestPacket.bpm > 0) "${latestPacket.bpm} BPM" else "--",
                            style = MaterialTheme.typography.headlineMedium,
                            color = HeartPulsePink,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("SPO2", style = MaterialTheme.typography.labelSmall, color = Slate400)
                        Text(
                            text = if (latestPacket.spo2 > 0) "${latestPacket.spo2}%" else "--",
                            style = MaterialTheme.typography.headlineMedium,
                            color = OxygenTeal,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("SIGNAL QUALITY", style = MaterialTheme.typography.labelSmall, color = Slate400)
                        Text(
                            text = "${signalMetrics.signalQualityPercentage}%",
                            style = MaterialTheme.typography.headlineMedium,
                            color = ElectricCyan400,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Oscilloscope Waveform Display
            Text(
                text = "REAL-TIME PHYSIOLOGICAL OSCILLOSCOPE",
                style = MaterialTheme.typography.labelSmall,
                color = Slate400,
                modifier = Modifier.padding(bottom = 6.dp)
            )
            WaveformView(
                waveform = latestPacket.wave,
                lineColor = ElectricCyan400,
                backgroundColor = Slate950
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Frequency Spectrum Analyzer Display
            Text(
                text = "SPECTRAL ANALYSIS (16-BAND FFT)",
                style = MaterialTheme.typography.labelSmall,
                color = Slate400,
                modifier = Modifier.padding(bottom = 6.dp)
            )
            SpectrumView(
                spectrum = spectrum,
                barColor = ElectricCyan400,
                backgroundColor = Slate950
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Anatomical Site Selector
            Text(
                text = "ANATOMICAL EXAMINATION SITE",
                style = MaterialTheme.typography.labelSmall,
                color = Slate400,
                modifier = Modifier.padding(bottom = 6.dp)
            )
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(AuscultationSite.values()) { site ->
                    val isSelected = site == selectedSite
                    Surface(
                        modifier = Modifier.clip(RoundedCornerShape(8.dp)).clickable { viewModel.setSite(site) },
                        color = if (isSelected) ElectricCyan500 else Slate800,
                        contentColor = if (isSelected) Slate950 else Slate200
                    ) {
                        Text(
                            text = site.displayName,
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            // Record / Save Session Floating Action Button
            Button(
                onClick = { viewModel.toggleRecording(onSessionSaved) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (signalMetrics.isRecording) ErrorRose else ElectricCyan500,
                    contentColor = if (signalMetrics.isRecording) Slate100 else Slate950
                ),
                shape = RoundedCornerShape(14.dp)
            ) {
                Text(
                    text = if (signalMetrics.isRecording) "Stop Recording & Save Session" else "Start Auscultation Recording",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
