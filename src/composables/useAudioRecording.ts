/**
 * Audio Recording Composable
 * Manages the complete audio recording workflow with push-to-talk functionality
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { RecordingStatus, AudioFormat } from '@/types'
import { getAudioRecorder, cleanupAudioRecorder } from '@/services/audioRecorder'
import { getHttpClient } from '@/services/httpClient'
import type { TransmissionOptions } from '@/services/httpClient'

interface Configuration {
  endpoint: string
  audioFormat: AudioFormat
}

export function useAudioRecording(configuration: Configuration) {
  // Recording state
  const isRecording = ref(false)
  const isTransmitting = ref(false)
  const canRecord = ref(false)
  const recordingStatus = ref<RecordingStatus>('idle')
  const errorMessage = ref<string>('')

  // Services
  const audioRecorder = getAudioRecorder()
  const httpClient = getHttpClient()

  // Computed properties
  const isActive = computed(() => isRecording.value || isTransmitting.value)
  
  const statusText = computed(() => {
    if (errorMessage.value) return 'Error'
    if (isTransmitting.value) return 'Transmitting'
    if (isRecording.value) return 'Recording'
    if (!canRecord.value) return 'Unavailable'
    return 'Ready'
  })

  // Initialize audio recorder
  const initializeRecorder = async () => {
    try {
      // Don't initialize immediately - wait for user interaction
      canRecord.value = false
      recordingStatus.value = 'idle'
      errorMessage.value = ''
      console.log('Audio recorder ready for user interaction')
    } catch (error) {
      console.error('Failed to initialize audio recorder:', error)
      canRecord.value = false
      recordingStatus.value = 'error'
      errorMessage.value = error instanceof Error ? error.message : 'Failed to initialize microphone'
    }
  }

  // Request microphone permission and initialize
  const requestMicrophoneAccess = async () => {
    try {
      await audioRecorder.initialize()
      canRecord.value = true
      recordingStatus.value = 'idle'
      errorMessage.value = ''
      console.log('Microphone access granted and recorder initialized')
    } catch (error) {
      console.error('Failed to get microphone access:', error)
      canRecord.value = false
      recordingStatus.value = 'error'
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Permission denied') || error.message.includes('NotAllowedError')) {
          errorMessage.value = 'Microphone access denied. Please allow microphone access and try again.'
        } else if (error.message.includes('NotFoundError') || error.message.includes('not found')) {
          errorMessage.value = 'No microphone found. Please connect a microphone and try again.'
        } else if (error.message.includes('NotSupportedError')) {
          errorMessage.value = 'Microphone not supported by this browser.'
        } else {
          errorMessage.value = error.message
        }
      } else {
        errorMessage.value = 'Failed to access microphone'
      }
    }
  }

  // Start recording with automatic permission request
  const startRecording = async () => {
    if (isActive.value) {
      console.warn('Cannot start recording - already active')
      return
    }

    if (!configuration.endpoint) {
      setError('Endpoint not configured')
      return
    }

    // If not ready, request microphone access first
    if (!canRecord.value) {
      console.log('Requesting microphone access...')
      await requestMicrophoneAccess()
      
      // If still can't record after permission request, stop here
      if (!canRecord.value) {
        return
      }
    }

    try {
      clearError()
      isRecording.value = true
      recordingStatus.value = 'recording'
      
      await audioRecorder.startRecording(configuration.audioFormat)
      console.log('Recording started')
    } catch (error) {
      console.error('Failed to start recording:', error)
      isRecording.value = false
      recordingStatus.value = 'error'
      setError(error instanceof Error ? error.message : 'Failed to start recording')
    }
  }

  // Stop recording and transmit
  const stopRecording = async () => {
    if (!isRecording.value) {
      console.warn('Cannot stop recording - not currently recording')
      return
    }

    try {
      isRecording.value = false
      recordingStatus.value = 'transmitting'
      isTransmitting.value = true

      // Stop recording and get audio blob
      const audioBlob = await audioRecorder.stopRecording()
      console.log(`Recording stopped. Audio blob size: ${audioBlob.size} bytes`)

      // Prepare transmission options
      const transmissionOptions: TransmissionOptions = {
        endpoint: configuration.endpoint,
        audioFormat: configuration.audioFormat,
        filename: generateFilename(),
        additionalFields: {
          duration: 'unknown', // Could be calculated if needed
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      }

      // Send audio to endpoint
      const result = await httpClient.sendAudio(audioBlob, transmissionOptions)
      
      if (result.success) {
        recordingStatus.value = 'success'
        console.log('Audio transmitted successfully:', result.message)
        
        // Reset to idle after a short delay
        setTimeout(() => {
          if (recordingStatus.value === 'success') {
            recordingStatus.value = 'idle'
          }
        }, 2000)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Failed to stop recording or transmit:', error)
      recordingStatus.value = 'error'
      setError(error instanceof Error ? error.message : 'Failed to process recording')
    } finally {
      isTransmitting.value = false
    }
  }

  // Generate filename for audio file
  const generateFilename = (): string => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const extension = getFileExtension(configuration.audioFormat)
    return `push-to-talk_${timestamp}.${extension}`
  }

  // Get file extension for audio format
  const getFileExtension = (format: AudioFormat): string => {
    const extensionMap: Record<AudioFormat, string> = {
      'webm': 'webm',
      'mp3': 'mp3',
      'wav': 'wav',
      'ogg': 'ogg'
    }
    return extensionMap[format] || 'webm'
  }

  // Set error message and status
  const setError = (message: string) => {
    errorMessage.value = message
    recordingStatus.value = 'error'
    
    // Auto-clear error after 5 seconds
    setTimeout(() => {
      if (errorMessage.value === message) {
        clearError()
      }
    }, 5000)
  }

  // Clear error message
  const clearError = () => {
    errorMessage.value = ''
    if (recordingStatus.value === 'error') {
      recordingStatus.value = canRecord.value ? 'idle' : 'error'
    }
  }

  // Reset recording state
  const resetRecording = () => {
    if (isRecording.value) {
      audioRecorder.cleanup()
    }
    
    isRecording.value = false
    isTransmitting.value = false
    recordingStatus.value = canRecord.value ? 'idle' : 'error'
    clearError()
  }

  // Check recorder health
  const checkRecorderHealth = () => {
    const isReady = audioRecorder.isReady()
    const isMicActive = audioRecorder.isMicrophoneActive()
    
    if (!isReady || !isMicActive) {
      canRecord.value = false
      if (recordingStatus.value !== 'error') {
        setError('Microphone connection lost')
      }
    }
  }

  // Watch for configuration changes
  watch(() => configuration.endpoint, (newEndpoint) => {
    if (!newEndpoint && isActive.value) {
      resetRecording()
      setError('Endpoint configuration removed')
    }
  })

  watch(() => configuration.audioFormat, (newFormat) => {
    if (isRecording.value) {
      // Don't change format during recording, but log the change
      console.log('Audio format changed during recording, will apply to next recording:', newFormat)
    }
  })

  // Lifecycle management
  onMounted(() => {
    initializeRecorder()
    
    // Check recorder health periodically
    const healthCheckInterval = setInterval(checkRecorderHealth, 5000)
    
    // Cleanup interval on unmount
    onUnmounted(() => {
      clearInterval(healthCheckInterval)
    })
  })

  onUnmounted(() => {
    resetRecording()
    cleanupAudioRecorder()
  })

  // Handle page visibility changes (pause/resume)
  const handleVisibilityChange = () => {
    if (document.hidden && isRecording.value) {
      console.log('Page hidden during recording, stopping recording')
      stopRecording()
    }
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  // Keyboard shortcuts (optional)
  const handleKeyboardShortcuts = (event: KeyboardEvent) => {
    // Space bar for push-to-talk (when not in input fields)
    if (event.code === 'Space' && !isInputFocused()) {
      event.preventDefault()
      
      if (event.type === 'keydown' && !isRecording.value) {
        startRecording()
      } else if (event.type === 'keyup' && isRecording.value) {
        stopRecording()
      }
    }
  }

  const isInputFocused = (): boolean => {
    const activeElement = document.activeElement
    return activeElement?.tagName === 'INPUT' || 
           activeElement?.tagName === 'TEXTAREA' || 
           activeElement?.contentEditable === 'true'
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyboardShortcuts)
    document.addEventListener('keyup', handleKeyboardShortcuts)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyboardShortcuts)
    document.removeEventListener('keyup', handleKeyboardShortcuts)
  })

  return {
    // State
    isRecording,
    isTransmitting,
    canRecord,
    recordingStatus,
    errorMessage,
    
    // Computed
    isActive,
    statusText,
    
    // Actions
    startRecording,
    stopRecording,
    resetRecording,
    clearError,
    initializeRecorder,
    
    // Utils
    generateFilename,
    checkRecorderHealth,
    requestMicrophoneAccess
  }
}
