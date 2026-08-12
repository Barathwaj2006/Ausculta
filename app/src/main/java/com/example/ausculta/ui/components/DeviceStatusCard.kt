package com.example.ausculta.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ausculta.model.DeviceConnectionState
import com.example.ausculta.theme.*

@Composable
fun DeviceStatusCard(
    connectionState: DeviceConnectionState,
    isFingerContact: Boolean,
    onConnectClick: () -> Unit,
    onToggleSimulator: () -> Unit,
    modifier: Modifier = Modifier
) {
    val statusColor = when (connectionState) {
        DeviceConnectionState.CONNECTED -> OxygenTeal
        DeviceConnectionState.SIMULATING -> ElectricCyan400
        DeviceConnectionState.CONNECTING -> WarningAmber
        DeviceConnectionState.DISCONNECTED -> Slate400
        DeviceConnectionState.DEVICE_UNAVAILABLE -> ErrorRose
    }

    Card(
        modifier = modifier.fillMaxWidth(),
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
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(12.dp)
                            .clip(CircleShape)
                            .background(statusColor)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = connectionState.displayName,
                        style = MaterialTheme.typography.titleMedium,
                        color = Slate100,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                if (connectionState == DeviceConnectionState.DISCONNECTED || connectionState == DeviceConnectionState.DEVICE_UNAVAILABLE) {
                    Button(
                        onClick = onConnectClick,
                        colors = ButtonDefaults.buttonColors(containerColor = ElectricCyan500, contentColor = Slate950),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Connect", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Protocol: Wi-Fi SoftAP HTTP (192.168.4.1)",
                        style = MaterialTheme.typography.labelSmall,
                        color = Slate400
                    )
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(top = 4.dp)
                    ) {
                        Text("Sensor Contact: ", style = MaterialTheme.typography.bodyMedium, color = Slate400)
                        Text(
                            text = if (isFingerContact) "Firm Contact" else "Loss of Contact",
                            style = MaterialTheme.typography.bodyMedium,
                            color = if (isFingerContact) OxygenTeal else ErrorRose,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                TextButton(onClick = onToggleSimulator) {
                    Text(
                        text = if (connectionState == DeviceConnectionState.SIMULATING) "Use Real Wi-Fi AP" else "Dev Simulator",
                        color = ElectricCyan400,
                        fontSize = 12.sp
                    )
                }
            }
        }
    }
}
