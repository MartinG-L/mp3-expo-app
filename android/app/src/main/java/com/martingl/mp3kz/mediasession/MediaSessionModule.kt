package com.martingl.mp3kz.mediasession

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.os.Build
import android.support.v4.media.MediaMetadataCompat
import android.support.v4.media.session.MediaSessionCompat
import android.support.v4.media.session.PlaybackStateCompat
import androidx.core.app.NotificationCompat
import androidx.media.app.NotificationCompat.MediaStyle
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.net.URL
import android.graphics.Bitmap
import kotlin.math.min
import android.os.SystemClock

class MediaSessionModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val CHANNEL_ID = "mp3kz_playback"
    private val NOTIFICATION_ID = 1
    private var mediaSession: MediaSessionCompat? = null
    private var notificationManager: NotificationManager? = null
    var currentIsPlaying: Boolean = false
    var isLoading: Boolean = false
    var currentPositionMs: Long = 0
    var justSeeked: Boolean = false

    // singleton para que MediaButtonReceiver pueda acceder
    companion object {
        var instance: MediaSessionModule? = null
    }

    init {
        instance = this
    }

    override fun getName() = "MediaSessionModule"

    private fun ensureChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Reproducción de audio",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                setShowBadge(false)
                setSound(null, null)
            }
            notificationManager?.createNotificationChannel(channel)
        }
    }

    private fun ensureMediaSession() {
        if (mediaSession != null) return
        notificationManager = reactApplicationContext
            .getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        ensureChannel()

        mediaSession = MediaSessionCompat(reactApplicationContext, "mp3kz").apply {
            setCallback(object : MediaSessionCompat.Callback() {
                override fun onPlay() {
                    updatePlaybackState(true)
                    sendEvent("onPlay", null)
                }
                override fun onPause() {
                    updatePlaybackState(false)
                    sendEvent("onPause", null)
                }
                override fun onSkipToNext() { sendEvent("onNext", null) }
                override fun onSkipToPrevious() { sendEvent("onPrevious", null) }
                override fun onSeekTo(pos: Long) {
                    val params = Arguments.createMap().apply { 
                        putDouble("position", pos / 1000.0) 
                    }
                    justSeeked = true
                    currentPositionMs = pos
                    updatePlaybackStateWithPosition(pos) 
                    sendEvent("onSeek", params)
                }
            })
            setFlags(
                MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS or
                MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS
            )
            isActive = true
        }
        startForegroundService()

    }

    fun buildNotification(isPlaying: Boolean): android.app.Notification {
        val token = mediaSession?.sessionToken!!
        val openAppIntent = reactApplicationContext.packageManager
            .getLaunchIntentForPackage(reactApplicationContext.packageName)
        val openAppPendingIntent = PendingIntent.getActivity(
            reactApplicationContext,
            0,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        return NotificationCompat.Builder(reactApplicationContext, CHANNEL_ID)
            .setContentIntent(openAppPendingIntent)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setStyle(
                MediaStyle()
                    .setMediaSession(token)
                    .setShowActionsInCompactView(0, 1, 2)
            )
            .addAction(android.R.drawable.ic_media_previous, "Anterior",
                createPendingIntent("PREVIOUS"))
            .addAction(
                if (isPlaying) android.R.drawable.ic_media_pause
                else android.R.drawable.ic_media_play,
                if (isPlaying) "Pausar" else "Reproducir",
                createPendingIntent("PLAY_PAUSE")
            )
            .addAction(android.R.drawable.ic_media_next, "Siguiente",
                createPendingIntent("NEXT"))
            .build()
    }

    private fun startForegroundService() {
        val intent = Intent(reactApplicationContext, MediaSessionService::class.java).apply {
            action = "START"
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactApplicationContext.startForegroundService(intent)
        } else {
            reactApplicationContext.startService(intent)
        }
    }

    // llamado desde MediaButtonReceiver
    fun handlePlayPause() {
        android.util.Log.d("MP3KZ", "handlePlayPause: currentIsPlaying=$currentIsPlaying")
        val isPlaying = currentIsPlaying
        updatePlaybackState(!isPlaying)
        sendEvent(if (isPlaying) "onPause" else "onPlay", null)
    }

    fun handleNext() {
        sendEvent("onNext", null)
    }

    fun handlePrevious() {
        sendEvent("onPrevious", null)
    }

    @ReactMethod
    fun updatePosition(position: Double, promise: Promise) {
        try {
            currentPositionMs = (position * 1000).toLong()
            updatePlaybackStateWithPosition(currentPositionMs)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun destroy(promise: Promise) {
        try {
            mediaSession?.release()
            mediaSession = null
            notificationManager?.cancel(NOTIFICATION_ID)
            
            val intent = Intent(reactApplicationContext, MediaSessionService::class.java)
            reactApplicationContext.stopService(intent)
            
            instance = null
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    fun updatePlaybackState(isPlaying: Boolean) {
        currentIsPlaying = isPlaying

        val state = if (isPlaying)
            PlaybackStateCompat.STATE_PLAYING
        else
            PlaybackStateCompat.STATE_PAUSED

        val playbackState = PlaybackStateCompat.Builder()
            .setState(
                state,
                currentPositionMs, // pos actual
                if (isPlaying) 1f else 0f,
                SystemClock.elapsedRealtime()
            )
            .setActions(
                PlaybackStateCompat.ACTION_PLAY or
                PlaybackStateCompat.ACTION_PAUSE or
                PlaybackStateCompat.ACTION_SKIP_TO_NEXT or
                PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS or
                PlaybackStateCompat.ACTION_SEEK_TO
            )
            .build()

        mediaSession?.setPlaybackState(playbackState)
        showNotification(isPlaying)
    }

    private fun updatePlaybackStateWithPosition(posMs: Long) {
        currentPositionMs = posMs

        val state = if (currentIsPlaying)
            PlaybackStateCompat.STATE_PLAYING
        else
            PlaybackStateCompat.STATE_PAUSED

        val playbackState = PlaybackStateCompat.Builder()
            .setState(state, currentPositionMs, if (currentIsPlaying) 1f else 0f, SystemClock.elapsedRealtime()) 
            .setActions(
                PlaybackStateCompat.ACTION_PLAY or
                PlaybackStateCompat.ACTION_PAUSE or
                PlaybackStateCompat.ACTION_SKIP_TO_NEXT or
                PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS or
                PlaybackStateCompat.ACTION_SEEK_TO
            )
            .build()

        mediaSession?.setPlaybackState(playbackState)
    }

    fun sendEvent(name: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(name, params)
    }

    @ReactMethod
    fun showLoading(promise: Promise) {
        try {
            ensureMediaSession()
            isLoading = true
            currentPositionMs = 0 
            justSeeked = false 
            val metadata = MediaMetadataCompat.Builder()
                .putString(MediaMetadataCompat.METADATA_KEY_TITLE, "Cargando...")
                .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, " ")
                .build()
            mediaSession?.setMetadata(metadata)
            updatePlaybackState(false)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun updateMetadata(title: String, thumbnail: String, duration: Double, promise: Promise) {

        Thread {
            try {
                val bitmap = if (thumbnail.isNotEmpty()) {
                    val original = BitmapFactory.decodeStream(URL(thumbnail).openStream())

                    // recortar a cuadrado
                    val size = minOf(original.width, original.height)
                    val x = (original.width - size) / 2
                    val y = (original.height - size) / 2

                    val square = Bitmap.createBitmap(original, x, y, size, size)

                    Bitmap.createScaledBitmap(square, 512, 512, true)

                } else null

                val handler = android.os.Handler(android.os.Looper.getMainLooper())
                handler.post {
                    try {
                        ensureMediaSession()

                        val metadata = MediaMetadataCompat.Builder()
                            .putString(MediaMetadataCompat.METADATA_KEY_TITLE, title)
                            .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, " ") 
                            .putLong(MediaMetadataCompat.METADATA_KEY_DURATION, (duration * 1000).toLong())
                            .apply {
                                bitmap?.let {
                                    putBitmap(MediaMetadataCompat.METADATA_KEY_ART, it)
                                    putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, it)
                                }
                            }
                            .build()

                        mediaSession?.setMetadata(metadata)
                        isLoading = false
                        showNotification(currentIsPlaying)
                        promise.resolve(null)

                    } catch (e: Exception) {
                        promise.reject("ERROR", e.message)
                    }
                }

            } catch (e: Exception) {
                promise.reject("ERROR", e.message)
            }
        }.start()
    }
    @ReactMethod
    fun updateState(isPlaying: Boolean, promise: Promise) {
        try {
            ensureMediaSession()
            if (justSeeked) {
                justSeeked = false
                promise.resolve(null)
                return 
            }
            updatePlaybackState(isPlaying)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    private fun showNotification(isPlaying: Boolean) {
        val token = mediaSession?.sessionToken ?: return

        val openAppIntent = reactApplicationContext.packageManager
            .getLaunchIntentForPackage(reactApplicationContext.packageName)

        val openAppPendingIntent = PendingIntent.getActivity(
            reactApplicationContext,
            0,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(reactApplicationContext, CHANNEL_ID)
            .setContentIntent(openAppPendingIntent)
            .setSmallIcon(
                if (isLoading) android.R.drawable.ic_popup_sync
                else android.R.drawable.ic_media_play
            ) 
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOnlyAlertOnce(true)
            .setStyle(
                MediaStyle()
                    .setMediaSession(token)
                    .setShowActionsInCompactView(0, 1, 2)
            )
            .addAction(
                android.R.drawable.ic_media_previous,
                "Anterior",
                createPendingIntent("PREVIOUS")
            )
            .addAction(
                if (isPlaying) android.R.drawable.ic_media_pause
                else android.R.drawable.ic_media_play,
                if (isPlaying) "Pausar" else "Reproducir",
                createPendingIntent("PLAY_PAUSE")
            )
            .addAction(
                android.R.drawable.ic_media_next,
                "Siguiente",
                createPendingIntent("NEXT")
            )
            .build()

        notificationManager?.notify(NOTIFICATION_ID, notification)
    }

    private fun createPendingIntent(action: String): PendingIntent {
        val intent = Intent(reactApplicationContext, MediaSessionService::class.java).apply {
            this.action = action
        }
        return PendingIntent.getService(
            reactApplicationContext, action.hashCode(), intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}
}