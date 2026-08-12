package com.example.ausculta.ui.screens.history

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
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ausculta.model.Session
import com.example.ausculta.theme.*
import com.example.ausculta.ui.components.EmptyStateView
import com.example.ausculta.ui.components.ErrorStateView
import com.example.ausculta.ui.components.LoadingStateView
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun HistoryScreen(
    viewModel: HistoryViewModel = viewModel(),
    onNavigateToSession: (String) -> Unit,
    onNavigateToLive: () -> Unit,
    onBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate900)
            .padding(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "History & Trends",
                    style = MaterialTheme.typography.displayLarge,
                    color = Slate100,
                    fontSize = 26.sp
                )
                Text(
                    text = "Longitudinal Auscultation & Vitals Intelligence",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Slate400
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        when (val state = uiState) {
            is HistoryUiState.Loading -> {
                LoadingStateView(message = "Loading historical sessions...")
            }
            is HistoryUiState.Error -> {
                ErrorStateView(
                    errorMessage = state.message,
                    onRetry = { viewModel.loadHistory() }
                )
            }
            is HistoryUiState.Success -> {
                if (state.sessions.isEmpty()) {
                    EmptyStateView(
                        title = "No History Found",
                        subtitle = "No recorded auscultation sessions match your current filter.",
                        onActionClick = onNavigateToLive,
                        actionText = "Record New Session"
                    )
                } else {
                    // Longitudinal Trend Summary Cards
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Card(
                            modifier = Modifier.weight(1f),
                            colors = CardDefaults.cardColors(containerColor = Slate800),
                            shape = RoundedCornerShape(12.dp),
                            border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(Slate700))
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text("AVG SpO2", style = MaterialTheme.typography.labelSmall, color = Slate400)
                                Text("${state.avgSpO2}%", style = MaterialTheme.typography.headlineLarge, color = OxygenTeal, fontWeight = FontWeight.Bold)
                                Text("Normal Range", style = MaterialTheme.typography.labelSmall, color = Slate400)
                            }
                        }
                        Card(
                            modifier = Modifier.weight(1f),
                            colors = CardDefaults.cardColors(containerColor = Slate800),
                            shape = RoundedCornerShape(12.dp),
                            border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(Slate700))
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text("AVG HEART RATE", style = MaterialTheme.typography.labelSmall, color = Slate400)
                                Text("${state.avgBpm} BPM", style = MaterialTheme.typography.headlineLarge, color = HeartPulsePink, fontWeight = FontWeight.Bold)
                                Text("Resting Baseline", style = MaterialTheme.typography.labelSmall, color = Slate400)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "Recorded Sessions (${state.sessions.size})",
                        style = MaterialTheme.typography.titleMedium,
                        color = Slate100,
                        fontWeight = FontWeight.SemiBold
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(state.sessions) { session ->
                            HistorySessionCard(
                                session = session,
                                onClick = { onNavigateToSession(session.id) }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun HistorySessionCard(
    session: Session,
    onClick: () -> Unit
) {
    val dateFormat = SimpleDateFormat("MMM dd, yyyy • HH:mm", Locale.getDefault())
    val dateStr = dateFormat.format(Date(session.timestampMs))

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
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        color = ElectricCyanGlow,
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text(
                            text = session.siteName,
                            style = MaterialTheme.typography.labelSmall,
                            color = ElectricCyan400,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = dateStr,
                        style = MaterialTheme.typography.labelSmall,
                        color = Slate400
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = session.aiSummary.ifEmpty { "AI diagnostic report generated." },
                    style = MaterialTheme.typography.bodyMedium,
                    color = Slate200,
                    maxLines = 2
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

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
