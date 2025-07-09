/**
 * Audio Recording Service
 * Handles MediaRecorder API for audio recording with configurable formats
 */

import type { AudioFormat } from '@/types'
import { getMimeType } from '@/utils/mimeTypes'

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null
  private recordingStartTime: number = 0

  /**
   * Initialize the audio recorder with user media access
   */
  async initialize(): Promise<void> {
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser')
      }

      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      })
      
      console.log('Microphone stream initialized successfully')
    } catch (error: any) {
      console.error('Failed to initialize audio recorder:', error)
      
      // Provide specific error messages based on error type
      if (error.name === 'NotAllowedError') {
        throw new Error('Permission denied - microphone access was blocked')
      } else if (error.name === 'NotFoundError') {
        throw new Error('NotFoundError - no microphone device found')
      } else if (error.name === 'NotSupportedError') {
        throw new Error('NotSupportedError - microphone not supported by this browser')
      } else if (error.name === 'NotReadableError') {
        throw new Error('NotReadableError - microphone is being used by another application')
      } else if (error.name === 'OverconstrainedError') {
        throw new Error('OverconstrainedError - microphone constraints cannot be satisfied')
      } else {
        throw new Error(`Microphone access failed: ${error.message || 'Unknown error'}`)
      }
    }
  }

  /**
   * Check if the recorder is ready to record
   */
  isReady(): boolean {
    return this.stream !== null
  }

  /**
   * Start recording audio with specified format
   */
  async startRecording(format: AudioFormat): Promise<void> {
    if (!this.stream) {
      throw new Error('Audio recorder not initialized')
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      throw new Error('Already recording')
    }

    const mimeType = getMimeType(format)
    
    // Check if the format is supported
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      throw new Error(`Audio format ${format} (${mimeType}) is not supported by this browser`)
    }

    try {
      this.audioChunks = []
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        audioBitsPerSecond: this.getOptimalBitrate(format)
      })

      this.setupRecorderEvents()
      this.mediaRecorder.start(100) // Collect data every 100ms
      this.recordingStartTime = Date.now()

      console.log(`Started recording in ${format} format (${mimeType})`)
    } catch (error) {
      console.error('Failed to start recording:', error)
      throw new Error(`Failed to start recording: ${error}`)
    }
  }

  /**
   * Stop recording and return the audio blob
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'))
        return
      }

      if (this.mediaRecorder.state === 'inactive') {
        reject(new Error('Recording not active'))
        return
      }

      const recordingDuration = Date.now() - this.recordingStartTime

      // Set up one-time event listener for when recording stops
      this.mediaRecorder.addEventListener('stop', () => {
        if (this.audioChunks.length === 0) {
          reject(new Error('No audio data recorded'))
          return
        }

        const audioBlob = new Blob(this.audioChunks, { 
          type: this.mediaRecorder?.mimeType || 'audio/webm' 
        })

        console.log(`Recording stopped. Duration: ${recordingDuration}ms, Size: ${audioBlob.size} bytes`)
        resolve(audioBlob)
      }, { once: true })

      // Set up error handler
      this.mediaRecorder.addEventListener('error', (event) => {
        console.error('MediaRecorder error:', event)
        reject(new Error('Recording failed'))
      }, { once: true })

      this.mediaRecorder.stop()
    })
  }

  /**
   * Get the current recording state
   */
  getState(): string {
    return this.mediaRecorder?.state || 'inactive'
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.mediaRecorder) {
      if (this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop()
      }
      this.mediaRecorder = null
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }

    this.audioChunks = []
  }

  /**
   * Check if microphone is currently active
   */
  isMicrophoneActive(): boolean {
    return this.stream?.getAudioTracks().some(track => track.enabled && track.readyState === 'live') || false
  }

  /**
   * Set up MediaRecorder event handlers
   */
  private setupRecorderEvents(): void {
    if (!this.mediaRecorder) return

    this.mediaRecorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data)
      }
    })

    this.mediaRecorder.addEventListener('error', (event) => {
      console.error('MediaRecorder error:', event)
    })

    this.mediaRecorder.addEventListener('start', () => {
      console.log('MediaRecorder started')
    })

    this.mediaRecorder.addEventListener('stop', () => {
      console.log('MediaRecorder stopped')
    })
  }

  /**
   * Get optimal bitrate for the given format
   */
  private getOptimalBitrate(format: AudioFormat): number {
    const bitrateMap: Record<AudioFormat, number> = {
      'webm': 128000,  // 128 kbps
      'mp3': 128000,   // 128 kbps
      'wav': 1411200,  // 1411.2 kbps (CD quality)
      'ogg': 128000    // 128 kbps
    }

    return bitrateMap[format] || 128000
  }
}

// Singleton instance
let audioRecorderInstance: AudioRecorder | null = null

export const getAudioRecorder = (): AudioRecorder => {
  if (!audioRecorderInstance) {
    audioRecorderInstance = new AudioRecorder()
  }
  return audioRecorderInstance
}

export const cleanupAudioRecorder = (): void => {
  if (audioRecorderInstance) {
    audioRecorderInstance.cleanup()
    audioRecorderInstance = null
  }
}
