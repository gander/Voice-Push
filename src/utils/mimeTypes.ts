/**
 * MIME Type Utilities
 * Handles audio format to MIME type conversion and browser support detection
 */

import type { AudioFormat, AudioFormatInfo } from '@/types'

// MIME type mappings for different audio formats
const MIME_TYPE_MAP: Record<AudioFormat, string[]> = {
  webm: [
    'audio/webm;codecs=opus',
    'audio/webm;codecs=vorbis',
    'audio/webm'
  ],
  mp3: [
    'audio/mp3',
    'audio/mpeg'
  ],
  wav: [
    'audio/wav',
    'audio/wave',
    'audio/x-wav'
  ],
  ogg: [
    'audio/ogg;codecs=opus',
    'audio/ogg;codecs=vorbis',
    'audio/ogg'
  ]
}

/**
 * Get the preferred MIME type for a given audio format
 */
export function getMimeType(format: AudioFormat): string {
  const mimeTypes = MIME_TYPE_MAP[format]
  
  if (!mimeTypes || mimeTypes.length === 0) {
    throw new Error(`Unsupported audio format: ${format}`)
  }
  
  // Return the first supported MIME type
  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType
    }
  }
  
  // Fallback to the first MIME type if none are explicitly supported
  return mimeTypes[0]
}

/**
 * Check if a specific audio format is supported by the browser
 */
export function checkFormatSupport(format: AudioFormat): boolean {
  const mimeTypes = MIME_TYPE_MAP[format]
  
  if (!mimeTypes || mimeTypes.length === 0) {
    return false
  }
  
  // Check if any of the MIME types for this format are supported
  return mimeTypes.some(mimeType => MediaRecorder.isTypeSupported(mimeType))
}

/**
 * Get all supported audio formats for the current browser
 */
export function getSupportedFormats(): AudioFormat[] {
  const formats: AudioFormat[] = ['webm', 'mp3', 'wav', 'ogg']
  return formats.filter(format => checkFormatSupport(format))
}

/**
 * Get detailed information about all audio formats
 */
export function getAudioFormatInfo(): AudioFormatInfo[] {
  return [
    {
      value: 'webm',
      label: 'WebM',
      mimeType: getMimeType('webm'),
      supported: checkFormatSupport('webm'),
      description: 'Modern web format with good compression and quality'
    },
    {
      value: 'mp3',
      label: 'MP3',
      mimeType: getMimeType('mp3'),
      supported: checkFormatSupport('mp3'),
      description: 'Universal format with wide compatibility'
    },
    {
      value: 'wav',
      label: 'WAV',
      mimeType: getMimeType('wav'),
      supported: checkFormatSupport('wav'),
      description: 'Uncompressed format with highest quality'
    },
    {
      value: 'ogg',
      label: 'OGG',
      mimeType: getMimeType('ogg'),
      supported: checkFormatSupport('ogg'),
      description: 'Open source format with good compression'
    }
  ]
}

/**
 * Get the recommended audio format for the current browser
 */
export function getRecommendedFormat(): AudioFormat {
  const supportedFormats = getSupportedFormats()
  
  // Priority order: webm > ogg > mp3 > wav
  const priorityOrder: AudioFormat[] = ['webm', 'ogg', 'mp3', 'wav']
  
  for (const format of priorityOrder) {
    if (supportedFormats.includes(format)) {
      return format
    }
  }
  
  // Fallback to first supported format
  return supportedFormats[0] || 'webm'
}

/**
 * Get file extension for audio format
 */
export function getFileExtension(format: AudioFormat): string {
  const extensionMap: Record<AudioFormat, string> = {
    webm: 'webm',
    mp3: 'mp3',
    wav: 'wav',
    ogg: 'ogg'
  }
  
  return extensionMap[format] || 'webm'
}

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromExtension(extension: string): string | null {
  const normalizedExt = extension.toLowerCase().replace('.', '')
  
  for (const [format, mimeTypes] of Object.entries(MIME_TYPE_MAP)) {
    if (format === normalizedExt) {
      return mimeTypes[0]
    }
  }
  
  return null
}

/**
 * Validate audio format
 */
export function isValidAudioFormat(format: string): format is AudioFormat {
  return ['webm', 'mp3', 'wav', 'ogg'].includes(format)
}

/**
 * Get format-specific encoding options
 */
export function getEncodingOptions(format: AudioFormat): {
  audioBitsPerSecond?: number
  sampleRate?: number
} {
  const optionsMap: Record<AudioFormat, { audioBitsPerSecond?: number; sampleRate?: number }> = {
    webm: {
      audioBitsPerSecond: 128000, // 128 kbps
      sampleRate: 48000
    },
    mp3: {
      audioBitsPerSecond: 128000, // 128 kbps
      sampleRate: 44100
    },
    wav: {
      audioBitsPerSecond: 1411200, // CD quality
      sampleRate: 44100
    },
    ogg: {
      audioBitsPerSecond: 128000, // 128 kbps
      sampleRate: 48000
    }
  }
  
  return optionsMap[format] || {}
}

/**
 * Check browser capabilities for audio recording
 */
export function checkBrowserCapabilities() {
  const capabilities = {
    mediaRecorder: typeof MediaRecorder !== 'undefined',
    getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    supportedFormats: getSupportedFormats(),
    recommendedFormat: getRecommendedFormat()
  }
  
  return {
    ...capabilities,
    isSupported: capabilities.mediaRecorder && capabilities.getUserMedia && capabilities.supportedFormats.length > 0
  }
}

/**
 * Debug function to log all format support information
 */
export function logFormatSupport(): void {
  console.group('Audio Format Support Information')
  
  const formats: AudioFormat[] = ['webm', 'mp3', 'wav', 'ogg']
  
  formats.forEach(format => {
    const mimeTypes = MIME_TYPE_MAP[format]
    console.group(`${format.toUpperCase()} Format`)
    
    mimeTypes.forEach(mimeType => {
      const supported = MediaRecorder.isTypeSupported(mimeType)
      console.log(`${mimeType}: ${supported ? '✅ Supported' : '❌ Not supported'}`)
    })
    
    console.groupEnd()
  })
  
  console.log('Recommended format:', getRecommendedFormat())
  console.log('Supported formats:', getSupportedFormats())
  
  console.groupEnd()
}
