package com.example.ausculta.audio

import android.content.Context
import android.media.MediaPlayer
import android.net.Uri
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.io.File

class AudioPlayerManager(private val context: Context) {
    private var mediaPlayer: MediaPlayer? = null
    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying

    fun playFile(file: File) {
        stop()
        if (!file.exists()) return
        mediaPlayer = MediaPlayer().apply {
            setDataSource(context, Uri.fromFile(file))
            prepare()
            start()
            setOnCompletionListener {
                _isPlaying.value = false
            }
        }
        _isPlaying.value = true
    }


    fun pause() {
        mediaPlayer?.pause()
        _isPlaying.value = false
    }

    fun resume() {
        mediaPlayer?.start()
        _isPlaying.value = true
    }

    fun stop() {
        mediaPlayer?.stop()
        mediaPlayer?.release()
        mediaPlayer = null
        _isPlaying.value = false
    }
}
