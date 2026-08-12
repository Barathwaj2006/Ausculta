package com.example.ausculta.ui.navigation

import androidx.compose.runtime.Composable
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.ausculta.ui.screens.dashboard.DashboardScreen
import com.example.ausculta.ui.screens.dashboard.DashboardViewModel
import com.example.ausculta.ui.screens.live.LiveAuscultationScreen
import com.example.ausculta.ui.screens.live.LiveAuscultationViewModel
import com.example.ausculta.ui.screens.patients.PatientsScreen
import com.example.ausculta.ui.screens.session.SessionDetailScreen
import com.example.ausculta.ui.screens.session.SessionDetailViewModel
import com.example.ausculta.ui.screens.settings.SettingsScreen

@Composable
fun AuscultaNavHost(
    navController: NavHostController = rememberNavController()
) {
    NavHost(navController = navController, startDestination = Screen.Dashboard.route) {
        composable(Screen.Dashboard.route) {
            val vm: DashboardViewModel = viewModel()
            DashboardScreen(
                viewModel = vm,
                onNavigateToLive = { navController.navigate(Screen.LiveAuscultation.route) },
                onNavigateToSession = { id -> navController.navigate(Screen.SessionDetail.createRoute(id)) },
                onNavigateToPatients = { navController.navigate(Screen.Patients.route) },
                onNavigateToSettings = { navController.navigate(Screen.Settings.route) }
            )
        }
        composable(Screen.LiveAuscultation.route) {
            val vm: LiveAuscultationViewModel = viewModel()
            LiveAuscultationScreen(
                viewModel = vm,
                onSessionSaved = { id ->
                    navController.popBackStack()
                    navController.navigate(Screen.SessionDetail.createRoute(id))
                },
                onBack = { navController.popBackStack() }
            )
        }
        composable(Screen.SessionDetail.route) { backStackEntry ->
            val id = backStackEntry.arguments?.getString(\sessionId\) ?: \\
            val vm: SessionDetailViewModel = viewModel()
            SessionDetailScreen(id, vm, onBack = { navController.popBackStack() })
        }
        composable(Screen.Patients.route) {
            PatientsScreen(onBack = { navController.popBackStack() })
        }
        composable(Screen.Settings.route) {
            SettingsScreen(onBack = { navController.popBackStack() })
        }
    }
}