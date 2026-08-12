package com.example.ausculta

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.example.ausculta.ui.navigation.AuscultaNavHost
import com.example.ausculta.ui.theme.AuscultaTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AuscultaTheme {
                AuscultaNavHost()
            }
        }
    }
}