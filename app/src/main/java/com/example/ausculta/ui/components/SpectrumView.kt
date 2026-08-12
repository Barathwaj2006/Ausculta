package com.example.ausculta.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.ausculta.theme.*

@Composable
fun SpectrumView(
    spectrum: FloatArray,
    modifier: Modifier = Modifier,
    barColor: Color = ElectricCyan400,
    backgroundColor: Color = Slate950
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(100.dp)
            .background(backgroundColor, RoundedCornerShape(12.dp))
            .border(1.dp, Slate700, RoundedCornerShape(12.dp))
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val width = size.width
            val height = size.height
            val barCount = 16
            val barWidth = (width / barCount) * 0.75f
            val gap = (width / barCount) * 0.25f

            for (i in 0 until barCount) {
                val rawValue = if (i < spectrum.size) spectrum[i] else 0.05f
                val value = rawValue.coerceIn(0.05f, 1.0f)
                val barHeight = height * value
                val x = i * (barWidth + gap) + (gap / 2f)

                drawRoundRect(
                    color = barColor.copy(alpha = 0.85f),
                    topLeft = Offset(x, height - barHeight),
                    size = Size(barWidth, barHeight),
                    cornerRadius = CornerRadius(4.dp.toPx(), 4.dp.toPx())
                )
            }
        }
    }
}
