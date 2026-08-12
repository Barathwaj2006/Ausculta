package com.example.ausculta.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val AuscultaDarkColorScheme = darkColorScheme(
    primary = ElectricCyan400,
    onPrimary = Slate950,
    primaryContainer = ElectricCyanGlow,
    onPrimaryContainer = ElectricCyan300,
    secondary = HeartPulsePink,
    onSecondary = Slate950,
    tertiary = OxygenTeal,
    onTertiary = Slate950,
    background = Slate900,
    onBackground = Slate100,
    surface = Slate800,
    onSurface = Slate100,
    surfaceVariant = Slate700,
    onSurfaceVariant = Slate200,
    error = ErrorRose,
    onError = Slate100,
    outline = Slate600
)

@Composable
fun AuscultaTheme(
    darkTheme: Boolean = true, // Force dark mode foundation as required by Ausculta Deep Rhythm
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = AuscultaDarkColorScheme,
        typography = Typography,
        content = content
    )
}
