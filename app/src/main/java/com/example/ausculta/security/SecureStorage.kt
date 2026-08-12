package com.example.ausculta.security

import android.content.Context
import android.content.SharedPreferences


class SecureStorage(private val context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("ausculta_secure_prefs", Context.MODE_PRIVATE)

    fun saveApiKey(key: String) {
        prefs.edit().putString("gemini_api_key", key).apply()
    }

    fun getApiKey(): String? {
        return prefs.getString("gemini_api_key", null)
    }
}
