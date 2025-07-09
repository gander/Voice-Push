/**
 * Audio Recording Composable
 * Manages the complete audio recording workflow with push-to-talk functionality
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { RecordingStatus, AudioFormat } from '@/types'
import { getAudioRecorder, cleanupAudioRecorder } from '@/services/audioRecorder'
import { getHttpClient } from '@/services/httpClient'
import type { TransmissionOptions } from '@/services/httpClient'
import { useLogger } from './useLogger'

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
  const logger = useLogger()

  // Computed properties
  const isActive = computed(() => isRecording.value || isTransmitting.value)
  
  const statusText = computed(() => {
    if (errorMessage.value) return 'Error'
    if (isTransmitting.value) return 'Transmitting'
    if (isRecording.value) return 'Recording'
    if (!canRecord.value) return 'Unavailable'
    return 'Ready'
  })

  // Check existing microphone permissions
  const checkMicrophonePermissions = async () => {
    try {
      logger.logDebug('Sprawdzanie uprawnień mikrofonu...')
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.query) {
        logger.logWarning('Permissions API nie jest obsługiwane')
        return false
      }

      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      logger.logDebug(`Status uprawnień mikrofonu: ${permission.state}`)
      
      if (permission.state === 'granted') {
        logger.logSuccess('Uprawnienia mikrofonu już przyznane')
        return true
      } else if (permission.state === 'denied') {
        logger.logWarning('Uprawnienia mikrofonu odrzucone przez użytkownika')
        return false
      } else {
        logger.logInfo('Uprawnienia mikrofonu wymagają akcji użytkownika')
        return false
      }
    } catch (error) {
      logger.logDebug('Nie można sprawdzić uprawnień - prawdopodobnie nie obsługiwane', error)
      return false
    }
  }

  // Initialize audio recorder
  const initializeRecorder = async () => {
    try {
      logger.logInitialization('Audio Recorder')
      
      // Check if permissions already granted
      const hasPermissions = await checkMicrophonePermissions()
      
      if (hasPermissions) {
        // Try to initialize immediately if permissions are granted
        try {
          await audioRecorder.initialize()
          canRecord.value = true
          recordingStatus.value = 'idle'
          errorMessage.value = ''
          logger.logSuccess('Audio recorder zainicjalizowany z istniejącymi uprawnieniami')
          return
        } catch (error) {
          logger.logWarning('Błąd inicjalizacji mimo uprawnień - może mikrofon jest zajęty', error)
        }
      }
      
      // If no permissions, try to request them automatically
      logger.logInfo('Automatyczne żądanie uprawnień do mikrofonu...')
      await requestMicrophoneAccess()
      
    } catch (error) {
      logger.logError('Błąd inicjalizacji audio recorder', error)
      canRecord.value = false
      recordingStatus.value = 'error'
      errorMessage.value = error instanceof Error ? error.message : 'Failed to initialize microphone'
    }
  }

  // Request microphone permission and initialize
  const requestMicrophoneAccess = async () => {
    try {
      logger.logPermissionRequest()
      await audioRecorder.initialize()
      canRecord.value = true
      recordingStatus.value = 'idle'
      errorMessage.value = ''
      logger.logPermissionGranted()
    } catch (error) {
      logger.logPermissionDenied()
      logger.logError('Błąd dostępu do mikrofonu', error)
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
      logger.logWarning('Nie można rozpocząć nagrywania - aplikacja już aktywna')
      return
    }

    if (!configuration.endpoint) {
      logger.logError('Brak skonfigurowanego endpointu')
      setError('Endpoint not configured')
      return
    }

    // If not ready, request microphone access first
    if (!canRecord.value) {
      logger.logInfo('Żądanie dostępu do mikrofonu przed nagrywaniem...')
      await requestMicrophoneAccess()
      
      // If still can't record after permission request, stop here
      if (!canRecord.value) {
        logger.logError('Nie można rozpocząć nagrywania - brak uprawnień do mikrofonu')
        setError('Microphone access required')
        return
      }
    }

    try {
      clearError()
      isRecording.value = true
      recordingStatus.value = 'recording'
      logger.logRecorderState('recording')
      
      await audioRecorder.startRecording(configuration.audioFormat)
      logger.logRecordingStart(configuration.audioFormat)
    } catch (error) {
      logger.logError('Błąd rozpoczęcia nagrywania', error)
      isRecording.value = false
      recordingStatus.value = 'error'
      
      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes('Permission denied') || error.message.includes('NotAllowedError')) {
          setError('Microphone access denied. Please click "Ustaw mikrofon" button to grant permissions.')
        } else if (error.message.includes('NotFoundError')) {
          setError('No microphone found. Please connect a microphone and try again.')
        } else {
          setError(error.message)
        }
      } else {
        setError('Failed to start recording')
      }
    }
  }

  // Stop recording and transmit
  const stopRecording = async () => {
    if (!isRecording.value) {
      logger.logWarning('Nie można zatrzymać nagrywania - nagrywanie nie jest aktywne')
      return
    }

    const recordingStartTime = Date.now()
    
    try {
      isRecording.value = false
      recordingStatus.value = 'transmitting'
      isTransmitting.value = true
      logger.logRecorderState('transmitting')

      // Stop recording and get audio blob
      const audioBlob = await audioRecorder.stopRecording()
      const recordingDuration = (Date.now() - recordingStartTime) / 1000
      logger.logRecordingStop(recordingDuration, audioBlob.size)

      // Prepare transmission options
      const transmissionOptions: TransmissionOptions = {
        endpoint: configuration.endpoint,
        audioFormat: configuration.audioFormat,
        filename: generateFilename(),
        additionalFields: {
          duration: recordingDuration.toFixed(1),
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      }

      // Send audio to endpoint
      logger.logTransmissionStart(configuration.endpoint)
      const result = await httpClient.sendAudio(audioBlob, transmissionOptions)
      
      if (result.success) {
        recordingStatus.value = 'success'
        logger.logTransmissionSuccess(configuration.endpoint, result)
        
        // Reset to idle after a short delay
        setTimeout(() => {
          if (recordingStatus.value === 'success') {
            recordingStatus.value = 'idle'
            logger.logRecorderState('idle')
          }
        }, 2000)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      logger.logTransmissionError(configuration.endpoint, error)
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
           (activeElement as HTMLElement)?.contentEditable === 'true'
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
    requestMicrophoneAccess,
    checkMicrophonePermissions
  }
}
