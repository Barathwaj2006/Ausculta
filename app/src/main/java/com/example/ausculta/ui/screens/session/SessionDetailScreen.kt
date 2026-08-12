package com.example.ausculta.ui.screens.session

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ausculta.ui.theme.*
import com.example.ausculta.util.FileProviderHelper

@Composable
fun SessionDetailScreen(
    sessionId: String,
    viewModel: SessionDetailViewModel,
    onBack: () -> Unit
) {
    LaunchedEffect(sessionId) {
        viewModel.loadSession(sessionId)
    }

    val session by viewModel.session.collectAsStateWithLifecycle()
    val aiResult by viewModel.aiResult.collectAsStateWithLifecycle()
    val isAnalyzing by viewModel.isAnalyzing.collectAsStateWithLifecycle()
    val context = LocalContext.current

    Scaffold(
        containerColor = SlateDark,
        topBar = {
            Row(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                verticalAlignment = Alignment.CenterVertical
            ) {
                IconButton(onClick = onBack) {
                    Text(" Back\, fontSize = 16.sp, color = CyanAccent)
 }
 Text(\Auscultation Session Details\, fontWeight = FontWeight.Bold, fontSize = 20.sp, color = TextPrimary)
 }
 }
 ) { padding ->
 if (session == null) {
 Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
 CircularProgressIndicator(color = CyanAccent)
 }
 } else {
 Column(
 modifier = Modifier
 .fillMaxSize()
 .padding(padding)
 .padding(16.dp),
 verticalArrangement = Arrangement.spacedBy(16.dp)
 ) {
 Card(colors = CardDefaults.cardColors(containerColor = SlateCard), modifier = Modifier.fillMaxWidth()) {
 Column(modifier = Modifier.padding(16.dp)) {
 Text(\Patient: \ + session!!.patientName, fontWeight = FontWeight.Bold, fontSize = 18.sp, color = TextPrimary)
 Text(\Site: \ + session!!.site.displayName, color = TextSecondary)
 Text(\Heart Rate: \ + session!!.averageHeartRateBpm + " BPM\, color = EmeraldGreen)
                    }
                }

                Button(
                    onClick = { viewModel.playAudio() },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = SlateCard, contentColor = CyanAccent)
                ) {
                    Text(\Play Stethoscope Audio\)
                }

                Button(
                    onClick = { viewModel.runAiAnalysis() },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = CyanAccent, contentColor = SlateDark)
                ) {
                    if (isAnalyzing) {
                        CircularProgressIndicator(size = 24.dp, color = SlateDark)
                    } else {
                        Text(\Run Gemini AI Clinical Analysis\, fontWeight = FontWeight.Bold)
                    }
                }

                if (aiResult != null) {
                    Card(colors = CardDefaults.cardColors(containerColor = SlateCard), modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(\AI Impression\, fontWeight = FontWeight.Bold, color = CyanAccent)
                            Text(aiResult!!.primaryImpression, color = TextPrimary)
                            Spacer(Modifier.height(8.dp))
                            Text(\Risk: \ + aiResult!!.riskLevel, color = EmeraldGreen)
                        }
                    }

                    OutlinedButton(
                        onClick = {
                            val pdf = viewModel.generatePdf()
                            if (pdf != null) {
                                val uri = FileProviderHelper.getUriForFile(context, pdf)
                                val intent = Intent(Intent.ACTION_VIEW).apply {
                                    setDataAndType(uri, \application/pdf\)
                                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                                }
                                context.startActivity(intent)
                            }
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(\Export PDF Clinical Report\, color = CyanAccent)
                    }
                }
            }
        }
    }
}