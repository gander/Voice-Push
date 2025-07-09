<template>
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="card-title mb-0">
        <i data-feather="settings" class="me-2"></i>
        Configuration
      </h5>
      <button
        type="button"
        class="btn-close"
        @click="$emit('close')"
        aria-label="Close"
      ></button>
    </div>
    
    <div class="card-body">
      <form @submit.prevent="saveConfiguration">
        <!-- Endpoint Configuration -->
        <div class="mb-4">
          <label for="endpoint" class="form-label">
            <i data-feather="link" class="me-1"></i>
            Endpoint URL
          </label>
          <input
            id="endpoint"
            v-model="localEndpoint"
            type="url"
            class="form-control"
            placeholder="https://your-endpoint.com/webhook"
            required
          />
          <div class="form-text">
            Enter the URL where audio files will be sent (e.g., n8n webhook, Make.com webhook)
          </div>
        </div>

        <!-- Audio Format Configuration -->
        <div class="mb-4">
          <label for="audioFormat" class="form-label">
            <i data-feather="music" class="me-1"></i>
            Audio Format
          </label>
          <select
            id="audioFormat"
            v-model="localAudioFormat"
            class="form-select"
            required
          >
            <option value="">Select audio format</option>
            <option
              v-for="format in availableFormats"
              :key="format.value"
              :value="format.value"
              :disabled="!format.supported"
            >
              {{ format.label }}
              {{ !format.supported ? ' (Not supported)' : '' }}
            </option>
          </select>
          <div class="form-text">
            Choose the audio format for recording. WebM is recommended for best compatibility.
          </div>
        </div>

        <!-- Browser Support Information -->
        <div class="mb-4">
          <div class="alert alert-info">
            <i data-feather="info" class="me-2"></i>
            <strong>Browser Support:</strong>
            <ul class="mb-0 mt-2">
              <li v-for="format in availableFormats" :key="format.value">
                <strong>{{ format.label }}:</strong>
                <span :class="format.supported ? 'text-success' : 'text-danger'">
                  {{ format.supported ? 'Supported' : 'Not supported' }}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Environment Variables Info -->
        <div class="mb-4" v-if="envVariablesDetected">
          <div class="alert alert-warning">
            <i data-feather="alert-triangle" class="me-2"></i>
            <strong>Environment Variables Detected:</strong>
            Some settings are configured via environment variables. 
            UI changes will override these settings for this session only.
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="d-flex justify-content-end gap-2">
          <button
            type="button"
            class="btn btn-secondary"
            @click="resetToDefaults"
          >
            <i data-feather="rotate-ccw" class="me-1"></i>
            Reset
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="!isFormValid"
          >
            <i data-feather="save" class="me-1"></i>
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import type { AudioFormat } from '@/types'
import { checkFormatSupport } from '@/utils/mimeTypes'

interface Props {
  endpoint: string
  audioFormat: AudioFormat
}

interface Emits {
  (e: 'update-endpoint', endpoint: string): void
  (e: 'update-format', format: AudioFormat): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localEndpoint = ref(props.endpoint)
const localAudioFormat = ref(props.audioFormat)

const availableFormats = ref([
  { value: 'webm' as AudioFormat, label: 'WebM', supported: false },
  { value: 'mp3' as AudioFormat, label: 'MP3', supported: false },
  { value: 'wav' as AudioFormat, label: 'WAV', supported: false },
  { value: 'ogg' as AudioFormat, label: 'OGG', supported: false }
])

const envVariablesDetected = computed(() => {
  return !!(import.meta.env.VITE_ENDPOINT_URL || import.meta.env.VITE_AUDIO_FORMAT)
})

const isFormValid = computed(() => {
  return localEndpoint.value.trim() !== '' && !!localAudioFormat.value
})

const checkBrowserSupport = () => {
  availableFormats.value.forEach(format => {
    format.supported = checkFormatSupport(format.value)
  })
}

const saveConfiguration = () => {
  if (isFormValid.value) {
    emit('update-endpoint', localEndpoint.value.trim())
    emit('update-format', localAudioFormat.value)
    emit('close')
  }
}

const resetToDefaults = () => {
  localEndpoint.value = import.meta.env.VITE_ENDPOINT_URL || ''
  localAudioFormat.value = (import.meta.env.VITE_AUDIO_FORMAT as AudioFormat) || 'webm'
}

// Watch for prop changes
watch(() => props.endpoint, (newEndpoint) => {
  localEndpoint.value = newEndpoint
})

watch(() => props.audioFormat, (newFormat) => {
  localAudioFormat.value = newFormat
})

// Update Feather icons when component mounts
watch([localEndpoint, localAudioFormat], async () => {
  await nextTick()
  if (window.feather) {
    window.feather.replace()
  }
})

onMounted(async () => {
  checkBrowserSupport()
  await nextTick()
  if (window.feather) {
    window.feather.replace()
  }
})
</script>

<style scoped>
.card {
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
  border-radius: 10px 10px 0 0;
}

.form-label {
  font-weight: 600;
  color: #495057;
}

.form-control, .form-select {
  border-radius: 8px;
  border: 1px solid #ced4da;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus, .form-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.alert {
  border-radius: 8px;
}

.btn {
  border-radius: 6px;
}

.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}
</style>
