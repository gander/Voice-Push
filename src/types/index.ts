/**
 * Type definitions for the Push-to-Talk Audio Recorder application
 */

// Audio format types supported by the application
export type AudioFormat = 'webm' | 'mp3' | 'wav' | 'ogg'

// Recording status for UI feedback
export type RecordingStatus = 'idle' | 'recording' | 'transmitting' | 'success' | 'error'

// Configuration interface
export interface AppConfiguration {
  endpoint: string
  audioFormat: AudioFormat
}

// Audio format information for UI
export interface AudioFormatInfo {
  value: AudioFormat
  label: string
  mimeType: string
  supported: boolean
  description?: string
}

// Recording session metadata
export interface RecordingSession {
  id: string
  startTime: Date
  endTime?: Date
  format: AudioFormat
  size?: number
  duration?: number
  endpoint: string
  status: 'recording' | 'completed' | 'failed' | 'transmitted'
}

// HTTP transmission result
export interface TransmissionResult {
  success: boolean
  status: number
  message: string
  timestamp: Date
  endpoint: string
  audioSize: number
  responseData?: any
}

// Error information
export interface AppError {
  code: string
  message: string
  timestamp: Date
  details?: any
}

// Browser capabilities
export interface BrowserCapabilities {
  mediaRecorder: boolean
  getUserMedia: boolean
  supportedFormats: AudioFormat[]
  preferredFormat: AudioFormat
}

// Environment configuration
export interface EnvironmentConfig {
  endpointUrl?: string
  audioFormat?: AudioFormat
  debug?: boolean
}

// Component props interfaces
export interface PushToTalkButtonProps {
  isRecording: boolean
  isTransmitting: boolean
  disabled: boolean
}

export interface ConfigurationPanelProps {
  endpoint: string
  audioFormat: AudioFormat
}

export interface StatusIndicatorProps {
  status: RecordingStatus
  errorMessage?: string
}

// Event types for component communication
export interface AudioRecordingEvents {
  'start-recording': void
  'stop-recording': void
  'recording-error': AppError
  'transmission-complete': TransmissionResult
}

export interface ConfigurationEvents {
  'update-endpoint': string
  'update-format': AudioFormat
  'reset-configuration': void
  'close': void
}

// Utility types
export type VoidFunction = () => void
export type AsyncVoidFunction = () => Promise<void>

// Media recorder options
export interface MediaRecorderOptions {
  mimeType: string
  audioBitsPerSecond?: number
  videoBitsPerSecond?: number
  bitsPerSecond?: number
}

// Audio constraints for getUserMedia
export interface AudioConstraints {
  echoCancellation?: boolean
  noiseSuppression?: boolean
  autoGainControl?: boolean
  sampleRate?: number
  channelCount?: number
}

// HTTP client configuration
export interface HttpClientConfig {
  timeout: number
  retries: number
  headers?: Record<string, string>
}

// Form data fields for audio transmission
export interface AudioTransmissionFields {
  audio: Blob
  format: AudioFormat
  timestamp: string
  size: string
  type: string
  filename: string
  [key: string]: string | Blob
}

// Validation result
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

// Storage interface for configuration persistence
export interface ConfigurationStorage {
  get(key: string): string | null
  set(key: string, value: string): void
  remove(key: string): void
  clear(): void
}

// Composable return types
export interface UseConfigurationReturn {
  configuration: AppConfiguration
  showConfiguration: boolean
  isConfigurationValid: boolean
  isConfigurationComplete: boolean
  environmentStatus: {
    hasEnvEndpoint: boolean
    hasEnvAudioFormat: boolean
    hasAnyEnvConfig: boolean
  }
  updateEndpoint: (endpoint: string) => void
  updateAudioFormat: (format: AudioFormat) => void
  resetConfiguration: VoidFunction
  toggleConfiguration: VoidFunction
  closeConfiguration: VoidFunction
  openConfiguration: VoidFunction
  getConfigurationDetails: () => any
}

export interface UseAudioRecordingReturn {
  isRecording: boolean
  isTransmitting: boolean
  canRecord: boolean
  recordingStatus: RecordingStatus
  errorMessage: string
  isActive: boolean
  statusText: string
  startRecording: AsyncVoidFunction
  stopRecording: AsyncVoidFunction
  resetRecording: VoidFunction
  clearError: VoidFunction
  initializeRecorder: AsyncVoidFunction
  generateFilename: () => string
  checkRecorderHealth: VoidFunction
}
