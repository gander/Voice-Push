/**
 * Configuration Management Composable
 * Handles endpoint and audio format configuration with environment variable fallback
 */

import { ref, computed, watch } from 'vue'
import type { AudioFormat } from '@/types'
import { useLogger } from './useLogger'

// Configuration state
const endpoint = ref<string>('')
const audioFormat = ref<AudioFormat>('webm')
const showConfiguration = ref<boolean>(false)

// Check if configuration is provided via environment variables
const hasEnvEndpoint = !!(import.meta.env.VITE_ENDPOINT_URL)
const hasEnvAudioFormat = !!(import.meta.env.VITE_AUDIO_FORMAT)

export function useConfiguration() {
  const logger = useLogger()
  
  // Initialize configuration from environment variables or defaults
  const initializeConfiguration = () => {
    // Set endpoint from environment variable or empty string
    endpoint.value = import.meta.env.VITE_ENDPOINT_URL || ''
    
    // Set audio format from environment variable or default to webm
    const envFormat = import.meta.env.VITE_AUDIO_FORMAT as AudioFormat
    audioFormat.value = envFormat || 'webm'
    
    // Log configuration initialization
    if (endpoint.value) {
      logger.logInfo(`Endpoint załadowany z env: ${endpoint.value}`)
    }
    if (envFormat) {
      logger.logInfo(`Format audio załadowany z env: ${envFormat}`)
    }
    
    // Configuration panel is hidden by default - user can open it manually
    showConfiguration.value = false
    logger.logInfo('Panel konfiguracji ukryty domyślnie')
  }

  // Configuration object for reactive access
  const configuration = computed(() => ({
    endpoint: endpoint.value,
    audioFormat: audioFormat.value
  }))

  // Check if configuration is valid
  const isConfigurationValid = computed(() => {
    return endpoint.value.trim() !== '' && !!audioFormat.value
  })

  // Check if configuration is complete (both endpoint and format are set)
  const isConfigurationComplete = computed(() => {
    try {
      // Validate endpoint URL
      if (!endpoint.value) return false
      new URL(endpoint.value)
      
      // Validate audio format
      const validFormats: AudioFormat[] = ['webm', 'mp3', 'wav', 'ogg']
      return validFormats.includes(audioFormat.value)
    } catch {
      return false
    }
  })

  // Environment variable status
  const environmentStatus = computed(() => ({
    hasEnvEndpoint,
    hasEnvAudioFormat,
    hasAnyEnvConfig: hasEnvEndpoint || hasEnvAudioFormat
  }))

  // Update endpoint
  const updateEndpoint = (newEndpoint: string) => {
    try {
      // Validate URL format
      new URL(newEndpoint)
      endpoint.value = newEndpoint
      
      // Save to localStorage for persistence
      localStorage.setItem('audio-recorder-endpoint', newEndpoint)
      logger.logConfigurationChange('endpoint', newEndpoint)
    } catch (error) {
      logger.logError('Nieprawidłowy format URL endpointu', error)
      throw new Error('Invalid endpoint URL format')
    }
  }

  // Update audio format
  const updateAudioFormat = (newFormat: AudioFormat) => {
    const validFormats: AudioFormat[] = ['webm', 'mp3', 'wav', 'ogg']
    
    if (!validFormats.includes(newFormat)) {
      logger.logError(`Nieprawidłowy format audio: ${newFormat}`)
      throw new Error('Invalid audio format')
    }
    
    audioFormat.value = newFormat
    
    // Save to localStorage for persistence
    localStorage.setItem('audio-recorder-format', newFormat)
    logger.logConfigurationChange('audioFormat', newFormat)
  }

  // Reset configuration to environment variables or defaults
  const resetConfiguration = () => {
    endpoint.value = import.meta.env.VITE_ENDPOINT_URL || ''
    audioFormat.value = (import.meta.env.VITE_AUDIO_FORMAT as AudioFormat) || 'webm'
    
    // Clear localStorage
    localStorage.removeItem('audio-recorder-endpoint')
    localStorage.removeItem('audio-recorder-format')
    
    console.log('Configuration reset to defaults')
  }

  // Load persisted configuration from localStorage
  const loadPersistedConfiguration = () => {
    try {
      // Only load from localStorage if not set via environment variables
      if (!hasEnvEndpoint) {
        const savedEndpoint = localStorage.getItem('audio-recorder-endpoint')
        if (savedEndpoint) {
          endpoint.value = savedEndpoint
        }
      }
      
      if (!hasEnvAudioFormat) {
        const savedFormat = localStorage.getItem('audio-recorder-format') as AudioFormat
        if (savedFormat && ['webm', 'mp3', 'wav', 'ogg'].includes(savedFormat)) {
          audioFormat.value = savedFormat
        }
      }
    } catch (error) {
      console.warn('Failed to load persisted configuration:', error)
    }
  }

  // Toggle configuration panel visibility
  const toggleConfiguration = () => {
    showConfiguration.value = !showConfiguration.value
  }

  // Close configuration panel
  const closeConfiguration = () => {
    showConfiguration.value = false
  }

  // Open configuration panel
  const openConfiguration = () => {
    showConfiguration.value = true
  }

  // Watch for changes and validate
  watch([endpoint, audioFormat], () => {
    // Auto-close configuration panel if configuration becomes valid
    if (isConfigurationComplete.value && showConfiguration.value) {
      // Don't auto-close to allow users to review their changes
      // showConfiguration.value = false
    }
  })

  // Export configuration details for debugging
  const getConfigurationDetails = () => {
    return {
      current: configuration.value,
      environment: {
        endpoint: import.meta.env.VITE_ENDPOINT_URL || null,
        audioFormat: import.meta.env.VITE_AUDIO_FORMAT || null
      },
      localStorage: {
        endpoint: localStorage.getItem('audio-recorder-endpoint'),
        audioFormat: localStorage.getItem('audio-recorder-format')
      },
      status: {
        isValid: isConfigurationValid.value,
        isComplete: isConfigurationComplete.value,
        showPanel: showConfiguration.value
      }
    }
  }

  // Initialize on first use
  initializeConfiguration()
  loadPersistedConfiguration()

  return {
    // State
    configuration,
    showConfiguration,
    
    // Computed
    isConfigurationValid,
    isConfigurationComplete,
    environmentStatus,
    
    // Actions
    updateEndpoint,
    updateAudioFormat,
    resetConfiguration,
    toggleConfiguration,
    closeConfiguration,
    openConfiguration,
    getConfigurationDetails
  }
}
