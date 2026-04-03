package com.martingl.mp3kz.newpipe

import com.facebook.react.bridge.*
import org.schabi.newpipe.extractor.NewPipe
import org.schabi.newpipe.extractor.ServiceList
import android.util.Log
import org.schabi.newpipe.extractor.services.youtube.YoutubeParsingHelper

class NewPipeModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        var initialized = false
    }

    init {
        if (!initialized) {
            NewPipe.init(HttpDownloader.getInstance())
            initialized = true
        }
    }

    override fun getName() = "NewPipeModule"

    @ReactMethod
    fun getAudioUrl(videoId: String, promise: Promise) {
        Thread {
            try {
                Log.d("NewPipeModule", "Iniciando extracción para: $videoId")

                YoutubeParsingHelper.setConsentAccepted(true)

                val extractor = ServiceList.YouTube
                    .getStreamExtractor("https://www.youtube.com/watch?v=$videoId")

                Log.d("NewPipeModule", "Haciendo fetchPage...")

                try {
                    extractor.fetchPage()
                } catch (e: Exception) {
                    Log.d("NewPipeModule", "Retry fetchPage...")
                    extractor.fetchPage()
                }

                Log.d("NewPipeModule", "fetchPage exitoso")

                val streams = extractor.audioStreams

                val url = streams
                    .filter { it.format != null }
                    .maxByOrNull { it.averageBitrate }
                    ?.content

                Log.d("NewPipeModule", "URL obtenida: $url")

                if (url != null) promise.resolve(url)
                else promise.reject("ERROR", "No audio stream found")

            } catch (e: Exception) {
                Log.e("NewPipeModule", "Error clase: ${e.javaClass.simpleName}")
                Log.e("NewPipeModule", "Error mensaje: ${e.message}")
                Log.e("NewPipeModule", "Causa: ${e.cause?.message}")
                promise.reject("ERROR", e.message)
            }
        }.start()
    }
}