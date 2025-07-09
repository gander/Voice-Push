<template>
  <div class="status-indicator">
    <div class="status-icon mb-2">
      <i 
        :data-feather="getStatusIcon()" 
        :class="getStatusIconClass()"
        class="status-icon-element"
      ></i>
    </div>
    
    <div class="status-message">
      <h6 class="status-title" :class="getStatusTextClass()">
        {{ getStatusTitle() }}
      </h6>
      <p class="status-description text-muted mb-0">
        {{ getStatusDescription() }}
      </p>
    </div>

    <!-- Error Alert -->
    <div v-if="errorMessage" class="alert alert-danger mt-3 mb-0">
      <i data-feather="alert-circle" class="me-2"></i>
      <strong>Error:</strong> {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick, watch } from 'vue'
import type { RecordingStatus } from '@/types'

interface Props {
  status: RecordingStatus
  errorMessage?: string
}

const props = defineProps<Props>()

const getStatusIcon = (): string => {
  switch (props.status) {
    case 'idle':
      return 'circle'
    case 'recording':
      return 'mic'
    case 'transmitting':
      return 'upload'
    case 'success':
      return 'check-circle'
    case 'error':
      return 'x-circle'
    default:
      return 'circle'
  }
}

const getStatusIconClass = (): string => {
  const baseClass = 'status-icon-element'
  switch (props.status) {
    case 'idle':
      return `${baseClass} text-secondary`
    case 'recording':
      return `${baseClass} text-danger recording-pulse`
    case 'transmitting':
      return `${baseClass} text-warning transmitting-spin`
    case 'success':
      return `${baseClass} text-success`
    case 'error':
      return `${baseClass} text-danger`
    default:
      return `${baseClass} text-secondary`
  }
}

const getStatusTextClass = (): string => {
  switch (props.status) {
    case 'idle':
      return 'text-secondary'
    case 'recording':
      return 'text-danger'
    case 'transmitting':
      return 'text-warning'
    case 'success':
      return 'text-success'
    case 'error':
      return 'text-danger'
    default:
      return 'text-secondary'
  }
}

const getStatusTitle = (): string => {
  switch (props.status) {
    case 'idle':
      return 'Ready to Record'
    case 'recording':
      return 'Recording Audio'
    case 'transmitting':
      return 'Sending Audio'
    case 'success':
      return 'Audio Sent Successfully'
    case 'error':
      return 'Error Occurred'
    default:
      return 'Unknown Status'
  }
}

const getStatusDescription = (): string => {
  switch (props.status) {
    case 'idle':
      return 'Press and hold the button to start recording'
    case 'recording':
      return 'Recording in progress... Release to stop and send'
    case 'transmitting':
      return 'Uploading audio file to configured endpoint'
    case 'success':
      return 'Audio file has been successfully transmitted'
    case 'error':
      return 'An error occurred during recording or transmission'
    default:
      return ''
  }
}

// Update Feather icons when status changes
watch(() => props.status, async () => {
  await nextTick()
  if (window.feather) {
    window.feather.replace()
  }
})

watch(() => props.errorMessage, async () => {
  await nextTick()
  if (window.feather) {
    window.feather.replace()
  }
})

onMounted(async () => {
  await nextTick()
  if (window.feather) {
    window.feather.replace()
  }
})
</script>

<style scoped>
.status-indicator {
  text-align: center;
}

.status-icon {
  position: relative;
}

.status-icon-element {
  width: 48px;
  height: 48px;
  transition: all 0.3s ease;
}

.status-title {
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.status-description {
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Animation for recording state */
.recording-pulse {
  animation: pulse-icon 1.5s ease-in-out infinite;
}

@keyframes pulse-icon {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

/* Animation for transmitting state */
.transmitting-spin {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Alert styling */
.alert {
  border-radius: 8px;
  font-size: 0.9rem;
}

.alert-danger {
  background-color: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .status-icon-element {
    width: 40px;
    height: 40px;
  }
  
  .status-title {
    font-size: 1rem;
  }
  
  .status-description {
    font-size: 0.8rem;
  }
}
</style>
