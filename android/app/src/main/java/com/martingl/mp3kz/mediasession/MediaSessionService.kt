package com.martingl.mp3kz.mediasession

import android.app.Service
import android.content.Intent
import android.os.IBinder

class MediaSessionService : Service() {
    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val isPlaying = MediaSessionModule.instance?.currentIsPlaying ?: false
        val notification = MediaSessionModule.instance?.buildNotification(isPlaying)
            ?: createBasicNotification()
        startForeground(1, notification)

        when (intent?.action) {
            "NEXT" -> MediaSessionModule.instance?.handleNext()
            "PREVIOUS" -> MediaSessionModule.instance?.handlePrevious()
            "PLAY_PAUSE" -> MediaSessionModule.instance?.handlePlayPause()
        }
        return START_STICKY
    }

    private fun createBasicNotification(): android.app.Notification {
        val channelId = "mp3kz_playback"
        return androidx.core.app.NotificationCompat.Builder(this, channelId)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentTitle("mp3kz")
            .setContentText("Reproduciendo...")
            .setPriority(androidx.core.app.NotificationCompat.PRIORITY_LOW)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        stopForeground(STOP_FOREGROUND_REMOVE)
    }
}