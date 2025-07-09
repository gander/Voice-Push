/**
 * HTTP Client Service
 * Handles audio file transmission to configured endpoints
 */

import type { AudioFormat } from '@/types'
import { useLogger } from '@/composables/useLogger'

export interface TransmissionOptions {
  endpoint: string
  audioFormat: AudioFormat
  filename?: string
  additionalFields?: Record<string, string>
}

export interface TransmissionResult {
  success: boolean
  status: number
  message: string
  responseData?: any
}

export class HttpClient {
  private readonly timeout: number = 30000 // 30 seconds
  private logger = useLogger()

  /**
   * Send audio blob to the configured endpoint
   */
  async sendAudio(audioBlob: Blob, options: TransmissionOptions): Promise<TransmissionResult> {
    const { endpoint, audioFormat, filename, additionalFields } = options

    if (!endpoint) {
      throw new Error('Endpoint URL is required')
    }

    if (!audioBlob || audioBlob.size === 0) {
      throw new Error('Audio blob is empty or invalid')
    }

    try {
      const formData = this.createFormData(audioBlob, audioFormat, filename, additionalFields)
      
      this.logger.logDebug(`Sending ${(audioBlob.size / 1024).toFixed(1)} KB to ${endpoint}`)

      const response = await this.makeRequest(endpoint, formData)
      
      return await this.handleResponse(response, endpoint)
    } catch (error) {
      this.logger.logError('Audio sending error', error)
      
      if (error instanceof Error) {
        throw error
      }
      
      throw new Error('Network error occurred while sending audio')
    }
  }

  /**
   * Create FormData object with audio file and metadata
   */
  private createFormData(
    audioBlob: Blob, 
    audioFormat: AudioFormat, 
    filename?: string,
    additionalFields?: Record<string, string>
  ): FormData {
    const formData = new FormData()
    
    // Generate filename if not provided
    const audioFilename = filename || this.generateFilename(audioFormat)
    
    // Add audio file
    formData.append('audio', audioBlob, audioFilename)
    
    // Add metadata
    formData.append('format', audioFormat)
    formData.append('timestamp', new Date().toISOString())
    formData.append('size', audioBlob.size.toString())
    formData.append('type', audioBlob.type)
    
    // Add any additional fields
    if (additionalFields) {
      Object.entries(additionalFields).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    return formData
  }

  /**
   * Make HTTP request with timeout and error handling
   */
  private async makeRequest(endpoint: string, formData: FormData): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          // Don't set Content-Type header - let browser set it with boundary for FormData
          'Accept': 'application/json, text/plain, */*'
        }
      })

      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - the endpoint took too long to respond')
      }
      
      throw error
    }
  }

  /**
   * Handle HTTP response and extract result data
   */
  private async handleResponse(response: Response, endpoint: string): Promise<TransmissionResult> {
    const result: TransmissionResult = {
      success: response.ok,
      status: response.status,
      message: response.statusText || 'Unknown error'
    }

    try {
      // Try to parse response as JSON
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        result.responseData = await response.json()
        
        // Use message from response if available
        if (result.responseData?.message) {
          result.message = result.responseData.message
        }
      } else {
        // Fallback to text response
        const textResponse = await response.text()
        if (textResponse) {
          result.message = textResponse
        }
      }
    } catch (parseError) {
      this.logger.logWarning('Server response parsing error', parseError)
      // Keep the original status message if parsing fails
    }

    // Log detailed server response
    this.logger.logServerResponse(endpoint, response.status, result.responseData, result.message)

    if (!response.ok) {
      // Enhance error message based on status code
      result.message = this.getErrorMessage(response.status, result.message)
    } else {
      result.message = result.message || 'Audio sent successfully'
    }

    return result
  }

  /**
   * Generate filename with timestamp
   */
  private generateFilename(audioFormat: AudioFormat): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const extension = this.getFileExtension(audioFormat)
    return `audio_${timestamp}.${extension}`
  }

  /**
   * Get file extension for audio format
   */
  private getFileExtension(audioFormat: AudioFormat): string {
    const extensionMap: Record<AudioFormat, string> = {
      'webm': 'webm',
      'mp3': 'mp3',
      'wav': 'wav',
      'ogg': 'ogg'
    }
    
    return extensionMap[audioFormat] || 'webm'
  }

  /**
   * Get user-friendly error message based on status code
   */
  private getErrorMessage(status: number, originalMessage: string): string {
    const statusMessages: Record<number, string> = {
      400: 'Bad request - the audio file or request format is invalid',
      401: 'Unauthorized - authentication required',
      403: 'Forbidden - access denied to the endpoint',
      404: 'Endpoint not found - check the configured URL',
      413: 'Audio file too large - try a shorter recording',
      422: 'Unprocessable entity - audio format not accepted',
      429: 'Too many requests - please wait before sending again',
      500: 'Server error - the endpoint is experiencing issues',
      502: 'Bad gateway - endpoint server is down or unreachable',
      503: 'Service unavailable - endpoint temporarily unavailable',
      504: 'Gateway timeout - endpoint server took too long to respond'
    }

    return statusMessages[status] || originalMessage || `HTTP error ${status}`
  }
}

// Singleton instance
let httpClientInstance: HttpClient | null = null

export const getHttpClient = (): HttpClient => {
  if (!httpClientInstance) {
    httpClientInstance = new HttpClient()
  }
  return httpClientInstance
}
