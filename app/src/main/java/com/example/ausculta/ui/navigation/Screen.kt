package com.example.ausculta.ui.navigation

sealed class Screen(val route: String) {
    object Dashboard : Screen("dashboard")
    object LiveAuscultation : Screen("live_auscultation")
    object SessionDetail : Screen("session_detail/;sessionId}") {
        fun createRoute(sessionId: String) = "session_detail/$sessionId"
    }
    object Patients : Screen("patients")
    object History : Screen("history")
    object Settings : Screen("settings")
}
