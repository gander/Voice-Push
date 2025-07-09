<template>
  <div class="log-panel mt-4">
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0">
          <i data-feather="terminal" class="me-2"></i>
          Logi aplikacji
        </h6>
        <div class="d-flex gap-2">
          <button 
            @click="togglePanel" 
            class="btn btn-outline-secondary btn-sm"
            :title="isExpanded ? 'Zwiń panel' : 'Rozwiń panel'"
          >
            <i :data-feather="isExpanded ? 'chevron-up' : 'chevron-down'"></i>
          </button>
          <button 
            @click="clearLogs" 
            class="btn btn-outline-danger btn-sm"
            title="Wyczyść logi"
          >
            <i data-feather="trash-2"></i>
          </button>
          <button 
            @click="$emit('close')" 
            class="btn btn-outline-secondary btn-sm"
            title="Zamknij panel logów"
          >
            <i data-feather="x"></i>
          </button>
        </div>
      </div>
      
      <div v-show="isExpanded" class="card-body p-0">
        <div 
          ref="logContainer"
          class="log-container"
          :class="{ 'auto-scroll': autoScroll }"
        >
          <div 
            v-for="log in logs" 
            :key="log.id"
            class="log-entry"
            :class="`log-${log.level}`"
          >
            <span class="log-timestamp">{{ formatTime(log.timestamp) }}</span>
            <span class="log-level">{{ log.level.toUpperCase() }}</span>
            <span class="log-message">{{ log.message }}</span>
            <div v-if="log.details" class="log-details">
              <pre>{{ JSON.stringify(log.details, null, 2) }}</pre>
            </div>
          </div>
          
          <div v-if="logs.length === 0" class="no-logs text-muted text-center py-4">
            <i data-feather="info" class="me-2"></i>
            Brak logów do wyświetlenia
          </div>
        </div>
        
        <div class="log-controls border-top p-2">
          <div class="form-check form-check-inline">
            <input 
              class="form-check-input" 
              type="checkbox" 
              id="autoScroll" 
              v-model="autoScroll"
            >
            <label class="form-check-label" for="autoScroll">
              Automatyczne przewijanie
            </label>
          </div>
          
          <div class="form-check form-check-inline">
            <input 
              class="form-check-input" 
              type="checkbox" 
              id="showDebug" 
              v-model="showDebug"
            >
            <label class="form-check-label" for="showDebug">
              Pokaż debug
            </label>
          </div>
          
          <span class="text-muted small ms-3">
            Logi: {{ visibleLogs.length }} / {{ logs.length }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch } from 'vue'

export interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'success' | 'warning' | 'error' | 'debug'
  message: string
  details?: any
}

// Props
const props = defineProps<{
  logs: LogEntry[]
}>()

// Emits
const emit = defineEmits<{
  clear: []
  close: []
}>()

// State
const isExpanded = ref(true)
const autoScroll = ref(true)
const showDebug = ref(false)
const logContainer = ref<HTMLElement>()

// Computed
const visibleLogs = computed(() => {
  if (showDebug.value) {
    return props.logs
  }
  return props.logs.filter(log => log.level !== 'debug')
})

// Methods
const togglePanel = () => {
  isExpanded.value = !isExpanded.value
  
  if (isExpanded.value) {
    nextTick(() => {
      scrollToBottom()
    })
  }
}

const clearLogs = () => {
  emit('clear')
}

const scrollToBottom = () => {
  if (logContainer.value && autoScroll.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight
  }
}

const formatTime = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  })
}

// Watch for new logs and auto-scroll
watch(() => props.logs.length, () => {
  if (autoScroll.value && isExpanded.value) {
    nextTick(() => {
      scrollToBottom()
    })
  }
})

// Auto-expand on first log
watch(() => props.logs.length, (newLength) => {
  if (newLength === 1 && !isExpanded.value) {
    isExpanded.value = true
  }
}, { immediate: true })

onMounted(() => {
  // Initialize feather icons
  if (window.feather) {
    window.feather.replace()
  }
})
</script>

<style scoped>
.log-panel {
  max-width: 100%;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.4;
  background-color: #f8f9fa;
}

.log-entry {
  padding: 4px 12px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.log-entry:hover {
  background-color: #e9ecef;
}

.log-timestamp {
  color: #6c757d;
  font-size: 11px;
  flex-shrink: 0;
  width: 80px;
}

.log-level {
  font-weight: bold;
  flex-shrink: 0;
  width: 60px;
  font-size: 11px;
}

.log-message {
  flex: 1;
  word-break: break-word;
}

.log-details {
  width: 100%;
  margin-top: 4px;
}

.log-details pre {
  background-color: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 8px;
  margin: 0;
  font-size: 11px;
  max-height: 150px;
  overflow-y: auto;
}

/* Log level colors */
.log-info .log-level {
  color: #0d6efd;
}

.log-success .log-level {
  color: #198754;
}

.log-warning .log-level {
  color: #fd7e14;
}

.log-error .log-level {
  color: #dc3545;
}

.log-debug .log-level {
  color: #6f42c1;
}

.log-error {
  background-color: #fff5f5;
}

.log-success {
  background-color: #f0fff4;
}

.log-warning {
  background-color: #fffbf0;
}

.log-controls {
  background-color: #ffffff;
  font-size: 13px;
}

.no-logs {
  padding: 2rem 1rem;
}

.auto-scroll {
  scroll-behavior: smooth;
}

/* Responsive */
@media (max-width: 768px) {
  .log-container {
    max-height: 200px;
  }
  
  .log-entry {
    flex-direction: column;
    gap: 2px;
  }
  
  .log-timestamp,
  .log-level {
    width: auto;
  }
}
</style>