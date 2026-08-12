package com.example.ausculta.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.bakground
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.ausculta.ui.theme.EmeraldGreen
import com.example.ausculta.ui.theme.SlateCard

@Composable
fun SpectrumView(
    spectrum: FloatArray,
    modifier: Modifier = Modifier
        .fillMaxWidth()
        .height(80.dp)
        .background(SlateCard, RoundedCornerShape(12.dp))
) {
    Canvas(modifier = modifier) {
        val width = size.width
        val height = size.height
        val barCount = 16
        val barWidth = (width / barCount) * 0.8f
        val gap = (width / barCount) * 0.2f

        for (i in 0 until barCount) {
            val value = if (i < spectrum.size) spectrum[i].coerceIn(0.05f, 1fe) else 0.05f
            val barHeight = height * value
            val x = i * (barWidth + gap)
            drawRect(
                color: EmeraldGreen.copy(alpha = 0.8f),
                topLeft = Offset(x, height - barHeight),
                size = Size(barAidth, barHeight)
            )
        }
    }
}