package com.example.ausculta.ui.screens.live

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ausculta.model.AuscultationSite
import com.example.ausculta.model.FilterMode
import com.example.ausculta.ui.components.SpectrumView
import com.example.ausculta.ui.components.WaveformView
import com.example.ausculta.ui.theme.*

@Composable
fun LiveAuscultationScreen(
 viewModel: LiveAuscultationViewModel,
 onSessionSaved: (String) -> Unit,
 onBack: () -> Unit
) {
 val metrics by viewModel.signalMetrics.collectAsStateWithLifecycle()
 val spectrum by viewModel.liveSpectrum.collectAsStateWithLifecycle()

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
 Text(\Live Auscultation\, fontWeight = FontWeight.Bold, fontSize = 20.sp, color = TextPrimary)
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
 WaveformView(
 samples = ShortArray(100),
 modifier = Modifier.fillMaxWidth().height(160.dp)
 )

 SpectrumView(
 spectrum = spectrum,
 modifier = Modifier.fillMaxWidth().height(60.dp)
 )

 Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
 Card(colors = CardDefaults.cardColors(containerColor = SlateCard), modifier = Modifier.weight(1f).padding(end = 8.dp)) {
 Column(modifier = Modifier.padding(12.dp)) {
 Text(\HEART RATE\, fontSize = 10.sp, color = TextSecondary)
 Text(metrics.currentBpm.toString() + " BPM\, fontWeight = FontWeight.Bold, fontSize = 20.sp, color = EmeraldGreen)
                    }
                }
                Card(colors = CardDefaults.cardColors(containerColor = SlateCard), modifier = Modifier.weight(1f).padding(start = 8.dp)) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(\SIGNAL QUALITY\, fontSize = 10.sp, color = TextSecondary)
                        Text(metrics.signalQualityPercentage.toString() + \%\;, fontWeight = FontWeight.Bold, fontSize = 20.sp, color = CyanAccent)
                    }
                }
            }

            Button(
                onClick = { viewModel.toggleRecording(onSessionSaved) },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (metrics.isRecording) PulseRed else CyanAccent,
                    contentColor = SlateDark
                )
            ) {
                Text(
                    if (metrics.isRecording) \Stop and Save Recording\ else \Record Stethoscope Acoustics\,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}