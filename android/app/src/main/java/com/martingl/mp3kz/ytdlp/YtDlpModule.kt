package com.martingl.mp3kz.ytdlp

import android.util.Log
import com.facebook.react.bridge.*
import com.yausername.youtubedl_android.YoutubeDL
import com.yausername.youtubedl_android.YoutubeDLRequest

class YtDlpModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "YtDlpModule"

    @ReactMethod
    fun updateYtDlp(promise: Promise) {
        Thread {
            try {
                val status = YoutubeDL.getInstance()
                    .updateYoutubeDL(reactApplicationContext)
                Log.d("YtDlpModule", "Update status: $status")
                promise.resolve(status.toString())
            } catch (e: Exception) {
                Log.e("YtDlpModule", "Update failed: ${e.message}")
                // No rechazar — si falla el update igual puede funcionar
                promise.resolve("update_failed")
            }
        }.start()
    }

    @ReactMethod
    fun getAudioUrl(videoId: String, promise: Promise) {
        Thread {
            try {
                val request = YoutubeDLRequest("https://www.youtube.com/watch?v=$videoId")
                request.addOption("-f", "bestaudio[ext=m4a]/bestaudio/best")
                request.addOption("--no-playlist")
                request.addOption("--get-url") 
                request.addOption("--extractor-args", "youtube:player_client=android,web")

                val response = YoutubeDL.getInstance().execute(request, null)
                val url = response.out.trim().lines().firstOrNull()

                if (url.isNullOrBlank()) {
                    promise.reject("ERROR", "No URL found")
                    return@Thread
                }

                promise.resolve(url)
            } catch (e: Exception) {
                promise.reject("ERROR", e.message ?: "Unknown error")
            }
        }.start()
    }
}