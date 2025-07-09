<template>
  <div class="container-fluid vh-100 d-flex flex-column">
    <header class="bg-primary text-white p-3 mb-4">
      <div class="container">
        <h1 class="h3 mb-0">
          <i data-feather="mic" class="me-2"></i>
          Push-to-Talk Audio Recorder
        </h1>
      </div>
    </header>

    <main class="flex-grow-1 d-flex flex-column">
      <div class="container">
        <!-- Configuration Panel -->
        <div class="row mb-4" v-if="showConfiguration">
          <div class="col-12">
            <ConfigurationPanel
              :endpoint="configuration.endpoint"
              :audioFormat="configuration.audioFormat"
              @update-endpoint="updateEndpoint"
              @update-format="updateAudioFormat"
              @close="showConfiguration = false"
            />
          </div>
        </div>

        <!-- Main Recording Interface -->
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <div class="card shadow-lg">
              <div class="card-body text-center p-5">
                <!-- Status Indicator -->
                <StatusIndicator
                  :status="recordingStatus"
                  :error-message="errorMessage"
                  class="mb-4"
                />

                <!-- Push-to-Talk Button -->
                <PushToTalkButton
                  :is-recording="isRecording"
                  :is-transmitting="isTransmitting"
                  :disabled="!canRecord && !needsPermission"
                  :needs-permission="needsPermission"
                  @start-recording="handleButtonClick"
                  @stop-recording="stopRecording"
                  class="mb-4"
                />

                <!-- Configuration Status -->
                <div class="mt-4">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <small class="text-muted">Endpoint:</small>
                    <small class="text-truncate ms-2" style="max-width: 200px;">
                      {{ configuration.endpoint || 'Not configured' }}
                    </small>
                  </div>
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <small class="text-muted">Format:</small>
                    <small>{{ configuration.audioFormat.toUpperCase() }}</small>
                  </div>
                  
                  <button
                    class="btn btn-outline-secondary btn-sm"
                    @click="showConfiguration = true"
                  >
                    <i data-feather="settings" class="me-1"></i>
                    Configure
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="row justify-content-center mt-4">
          <div class="col-md-8 col-lg-6">
            <div class="alert alert-info">
              <i data-feather="info" class="me-2"></i>
              <strong>Instructions:</strong>
              <ul class="mb-0 mt-2">
                <li>Hold down the microphone button to start recording</li>
                <li>Release the button to stop recording and send audio</li>
                <li>Configure endpoint and audio format in settings</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Log Panel -->
        <div class="row justify-content-center mt-4">
          <div class="col-md-10 col-lg-8">
            <LogPanel 
              :logs="logs" 
              @clear="clearLogs"
            />
          </div>
        </div>
      </div>
    </main>

    <footer class="bg-light text-center p-3 mt-auto">
      <small class="text-muted">
        Push-to-Talk Audio Recorder v1.0 | Vue.js 3 + TypeScript
      </small>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick, computed } from 'vue'
import PushToTalkButton from './components/PushToTalkButton.vue'
import ConfigurationPanel from './components/ConfigurationPanel.vue'
import StatusIndicator from './components/StatusIndicator.vue'
import LogPanel from './components/LogPanel.vue'
import { useConfiguration } from './composables/useConfiguration'
import { useAudioRecording } from './composables/useAudioRecording'
import { useLogger } from './composables/useLogger'

// Logger setup
const { logs, clearLogs, logAppStart } = useLogger()

const {
  configuration,
  showConfiguration,
  updateEndpoint,
  updateAudioFormat
} = useConfiguration()

const {
  isRecording,
  isTransmitting,
  canRecord,
  recordingStatus,
  errorMessage,
  startRecording,
  stopRecording,
  requestMicrophoneAccess
} = useAudioRecording(configuration.value)

// Computed property for button state
const needsPermission = computed(() => 
  !canRecord.value && recordingStatus.value === 'idle' && !errorMessage.value
)

// Handle button click
const handleButtonClick = async () => {
  if (needsPermission.value) {
    await requestMicrophoneAccess()
  } else if (canRecord.value) {
    await startRecording()
  }
}

onMounted(async () => {
  // Initialize app logging
  logAppStart()
  
  await nextTick()
  if (window.feather) {
    window.feather.replace()
  }
})
</script>

<style scoped>
.container-fluid {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.card {
  border: none;
  border-radius: 15px;
}

.alert {
  border-radius: 10px;
}

footer {
  border-radius: 0;
}
</style>
