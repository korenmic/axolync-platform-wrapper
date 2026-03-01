package com.axolync.android.services

import android.util.Log
import kotlin.concurrent.thread
import kotlin.math.sin
import kotlin.math.PI

/**
 * FakeAudioCaptureService provides simulated audio capture for testing and automation.
 * Generates synthetic audio data instead of capturing from microphone.
 * 
 * Requirements: 9.1, 9.2, 9.3
 */
class FakeAudioCaptureService {

    private var captureThread: Thread? = null
    private var isCapturing = false
    private var audioCallback: ((FloatArray) -> Unit)? = null
    
    companion object {
        private const val TAG = "FakeAudioCaptureService"
        private const val DEFAULT_SAMPLE_RATE = 44100
        private const val CHUNK_SIZE = 4096 // Samples per chunk
        private const val CHUNK_INTERVAL_MS = 93L // ~93ms per chunk at 44.1kHz
    }

    enum class AudioPattern {
        SINE_WAVE,      // Pure sine wave at 440Hz (A4 note)
        SILENCE,        // All zeros
        WHITE_NOISE,    // Random noise
        CHIRP           // Frequency sweep
    }

    private var currentPattern = AudioPattern.SINE_WAVE
    private var sampleIndex = 0

    /**
     * Start fake audio capture.
     * Requirements: 9.1, 9.2
     */
    fun startCapture(
        pattern: AudioPattern = AudioPattern.SINE_WAVE,
        sampleRate: Int = DEFAULT_SAMPLE_RATE
    ): Result<Unit> {
        if (isCapturing) {
            return Result.failure(IllegalStateException("Fake audio capture already in progress"))
        }

        try {
            currentPattern = pattern
            sampleIndex = 0
            isCapturing = true
            
            // Start capture loop on background thread
            captureThread = thread(start = true, name = "FakeAudioCaptureThread") {
                captureLoop(sampleRate)
            }
            
            Log.d(TAG, "Fake audio capture started with pattern: $pattern")
            return Result.success(Unit)
            
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start fake audio capture", e)
            return Result.failure(e)
        }
    }

    /**
     * Stop fake audio capture.
     * Requirements: 9.1
     */
    fun stopCapture() {
        if (!isCapturing) {
            return
        }
        
        isCapturing = false
        
        try {
            // Wait for capture thread to finish
            captureThread?.join(1000)
            captureThread = null
            
            Log.d(TAG, "Fake audio capture stopped")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping fake audio capture", e)
        }
    }

    /**
     * Check if fake audio capture is currently active.
     */
    fun isCapturing(): Boolean = isCapturing

    /**
     * Set callback for receiving audio chunks.
     * Requirements: 9.2
     */
    fun setAudioCallback(callback: (FloatArray) -> Unit) {
        this.audioCallback = callback
    }

    /**
     * Set audio pattern for testing different scenarios.
     * Requirements: 9.3
     */
    fun setPattern(pattern: AudioPattern) {
        currentPattern = pattern
        sampleIndex = 0
    }

    /**
     * Capture loop that generates synthetic audio data.
     * Requirements: 9.1, 9.2, 9.3
     */
    private fun captureLoop(sampleRate: Int) {
        Log.d(TAG, "Fake capture loop started")
        
        while (isCapturing) {
            try {
                // Generate audio chunk based on current pattern
                val audioChunk = generateAudioChunk(sampleRate, CHUNK_SIZE)
                
                // Deliver chunk via callback
                audioCallback?.invoke(audioChunk)
                
                // Sleep to simulate real-time audio capture
                Thread.sleep(CHUNK_INTERVAL_MS)
                
            } catch (e: InterruptedException) {
                Log.d(TAG, "Fake capture loop interrupted")
                break
            } catch (e: Exception) {
                Log.e(TAG, "Error in fake capture loop", e)
                break
            }
        }
        
        Log.d(TAG, "Fake capture loop ended")
    }

    /**
     * Generate synthetic audio data based on current pattern.
     * Requirements: 9.3
     */
    private fun generateAudioChunk(sampleRate: Int, chunkSize: Int): FloatArray {
        val chunk = FloatArray(chunkSize)
        
        when (currentPattern) {
            AudioPattern.SINE_WAVE -> {
                // Generate 440Hz sine wave (A4 note)
                val frequency = 440.0
                for (i in 0 until chunkSize) {
                    val time = (sampleIndex + i).toDouble() / sampleRate
                    chunk[i] = (0.5 * sin(2.0 * PI * frequency * time)).toFloat()
                }
            }
            
            AudioPattern.SILENCE -> {
                // All zeros
                chunk.fill(0.0f)
            }
            
            AudioPattern.WHITE_NOISE -> {
                // Random noise between -0.5 and 0.5
                for (i in 0 until chunkSize) {
                    chunk[i] = (Math.random().toFloat() - 0.5f)
                }
            }
            
            AudioPattern.CHIRP -> {
                // Frequency sweep from 200Hz to 2000Hz over 10 seconds
                val startFreq = 200.0
                val endFreq = 2000.0
                val duration = 10.0 // seconds
                
                for (i in 0 until chunkSize) {
                    val time = (sampleIndex + i).toDouble() / sampleRate
                    val progress = (time % duration) / duration
                    val frequency = startFreq + (endFreq - startFreq) * progress
                    chunk[i] = (0.5 * sin(2.0 * PI * frequency * time)).toFloat()
                }
            }
        }
        
        sampleIndex += chunkSize
        return chunk
    }
}
