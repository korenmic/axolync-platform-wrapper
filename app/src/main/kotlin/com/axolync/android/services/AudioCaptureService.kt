package com.axolync.android.services

import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.util.Log
import java.nio.ByteBuffer
import java.nio.ByteOrder
import kotlin.concurrent.thread

/**
 * AudioCaptureService captures audio from device microphone and delivers to web application.
 * Handles low-latency audio capture using AudioRecord API.
 * 
 * Audio Configuration:
 * - Sample Rate: 44.1kHz
 * - Channel: Mono
 * - Internal Format: 16-bit PCM
 * - Output Format: Float32Array normalized to [-1, 1]
 */
class AudioCaptureService {

    private var audioRecord: AudioRecord? = null
    private var captureThread: Thread? = null
    private var isCapturing = false
    private var audioCallback: ((FloatArray) -> Unit)? = null
    
    companion object {
        private const val TAG = "AudioCaptureService"
        private const val DEFAULT_SAMPLE_RATE = 44100
        private const val DEFAULT_CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO
        private const val DEFAULT_AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT
        private const val BUFFER_SIZE_MULTIPLIER = 2
    }

    /**
     * Start audio capture from device microphone.
     * 
     * @param sampleRate Sample rate in Hz (default: 44100)
     * @param channelConfig Channel configuration (default: MONO)
     * @param audioFormat Audio format (default: 16-bit PCM)
     * @return Result indicating success or failure with error message
     */
    fun startCapture(
        sampleRate: Int = DEFAULT_SAMPLE_RATE,
        channelConfig: Int = DEFAULT_CHANNEL_CONFIG,
        audioFormat: Int = DEFAULT_AUDIO_FORMAT
    ): Result<Unit> {
        if (isCapturing) {
            return Result.failure(IllegalStateException("Audio capture already in progress"))
        }

        try {
            // Calculate buffer size with 2x multiplier for stability
            val minBufferSize = AudioRecord.getMinBufferSize(sampleRate, channelConfig, audioFormat)
            if (minBufferSize == AudioRecord.ERROR || minBufferSize == AudioRecord.ERROR_BAD_VALUE) {
                return Result.failure(IllegalStateException("Failed to get minimum buffer size"))
            }
            
            val bufferSize = minBufferSize * BUFFER_SIZE_MULTIPLIER
            
            // Initialize AudioRecord
            audioRecord = AudioRecord(
                MediaRecorder.AudioSource.MIC,
                sampleRate,
                channelConfig,
                audioFormat,
                bufferSize
            )
            
            if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
                audioRecord?.release()
                audioRecord = null
                return Result.failure(IllegalStateException("AudioRecord initialization failed"))
            }
            
            // Start recording
            audioRecord?.startRecording()
            isCapturing = true
            
            // Start capture loop on background thread
            captureThread = thread(start = true, name = "AudioCaptureThread") {
                captureLoop(bufferSize)
            }
            
            Log.d(TAG, "Audio capture started: sampleRate=$sampleRate, bufferSize=$bufferSize")
            return Result.success(Unit)
            
        } catch (e: SecurityException) {
            Log.e(TAG, "Security exception: Microphone permission not granted", e)
            return Result.failure(e)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start audio capture", e)
            audioRecord?.release()
            audioRecord = null
            return Result.failure(e)
        }
    }

    /**
     * Stop audio capture and release resources.
     */
    fun stopCapture() {
        if (!isCapturing) {
            return
        }
        
        isCapturing = false
        
        try {
            // Stop recording
            audioRecord?.stop()
            
            // Wait for capture thread to finish
            captureThread?.join(1000)
            
            // Release audio resources
            audioRecord?.release()
            audioRecord = null
            captureThread = null
            
            Log.d(TAG, "Audio capture stopped")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping audio capture", e)
        }
    }

    /**
     * Check if audio capture is currently active.
     */
    fun isCapturing(): Boolean = isCapturing

    /**
     * Set callback for receiving audio chunks.
     * 
     * @param callback Function that receives Float32Array audio data normalized to [-1, 1]
     */
    fun setAudioCallback(callback: (FloatArray) -> Unit) {
        this.audioCallback = callback
    }

    /**
     * Capture loop running on dedicated background thread.
     * Reads audio data from AudioRecord and delivers chunks via callback.
     */
    private fun captureLoop(bufferSize: Int) {
        val buffer = ByteArray(bufferSize)
        
        Log.d(TAG, "Capture loop started")
        
        while (isCapturing) {
            try {
                val bytesRead = audioRecord?.read(buffer, 0, buffer.size) ?: 0
                
                if (bytesRead > 0) {
                    // Convert PCM 16-bit to Float32Array normalized to [-1, 1]
                    val floatArray = pcm16ToFloat32(buffer, bytesRead)
                    
                    // Deliver chunk via callback
                    audioCallback?.invoke(floatArray)
                } else if (bytesRead < 0) {
                    Log.e(TAG, "Error reading audio data: $bytesRead")
                    break
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error in capture loop", e)
                break
            }
        }
        
        Log.d(TAG, "Capture loop ended")
    }

    /**
     * Convert PCM 16-bit byte array to Float32Array normalized to [-1, 1].
     * 
     * @param pcmData Raw PCM 16-bit data as ByteArray
     * @param length Number of bytes to convert
     * @return FloatArray with values normalized to [-1, 1]
     */
    private fun pcm16ToFloat32(pcmData: ByteArray, length: Int): FloatArray {
        // Each sample is 2 bytes (16-bit)
        val sampleCount = length / 2
        val floatArray = FloatArray(sampleCount)
        
        // Create ByteBuffer for efficient conversion
        val byteBuffer = ByteBuffer.wrap(pcmData, 0, length)
        byteBuffer.order(ByteOrder.LITTLE_ENDIAN)
        
        // Convert each 16-bit sample to float normalized to [-1, 1]
        for (i in 0 until sampleCount) {
            val sample = byteBuffer.short.toInt()
            // Normalize: 16-bit signed int range is -32768 to 32767
            floatArray[i] = sample / 32768.0f
        }
        
        return floatArray
    }
}
