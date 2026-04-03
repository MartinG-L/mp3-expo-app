package com.martingl.mp3kz.newpipe

import okhttp3.OkHttpClient
import org.schabi.newpipe.extractor.downloader.Downloader
import org.schabi.newpipe.extractor.downloader.Request
import org.schabi.newpipe.extractor.downloader.Response
import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl
import java.util.concurrent.TimeUnit
import java.util.HashMap
import okhttp3.RequestBody.Companion.toRequestBody

class HttpDownloader private constructor() : Downloader() {

    private val client = OkHttpClient.Builder()
    .cookieJar(object : CookieJar {

        private val cookieStore = HashMap<String, List<Cookie>>()

        override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
            cookieStore[url.host] = cookies
        }

        override fun loadForRequest(url: HttpUrl): List<Cookie> {
            val cookies = mutableListOf<Cookie>()

            cookies.addAll(cookieStore[url.host] ?: emptyList())

            if (url.host.contains("youtube.com")) {
                cookies.add(
                    Cookie.Builder()
                        .name("CONSENT")
                        .value("YES+1")
                        .domain("youtube.com")
                        .path("/")
                        .build()
                )

                cookies.add(
                    Cookie.Builder()
                        .name("SOCS")
                        .value("CAI")
                        .domain("youtube.com")
                        .path("/")
                        .build()
                )
            }

            return cookies
        }
    })

    .addInterceptor { chain ->
        chain.proceed(
            chain.request().newBuilder()
                .header(
                    "User-Agent",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                )
                .header("Accept-Language", "en-US,en;q=0.9")
                .header("Connection", "keep-alive")
                .build()
        )
    }
    .followRedirects(true)
    .followSslRedirects(true)
    .connectTimeout(30, TimeUnit.SECONDS)
    .readTimeout(30, TimeUnit.SECONDS)
    .build()

    companion object {
        private var instance: HttpDownloader? = null
        fun getInstance(): HttpDownloader {
            if (instance == null) instance = HttpDownloader()
            return instance!!
        }
    }

    override fun execute(request: Request): Response {
        val reqBuilder = okhttp3.Request.Builder().url(request.url())
        request.headers().forEach { (key, values) ->
            values.forEach { reqBuilder.addHeader(key, it) }
        }
        if (request.dataToSend() != null) {
            reqBuilder.post(
                request.dataToSend()!!.toRequestBody(null)
            )
        }
        val res = client.newCall(reqBuilder.build()).execute()
        return Response(res.code, res.message, res.headers.toMultimap(), res.body?.string(), request.url())
    }
}