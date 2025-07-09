/**
 * Logger Composable
 * Centralized logging system for the application with different log levels
 */
import { ref, readonly } from 'vue'
import type { LogEntry } from '../components/LogPanel.vue'

// Global state for logs
const logs = ref<LogEntry[]>([])
let logIdCounter = 0

export function useLogger() {
  
  // Generate unique log ID
  const generateLogId = (): string => {
    return `log-${Date.now()}-${++logIdCounter}`
  }

  // Create log entry
  const createLogEntry = (
    level: LogEntry['level'],
    message: string,
    details?: any
  ): LogEntry => {
    return {
      id: generateLogId(),
      timestamp: new Date(),
      level,
      message,
      details
    }
  }

  // Add log entry
  const addLog = (entry: LogEntry) => {
    logs.value.push(entry)
    
    // Keep only last 500 logs to prevent memory issues
    if (logs.value.length > 500) {
      logs.value = logs.value.slice(-500)
    }
  }

  // Log methods
  const logInfo = (message: string, details?: any) => {
    const entry = createLogEntry('info', message, details)
    addLog(entry)
    console.log(`[INFO] ${message}`, details || '')
  }

  const logSuccess = (message: string, details?: any) => {
    const entry = createLogEntry('success', message, details)
    addLog(entry)
    console.log(`[SUCCESS] ${message}`, details || '')
  }

  const logWarning = (message: string, details?: any) => {
    const entry = createLogEntry('warning', message, details)
    addLog(entry)
    console.warn(`[WARNING] ${message}`, details || '')
  }

  const logError = (message: string, error?: any) => {
    const entry = createLogEntry('error', message, error)
    addLog(entry)
    console.error(`[ERROR] ${message}`, error || '')
  }

  const logDebug = (message: string, details?: any) => {
    const entry = createLogEntry('debug', message, details)
    addLog(entry)
    console.debug(`[DEBUG] ${message}`, details || '')
  }

  // Clear logs
  const clearLogs = () => {
    logs.value = []
    // Don't log clearing action to avoid unnecessary noise
  }

  // Audio-specific logging methods
  const logAudioEvent = (event: string, details?: any) => {
    logInfo(`Audio: ${event}`, details)
  }

  const logRecordingStart = (format: string) => {
    logSuccess(`Rozpoczęto nagrywanie w formacie ${format.toUpperCase()}`)
  }

  const logRecordingStop = (duration: number, size: number) => {
    logSuccess(`Zakończono nagrywanie (${duration.toFixed(1)}s, ${(size / 1024).toFixed(1)} KB)`)
  }

  const logTransmissionStart = (endpoint: string) => {
    logInfo(`Rozpoczęto wysyłanie do: ${endpoint}`)
  }

  const logTransmissionSuccess = (endpoint: string, result: any) => {
    const statusCode = result?.status || 'unknown'
    const message = result?.message || 'Success'
    logSuccess(`Pomyślnie wysłano do: ${endpoint} (${statusCode})`, {
      status: statusCode,
      message: message,
      responseData: result?.responseData,
      endpoint: endpoint
    })
  }

  const logTransmissionError = (endpoint: string, error: any) => {
    logError(`Błąd wysyłania do: ${endpoint}`, error)
  }

  const logServerResponse = (endpoint: string, status: number, responseData: any, responseText?: string) => {
    if (status >= 200 && status < 300) {
      logSuccess(`Odpowiedź serwera ${status}: ${responseText || 'OK'}`, {
        endpoint,
        status,
        data: responseData
      })
    } else if (status >= 400 && status < 500) {
      logWarning(`Błąd klienta ${status}: ${responseText || 'Client Error'}`, {
        endpoint,
        status,
        data: responseData
      })
    } else if (status >= 500) {
      logError(`Błąd serwera ${status}: ${responseText || 'Server Error'}`, {
        endpoint,
        status,
        data: responseData
      })
    } else {
      logInfo(`Odpowiedź serwera ${status}: ${responseText || 'Unknown'}`, {
        endpoint,
        status,
        data: responseData
      })
    }
  }

  const logPermissionRequest = () => {
    logInfo('Żądanie uprawnień do mikrofonu...')
  }

  const logPermissionGranted = () => {
    logSuccess('Uzyskano uprawnienia do mikrofonu')
  }

  const logPermissionDenied = () => {
    logError('Odmówiono uprawnień do mikrofonu')
  }

  const logConfigurationChange = (field: string, value: any) => {
    logInfo(`Zmieniono konfigurację: ${field} = ${value}`)
  }

  const logBrowserSupport = (format: string, supported: boolean) => {
    if (supported) {
      logDebug(`Format ${format.toUpperCase()} jest obsługiwany`)
    } else {
      logWarning(`Format ${format.toUpperCase()} nie jest obsługiwany`)
    }
  }

  const logRecorderState = (state: string) => {
    logDebug(`Stan nagrywania: ${state}`)
  }

  const logHttpRequest = (method: string, url: string, status?: number) => {
    if (status) {
      if (status >= 200 && status < 300) {
        logDebug(`${method} ${url} - ${status} OK`)
      } else {
        logWarning(`${method} ${url} - ${status}`)
      }
    } else {
      logDebug(`${method} ${url}`)
    }
  }

  const logInitialization = (component: string, success: boolean = true) => {
    if (success) {
      logInfo(`Zainicjalizowano: ${component}`)
    } else {
      logError(`Błąd inicjalizacji: ${component}`)
    }
  }

  // System startup logs
  const logAppStart = () => {
    clearLogs()
    // Only log essential startup information, skip verbose system details
    logSuccess('Aplikacja gotowa do użycia')
  }

  return {
    // State
    logs: readonly(logs),
    
    // Basic logging
    logInfo,
    logSuccess,
    logWarning,
    logError,
    logDebug,
    clearLogs,
    
    // Audio-specific logging
    logAudioEvent,
    logRecordingStart,
    logRecordingStop,
    logTransmissionStart,
    logTransmissionSuccess,
    logTransmissionError,
    logPermissionRequest,
    logPermissionGranted,
    logPermissionDenied,
    logConfigurationChange,
    logBrowserSupport,
    logRecorderState,
    logHttpRequest,
    logInitialization,
    logAppStart,
    logServerResponse
  }
}