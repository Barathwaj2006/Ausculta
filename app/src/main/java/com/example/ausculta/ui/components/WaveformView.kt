package com.example.ausculta.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import com.example.ausculta.theme.*

@Composable
fun WaveformView(
    waveform: FloatArray,
    modifier: Modifier = Modifier,
    lineColor: Color = ElectricCyan400,
    backgroundColor: Color = Slate950,
    gridColor: Color = Slate700.copy(alpha = 0.4f)
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(180.dp)
            .background(backgroundColor, shape = RoundedCornerShape(12.dp))
            .border(1.dp, Slate700, shape = RoundedCornerShape(12.dp))
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val width = size.width
            val height = size.height

            // Grid lines
            val gridCols = 8
            val gridRows = 4
            for (i in 1 until gridCols) {
                val x = width * (i.toFloat() / gridCols)
                drawLine(
                    color = gridColor,
                    start = Offset(x, 0f),
                    end = Offset(x, height),
                    strokeWidth = 1.dp.toPx()
                )
            }
            for (i in 1 until gridRows) {
                val y = height * (i.toFloat() / gridRows)
                drawLine(
                    color = gridColor,
                    start = Offset(0f, y),
                    end = Offset(width, y),
                    strokeWidth = 1.dp.toPx()
                )
            }

            if (waveform.isEmpty()) {
                // Flatline baseline
                drawLine(
                    color = lineColor.copy(alpha = 0.5f),
                    start = Offset(0f, height / 2f),
                    end = Offset(width, height / 2f),
                    strokeWidth = 2.dp.toPx()
                )
                return@Canvas
            }

            // Draw oscilloscope waveform
            val path = Path()
            val stepX = width / (waveform.size - 1).coerceAtLeast(1)
            val centerY = height / 2f
            val maxAmplitude = 1000f

            for (i in waveform.indices) {
                val sample = waveform[i]
                val normalizedY = (sample / maxAmplitude).coerceIn(-1.0f, 1.0f)
                val y = centerY - (normalizedY * (height / 2.2f))
                val x = i * stepX

                if (i == 0) {
                    path.moveTo(x, y)
                } else {
                    path.lineTo(x, y)
                }
            }

            // Glow layer
            drawPath(
                path = path,
                color = lineColor.copy(alpha = 0.3f),
                style = Stroke(width = 6.dp.toPx())
            )
            // Sharp line
            drawPath(
                path = path,
                color = lineColor,
                style = Stroke(width = 2.5.dp.toPx())
            )
        }
    }
}
